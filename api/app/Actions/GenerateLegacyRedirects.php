<?php

namespace App\Actions;

use App\Enums\RedirectStatus;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Designer;
use App\Models\Line;
use App\Models\Product;
use App\Models\Project;
use App\Models\Redirect;
use App\Support\FrontendRevalidator;
use App\Support\Migration\LegacyPath;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * P5b Task 3: fills `redirects` with the old site's URLs (`legacy_url` of each migrated record, plus the
 * fixed paths in `config('franccino.legacy')`). Generated rows carry `notes = 'gerado: …'`; a row without that
 * marker was edited in the panel and is never touched. Generated rows whose record is gone or unpublished
 * are deactivated. Idempotent: upsert by `from_path`.
 */
class GenerateLegacyRedirects
{
    public const MARKER = 'gerado:';

    public function __construct(private readonly FrontendRevalidator $revalidator) {}

    /**
     * @return array{created: int, updated: int, unchanged: int, deactivated: int, preserved: int}
     */
    public function handle(bool $dryRun = false): array
    {
        $rules = $this->rules();
        $counts = ['created' => 0, 'updated' => 0, 'unchanged' => 0, 'deactivated' => 0, 'preserved' => 0];

        DB::transaction(function () use ($rules, $dryRun, &$counts) {
            $existing = Redirect::query()->whereIn('from_path', array_keys($rules))->get()->keyBy('from_path');

            foreach ($rules as $from => $rule) {
                $row = $existing->get($from);
                if ($row !== null && ! $this->isGenerated($row)) {
                    $counts['preserved']++;

                    continue;
                }
                $attributes = [...$rule, 'is_active' => true];
                if ($row === null) {
                    $counts['created']++;
                    $dryRun || Redirect::create(['from_path' => $from, ...$attributes]);

                    continue;
                }
                $row->fill($attributes);
                if (! $row->isDirty()) {
                    $counts['unchanged']++;

                    continue;
                }
                $counts['updated']++;
                $dryRun || $row->save();
            }

            $stale = Redirect::query()
                ->where('notes', 'like', self::MARKER.'%')
                ->where('is_active', true)
                ->whereNotIn('from_path', array_keys($rules));
            $counts['deactivated'] = $stale->count();
            if (! $dryRun && $stale->update(['is_active' => false]) > 0) {
                // A bulk update skips the model observer that revalidates the site.
                $this->revalidator->queue('redirects');
            }
        });

        return $counts;
    }

    /**
     * Every rule this run would write, keyed by normalized `from_path`. Records override the fixed paths
     * (a migrated product beats the `/produto/*` fallback because it is an exact path).
     *
     * @return array<string, array{to_path: string|null, status_code: RedirectStatus, notes: string}>
     */
    private function rules(): array
    {
        $rules = [];
        foreach ((array) config('franccino.legacy.gone') as $from) {
            $rules[LegacyPath::normalize($from)] = $this->rule(null, 'config', RedirectStatus::Gone);
        }
        foreach ((array) config('franccino.legacy.paths') as $from => $to) {
            $rules[LegacyPath::normalize($from)] = $this->rule($to, 'config');
        }

        $sources = [
            'product' => Product::query()->published(),
            'designer' => Designer::query()->published(),
            'collection' => Collection::query()->published(),
            'project' => Project::query()->published(),
            'category' => Category::query()->published(),
            'line' => Line::query(),
        ];
        foreach ($sources as $type => $query) {
            foreach ($query->whereNotNull('legacy_url')->lazyById() as $model) {
                $to = $this->publicPath($type, $model);
                if ($to !== null) {
                    $rules[LegacyPath::normalize((string) $model->getAttribute('legacy_url'))] = $this->rule($to, "{$type} #{$model->getKey()}");
                }
            }
        }

        return $rules;
    }

    /** @return array{to_path: string|null, status_code: RedirectStatus, notes: string} */
    private function rule(?string $to, string $source, RedirectStatus $status = RedirectStatus::MovedPermanently): array
    {
        return ['to_path' => $to, 'status_code' => $status, 'notes' => self::MARKER.' '.$source];
    }

    private function publicPath(string $type, Model $model): ?string
    {
        $slug = $this->slug($model);
        if ($slug === '') {
            return null;
        }
        $replacements = ['{slug}' => rawurlencode($slug)];
        if ($model instanceof Category) {
            $area = $this->categoryArea($model);
            if ($area === null) {
                return null;
            }
            $replacements['{area}'] = $area;
        }

        return strtr((string) config("franccino.legacy.public_paths.{$type}"), $replacements);
    }

    private function slug(Model $model): string
    {
        // Designer and line slugs are unique and untranslated; the others have one per locale.
        if ($model instanceof Product || $model instanceof Collection || $model instanceof Project || $model instanceof Category) {
            return (string) $model->getTranslation('slug', 'pt', false);
        }

        return (string) $model->getAttribute('slug');
    }

    /** Area from the old URL (`/categoria/interna/<slug>/`), or from the category's first product. */
    private function categoryArea(Category $category): ?string
    {
        $segments = explode('/', trim((string) parse_url((string) $category->legacy_url, PHP_URL_PATH), '/'));
        $fromUrl = config('franccino.legacy.category_areas.'.($segments[1] ?? ''));
        if (is_string($fromUrl)) {
            return $fromUrl;
        }

        return $category->products()->published()->with('area')->first()?->area?->key?->value;
    }

    private function isGenerated(Redirect $row): bool
    {
        return str_starts_with((string) $row->notes, self::MARKER);
    }
}
