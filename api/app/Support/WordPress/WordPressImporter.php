<?php

namespace App\Support\WordPress;

use App\Models\Area;
use App\Models\Category;
use App\Models\Designer;
use App\Models\Line;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Throwable;

/**
 * Imports the catalog of the current WordPress site (P5b Task 4, REST + product page HTML).
 *
 * Rules (plan P5b T4): idempotent by `legacy_wp_id`/`legacy_url`; a field already filled in the panel is
 * never overwritten (only empty fields are completed); everything new enters as a draft unless
 * `publish` is set (local and staging previews only); nothing is invented — what the site lacks goes to
 * the report as a gap.
 */
class WordPressImporter
{
    public const ENTITIES = ['designers', 'lines', 'categories', 'products', 'pages'];

    /** WordPress page slug → `pages.key` whose text is copied (Fábrica, Privacidade, Termos de uso). */
    private const PAGES = [
        'institucional' => 'factory',
        'politica-de-privacidade' => 'privacy',
        'termos-e-condicoes-de-uso' => 'terms',
    ];

    private ImportReport $report;

    /** @var array<int, array<string, mixed>> */
    private array $categoryTerms = [];

    /** @var array<int, string> WordPress area term id → `areas.key` */
    private array $areaTerms = [];

    /** @var array<int, int> WordPress `linhas` term id → `lines.id` */
    private array $lines = [];

    /** @var array<string, int> normalized category name → `categories.id` */
    private array $categoryIndex = [];

    public function __construct(
        private readonly Client $client,
        private readonly ProductPageParser $parser,
        private readonly PageContentParser $pages,
    ) {}

    /**
     * @param  list<string>  $only  entities to import (empty = all)
     * @param  callable(string): void|null  $progress
     */
    public function run(array $only = [], bool $dryRun = false, bool $withMedia = true, bool $publish = false, ?int $limit = null, ?callable $progress = null): ImportReport
    {
        $this->report = new ImportReport;
        $only = $only === [] ? self::ENTITIES : $only;
        $progress ??= static function (string $message): void {};

        $this->loadTerms();

        if (in_array('designers', $only, true)) {
            $this->importDesigners($dryRun, $publish);
            $progress('designers ok');
        }
        if (in_array('lines', $only, true)) {
            $this->importLines($dryRun);
            $progress('lines ok');
        }
        if (in_array('categories', $only, true) || in_array('products', $only, true)) {
            $this->indexCategories();
        }
        if (in_array('products', $only, true)) {
            $this->importProducts($dryRun, $withMedia, $publish, $limit, $progress);
        }
        if (in_array('pages', $only, true)) {
            $this->importPages($dryRun);
            $progress('pages ok');
        }

        return $this->report;
    }

    private function loadTerms(): void
    {
        foreach ($this->client->paginate('areas') as $term) {
            $this->areaTerms[(int) $term['id']] = str_contains((string) $term['slug'], 'extern') ? 'outdoor' : 'indoor';
        }
        foreach ($this->client->paginate('categorias-produtos') as $term) {
            $this->categoryTerms[(int) $term['id']] = $term;
        }
    }

    private function importDesigners(bool $dryRun, bool $publish): void
    {
        foreach ($this->client->paginate('designers') as $item) {
            $slug = (string) $item['slug'];
            $designer = Designer::query()->where('legacy_wp_id', $item['id'])->orWhere('slug', $slug)->first();
            if ($designer !== null) {
                $this->report->count('designers', 'skipped');

                continue;
            }
            $this->report->count('designers', 'created');
            $this->report->gap('designers', self::title($item), 'bio, foto e links a preencher no painel');
            if ($dryRun) {
                continue;
            }
            Designer::create([
                'name' => self::title($item),
                'slug' => $slug,
                'short_bio' => ['pt' => ''],
                'bio' => ['pt' => ''],
                'is_published' => $publish,
                'legacy_wp_id' => $item['id'],
                'legacy_url' => $item['link'] ?? null,
            ]);
        }
    }

    private function importLines(bool $dryRun): void
    {
        foreach ($this->client->paginate('linhas') as $term) {
            if ((int) ($term['count'] ?? 0) === 0) {
                continue;
            }
            $line = Line::query()->where('legacy_wp_id', $term['id'])->first()
                ?? Line::query()->where('slug', $term['slug'])->first();
            if ($line !== null) {
                $this->lines[(int) $term['id']] = $line->id;
                $this->report->count('lines', 'skipped');

                continue;
            }
            $this->report->count('lines', 'created');
            if ($dryRun) {
                continue;
            }
            $line = Line::create([
                'name' => self::title($term, 'name'),
                'slug' => (string) $term['slug'],
                'legacy_wp_id' => $term['id'],
                'legacy_url' => $term['link'] ?? null,
            ]);
            $this->lines[(int) $term['id']] = $line->id;
        }
    }

    /** Existing categories by every name they answer to ("Banquetas e bancos" → banquetas, bancos, banqueta…). */
    private function indexCategories(): void
    {
        foreach (Category::all() as $category) {
            foreach ([$category->getTranslation('name', 'pt', false), $category->getTranslation('singular_name', 'pt', false)] as $name) {
                foreach (self::nameKeys((string) $name) as $key) {
                    $this->categoryIndex[$key] ??= $category->id;
                }
            }
        }
    }

    /** WordPress duplicates categories per area ("Cadeiras Casa"/"Cadeiras Giardini"); here they are one. */
    private function categoryFor(int $termId, bool $dryRun, bool $publish): ?int
    {
        $term = $this->categoryTerms[$termId] ?? null;
        if ($term === null) {
            return null;
        }
        $base = trim((string) preg_replace('/\s+(casa|giardini)$/iu', '', self::title($term, 'name')));
        foreach (self::nameKeys($base) as $key) {
            if (isset($this->categoryIndex[$key])) {
                return $this->categoryIndex[$key];
            }
        }

        $this->report->count('categories', 'created');
        $this->report->gap('categories', $base, 'criada a partir do WordPress; revisar nome no plural e no singular');
        if ($dryRun) {
            return null;
        }
        $category = Category::create([
            'name' => ['pt' => $base],
            'singular_name' => ['pt' => $base],
            'slug' => ['pt' => Str::slug($base)],
            'is_published' => $publish,
            'legacy_wp_id' => Category::query()->where('legacy_wp_id', $termId)->exists() ? null : $termId,
            'legacy_url' => $term['link'] ?? null,
        ]);
        foreach (self::nameKeys($base) as $key) {
            $this->categoryIndex[$key] = $category->id;
        }

        return $category->id;
    }

    /** @param callable(string): void $progress */
    /** Copies the text of the institutional pages into pages still without content (panel edits win). */
    private function importPages(bool $dryRun): void
    {
        foreach ($this->client->paginate('pages') as $item) {
            $key = self::PAGES[(string) $item['slug']] ?? null;
            $page = $key !== null ? Page::query()->where('key', $key)->first() : null;
            if ($page === null) {
                continue;
            }
            if (! empty($page->content)) {
                $this->report->count('pages', 'skipped');

                continue;
            }
            $blocks = $this->pageBlocks($key, (string) ($item['content']['rendered'] ?? ''));
            if ($blocks === []) {
                $this->report->count('pages', 'skipped');
                $this->report->gap('pages', self::title($item), 'sem texto no site atual');

                continue;
            }
            $this->report->count('pages', 'updated');
            $this->report->gap('pages', self::title($item), 'texto copiado do site atual: revisar e traduzir para o inglês');
            if (! $dryRun) {
                $page->update(['content' => $blocks]);
            }
        }
    }

    /** @return list<array{type: string, data: array<string, mixed>}> */
    private function pageBlocks(string $key, string $html): array
    {
        $body = $this->pages->richText($html, $key === 'factory' ? 'nossa história' : null);
        $blocks = $body !== null ? [['type' => 'rich_text', 'data' => ['body' => ['pt' => $body]]]] : [];
        if ($key !== 'factory') {
            return $blocks;
        }
        $timeline = $this->pages->timeline($html);
        if ($timeline !== []) {
            $blocks[] = ['type' => 'timeline', 'data' => ['items' => array_map(fn (array $item) => [
                'year' => $item['year'],
                'title' => ['pt' => $item['title']],
                'text' => ['pt' => $item['text']],
            ], $timeline)]];
        }

        return $blocks;
    }

    private function importProducts(bool $dryRun, bool $withMedia, bool $publish, ?int $limit, callable $progress): void
    {
        $areas = Area::query()->pluck('id', 'key');
        $done = 0;
        foreach ($this->client->paginate('produtos') as $item) {
            if ($limit !== null && $done >= $limit) {
                break;
            }
            $done++;
            $name = self::title($item);
            try {
                $this->importProduct($item, $name, $areas->all(), $dryRun, $withMedia, $publish);
            } catch (Throwable $exception) {
                $this->report->count('products', 'skipped');
                $this->report->gap('products', $name, 'erro na importação: '.Str::limit($exception->getMessage(), 160));
            }
            if ($done % 25 === 0) {
                $progress("products: {$done}");
            }
        }
    }

    /**
     * @param  array<string, mixed>  $item
     * @param  array<string, int>  $areas
     */
    private function importProduct(array $item, string $name, array $areas, bool $dryRun, bool $withMedia, bool $publish): void
    {
        $html = $this->client->html((string) $item['link']);
        $gallery = $this->parser->gallery($html);
        $specs = $this->parser->specs($html);
        $designerSlug = $this->parser->designerSlug($html);

        $areaKey = $this->areaTerms[(int) ($item['areas'][0] ?? 0)] ?? self::areaFromCategory($item);
        $categoryId = $this->categoryFor((int) ($item['categorias-produtos'][0] ?? 0), $dryRun, $publish);
        if ($areaKey === null || ! isset($areas[$areaKey]) || ($categoryId === null && ! $dryRun)) {
            $this->report->count('products', 'skipped');
            $this->report->gap('products', $name, 'sem área ou categoria no WordPress: não importado');

            return;
        }

        [$dimensions, $materials, $finishes] = $this->readSpecs($specs, $name);
        if ($gallery === []) {
            $this->report->gap('products', $name, 'sem fotos no site');
        }
        if (preg_match('/-\d+$/', (string) $item['slug'])) {
            $this->report->gap('products', $name, "slug com sufixo numérico ({$item['slug']}): revisar");
        }

        $product = Product::withTrashed()->where('legacy_wp_id', $item['id'])->first()
            ?? Product::withTrashed()->where('slug->pt', $item['slug'])->first();
        $this->report->count('products', $product === null ? 'created' : 'updated');
        if ($dryRun) {
            return;
        }

        $product ??= new Product([
            'name' => ['pt' => $name],
            'slug' => ['pt' => (string) $item['slug']],
            'description' => ['pt' => ''],
            'dimensions' => [],
            'is_published' => $publish,
        ]);
        $seo = (array) ($item['yoast_head_json'] ?? []);
        $designerId = $designerSlug !== null ? Designer::query()->where('slug', $designerSlug)->value('id') : null;

        $this->fillEmpty($product, [
            'area_id' => $areas[$areaKey],
            'category_id' => $categoryId,
            'line_id' => $this->lines[(int) ($item['linhas'][0] ?? 0)] ?? Line::query()->where('legacy_wp_id', $item['linhas'][0] ?? 0)->value('id'),
            'designer_id' => $designerId,
            'legacy_wp_id' => $item['id'],
            'legacy_url' => $item['link'],
        ]);
        $this->fillEmptyTranslation($product, 'materials', $materials);
        $this->fillEmptyTranslation($product, 'finishes_note', $finishes);
        $this->fillEmptyTranslation($product, 'seo_title', isset($seo['title']) ? (string) preg_replace('/\s+-\s+Franccino$/u', '', (string) $seo['title']) : null);
        $this->fillEmptyTranslation($product, 'seo_description', isset($seo['description']) ? (string) $seo['description'] : null);
        if ($product->dimensions === [] && $dimensions !== []) {
            $product->dimensions = $dimensions;
        }
        if ($publish) {
            $product->is_published = true;
        }
        $product->save();

        if ($designerId === null) {
            $this->report->gap('products', $name, 'sem designer na página');
        }
        if (blank($product->getTranslation('description', 'pt', false))) {
            $this->report->gap('products', $name, 'sem descrição');
        }
        if ($withMedia) {
            $this->attachGallery($product, $gallery, $name);
        }
    }

    /**
     * @param  list<array{label: string, value: string}>  $specs
     * @return array{0: list<array<string, mixed>>, 1: string|null, 2: string|null}
     */
    private function readSpecs(array $specs, string $name): array
    {
        $dimensions = [];
        $materials = null;
        $finishes = null;
        foreach ($specs as ['label' => $label, 'value' => $value]) {
            if (preg_match('/^materia/iu', $label)) {
                $materials ??= $value;
            } elseif (preg_match('/^acabamento/iu', $label)) {
                $finishes ??= $value;
            } elseif (preg_match('/^(medidas?|dimens)/iu', $label)) {
                $parsed = DimensionParser::parse($value);
                if ($parsed === null) {
                    $this->report->gap('products', $name, "medida não lida: \"{$label}: {$value}\"");

                    continue;
                }
                $variant = self::variantLabel($label);
                $dimensions[] = ($variant !== null ? ['label' => ['pt' => $variant]] : []) + $parsed;
            } else {
                $this->report->gap('products', $name, "medida configurável: \"{$label}: {$value}\"");
            }
        }
        if ($dimensions === [] && $specs !== []) {
            $this->report->gap('products', $name, 'sem medidas em milímetros');
        }

        return [$dimensions, $materials, $finishes];
    }

    /** @param list<string> $urls */
    private function attachGallery(Product $product, array $urls, string $name): void
    {
        $existing = $product->getMedia('gallery')
            ->map(fn (Media $media) => $media->getCustomProperty('legacy_url'))
            ->filter()
            ->all();
        foreach ($urls as $url) {
            if (in_array($url, $existing, true)) {
                continue;
            }
            $path = $this->client->download($url);
            if ($path === null) {
                $this->report->gap('products', $name, "foto não baixada: {$url}");

                continue;
            }
            $product->addMedia($path)
                ->preservingOriginal()
                ->withCustomProperties(['legacy_url' => $url])
                ->toMediaCollection('gallery');
        }
        if (! $product->hasMedia('cover') && $urls !== []) {
            $path = $this->client->download($urls[0]);
            if ($path !== null) {
                $product->addMedia($path)
                    ->preservingOriginal()
                    ->withCustomProperties(['legacy_url' => $urls[0]])
                    ->toMediaCollection('cover');
            }
        }
    }

    /** @param array<string, mixed> $values */
    private function fillEmpty(Product $product, array $values): void
    {
        foreach ($values as $attribute => $value) {
            if ($value !== null && blank($product->getAttribute($attribute))) {
                $product->setAttribute($attribute, $value);
            }
        }
    }

    private function fillEmptyTranslation(Product $product, string $attribute, ?string $value): void
    {
        if (filled($value) && blank($product->getTranslation($attribute, 'pt', false))) {
            $product->setTranslation($attribute, 'pt', $value);
        }
    }

    /** @param array<string, mixed> $item */
    private static function areaFromCategory(array $item): ?string
    {
        $classes = implode(' ', (array) ($item['class_list'] ?? []));

        return match (true) {
            str_contains($classes, 'giardini') => 'outdoor',
            str_contains($classes, '-casa') => 'indoor',
            default => null,
        };
    }

    private static function variantLabel(string $label): ?string
    {
        if (str_contains($label, ':')) {
            $after = trim(Str::after($label, ':'));

            return $after !== '' ? $after : null;
        }

        return preg_match('/^medidas?\s+([ivx]+)$/iu', $label, $match) ? 'Modelo '.strtoupper($match[1]) : null;
    }

    /** @param array<string, mixed> $item */
    private static function title(array $item, string $field = 'title'): string
    {
        $value = $item[$field] ?? '';
        $value = is_array($value) ? ($value['rendered'] ?? '') : $value;

        return trim(html_entity_decode(strip_tags((string) $value), ENT_QUOTES | ENT_HTML5));
    }

    /** @return list<string> */
    private static function nameKeys(string $name): array
    {
        $normalized = Str::of($name)->ascii()->lower()->squish()->toString();
        if ($normalized === '') {
            return [];
        }
        $keys = [$normalized];
        foreach (preg_split('/\s+e\s+/', $normalized) ?: [] as $part) {
            $keys[] = $part;
            $keys[] = (string) preg_replace('/(?<=[aeiou])s$|es$/', '', $part);
            $keys[] = (string) preg_replace('/(?<=[aeiou])s(?=\s)|es(?=\s)/', '', $part);
        }

        return array_values(array_unique(array_filter($keys)));
    }
}
