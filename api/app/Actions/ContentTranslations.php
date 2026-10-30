<?php

namespace App\Actions;

use App\Models\Area;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Designer;
use App\Models\Finish;
use App\Models\FinishGroup;
use App\Models\Launch;
use App\Models\Line;
use App\Models\MediaLink;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductFile;
use App\Models\Project;
use App\Models\Scene;
use App\Models\Store;
use App\Support\Locales;
use App\Support\RichText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Exports the content still missing a translation and imports translated texts back, matching each one by model,
 * field and the Portuguese text (never by id), so a file made from one database applies to any copy of it.
 *
 * An import only fills empty fields unless `force` is set, so whatever was written in the panel always wins. It also
 * creates the slug in the target language from the translated name or title, keeping it unique.
 */
final class ContentTranslations
{
    /** @var array<string, class-string<Model>> */
    public const MODELS = [
        'area' => Area::class,
        'banner' => Banner::class,
        'category' => Category::class,
        'collection' => Collection::class,
        'designer' => Designer::class,
        'finish' => Finish::class,
        'finish_group' => FinishGroup::class,
        'launch' => Launch::class,
        'line' => Line::class,
        'media_link' => MediaLink::class,
        'page' => Page::class,
        'product' => Product::class,
        'product_file' => ProductFile::class,
        'project' => Project::class,
        'scene' => Scene::class,
        'store' => Store::class,
    ];

    /** JSON columns that keep `{pt, en}` pairs deep inside (page blocks, product dimension labels). */
    private const STRUCTURED = [
        'page' => ['content'],
        'product' => ['dimensions'],
    ];

    /** Field the slug in the new language is made from. */
    private const SLUG_SOURCE = [
        'category' => 'name',
        'collection' => 'name',
        'launch' => 'title',
        'product' => 'name',
        'project' => 'title',
    ];

    /**
     * Every text with Portuguese filled in and the target language empty.
     *
     * @return list<array{model: string, id: int|string, field: string, pt: string}>
     */
    public function export(string $locale): array
    {
        $source = Locales::default();
        $items = [];

        foreach (self::MODELS as $alias => $class) {
            $class::query()->orderBy((new $class)->getKeyName())->each(function (Model $record) use ($alias, $source, $locale, &$items) {
                foreach ($this->translatableFields($record) as $field) {
                    $pt = $this->text($record->getTranslation($field, $source, false));
                    $target = $this->text($record->getTranslation($field, $locale, false));

                    if ($pt !== null && $target === null) {
                        $items[] = ['model' => $alias, 'id' => $record->getKey(), 'field' => $field, 'pt' => $pt];
                    }
                }

                foreach (self::STRUCTURED[$alias] ?? [] as $field) {
                    foreach ($this->pairs($record->getAttribute($field) ?? [], $source, $locale) as [$pt, $target]) {
                        if ($target === null) {
                            $items[] = ['model' => $alias, 'id' => $record->getKey(), 'field' => $field, 'pt' => $pt];
                        }
                    }
                }
            });
        }

        return $items;
    }

    /**
     * @param  iterable<array{model?: string, field?: string, pt?: string, en?: ?string}>  $items  translated texts
     * @return array{updated_records: int, filled: int, kept: int, slugs: int, unmatched: int}
     */
    public function import(iterable $items, string $locale, bool $force = false, bool $dryRun = false): array
    {
        $source = Locales::default();
        $map = [];

        foreach ($items as $item) {
            $value = $this->text($item[$locale] ?? null);

            if (isset(self::MODELS[$item['model'] ?? '']) && filled($item['field'] ?? null) && $this->text($item['pt'] ?? null) !== null && $value !== null) {
                $map[$item['model']][$item['field']][trim((string) $item['pt'])] = $value;
            }
        }

        $counts = ['updated_records' => 0, 'filled' => 0, 'kept' => 0, 'slugs' => 0, 'unmatched' => 0];
        $used = [];

        foreach ($map as $alias => $fields) {
            $class = self::MODELS[$alias];

            $class::query()->each(function (Model $record) use ($alias, $fields, $source, $locale, $force, $dryRun, &$counts, &$used) {
                $changed = false;
                $translatable = $this->translatableFields($record);

                foreach ($fields as $field => $texts) {
                    if (in_array($field, self::STRUCTURED[$alias] ?? [], true)) {
                        [$tree, $filled, $kept] = $this->fillTree($record->getAttribute($field) ?? [], $texts, $source, $locale, $force, $used, $alias, $field);
                        $counts['filled'] += $filled;
                        $counts['kept'] += $kept;
                        if ($filled > 0) {
                            $record->setAttribute($field, $tree);
                            $changed = true;
                        }

                        continue;
                    }

                    if (! in_array($field, $translatable, true)) {
                        continue;
                    }

                    $pt = $this->lookup($texts, $record->getTranslation($field, $source, false));
                    if ($pt === null) {
                        continue;
                    }

                    $used[$alias][$field][$pt] = true;

                    if (! $force && $this->text($record->getTranslation($field, $locale, false)) !== null) {
                        $counts['kept']++;

                        continue;
                    }

                    $record->setTranslation($field, $locale, $texts[$pt]);
                    $counts['filled']++;
                    $changed = true;
                }

                if ($this->fillSlug($record, $alias, $locale, $force)) {
                    $counts['slugs']++;
                    $changed = true;
                }

                if ($changed) {
                    $counts['updated_records']++;
                    if (! $dryRun) {
                        // Normal save: keeps the product search text, the activity log and the site revalidation.
                        $record->save();
                    }
                }
            });
        }

        foreach ($map as $alias => $fields) {
            foreach ($fields as $field => $texts) {
                $counts['unmatched'] += count(array_diff_key($texts, $used[$alias][$field] ?? []));
            }
        }

        return $counts;
    }

    /** @return list<string> */
    private function translatableFields(Model $record): array
    {
        $fields = method_exists($record, 'getTranslatableAttributes') ? $record->getTranslatableAttributes() : [];

        return array_values(array_filter($fields, fn (string $field): bool => $field !== 'slug'));
    }

    /**
     * Fills the target language of `{pt, en}` pairs found anywhere in a JSON tree.
     *
     * @param  array<array-key, mixed>  $tree
     * @param  array<string, string>  $texts
     * @param  array<string, array<string, array<string, bool>>>  $used
     * @return array{0: array<array-key, mixed>, 1: int, 2: int}
     */
    private function fillTree(array $tree, array $texts, string $source, string $locale, bool $force, array &$used, string $alias, string $field): array
    {
        $filled = 0;
        $kept = 0;

        $walk = function (array $node) use (&$walk, $texts, $source, $locale, $force, &$filled, &$kept, &$used, $alias, $field): array {
            $pt = array_key_exists($source, $node) ? $this->lookup($texts, $node[$source]) : null;

            if ($pt !== null) {
                $used[$alias][$field][$pt] = true;

                if ($force || $this->text($node[$locale] ?? null) === null) {
                    $node[$locale] = $texts[$pt];
                    $filled++;
                } else {
                    $kept++;
                }
            }

            foreach ($node as $key => $child) {
                if (is_array($child)) {
                    $node[$key] = $walk($child);
                }
            }

            return $node;
        };

        return [$walk($tree), $filled, $kept];
    }

    /**
     * `[pt, target]` of every `{pt, en}` pair in a JSON tree.
     *
     * @param  array<array-key, mixed>  $tree
     * @return list<array{0: string, 1: ?string}>
     */
    private function pairs(array $tree, string $source, string $locale): array
    {
        $pairs = [];
        $pt = array_key_exists($source, $tree) ? $this->text($tree[$source]) : null;

        if ($pt !== null) {
            $pairs[] = [$pt, $this->text($tree[$locale] ?? null)];
        }

        foreach ($tree as $child) {
            if (is_array($child)) {
                array_push($pairs, ...$this->pairs($child, $source, $locale));
            }
        }

        return $pairs;
    }

    private function fillSlug(Model $record, string $alias, string $locale, bool $force): bool
    {
        $sourceField = self::SLUG_SOURCE[$alias] ?? null;

        if ($sourceField === null || ! method_exists($record, 'getTranslation') || ! method_exists($record, 'setTranslation')) {
            return false;
        }

        $name = $this->text($record->getTranslation($sourceField, $locale, false));
        $current = $this->text($record->getTranslation('slug', $locale, false));

        if ($name === null || ($current !== null && ! $force)) {
            return false;
        }

        $base = Str::slug($name) ?: (string) $record->getKey();
        $slug = $base;
        $suffix = 2;

        while ($record::query()->whereKeyNot($record->getKey())->where("slug->{$locale}", $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        if ($slug === $current) {
            return false;
        }

        $record->setTranslation('slug', $locale, $slug);

        return true;
    }

    /**
     * Key of `$texts` for a stored Portuguese value. Files made from the public API carry the sanitized HTML, so the
     * sanitized form of the stored value is tried too.
     *
     * @param  array<string, string>  $texts
     */
    private function lookup(array $texts, mixed $value): ?string
    {
        $text = $this->text($value);

        if ($text === null) {
            return null;
        }

        if (array_key_exists($text, $texts)) {
            return $text;
        }

        $sanitized = $this->text(RichText::sanitize($text));

        return $sanitized !== null && array_key_exists($sanitized, $texts) ? $sanitized : null;
    }

    private function text(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }
}
