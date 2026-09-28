<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Category;
use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Launch;
use App\Models\Page;
use App\Models\Product;
use App\Models\Project;
use App\Support\Locales;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

/**
 * `GET /sitemap`: `{ type, slugs, updated_at, key? }[]` for everything public
 * (docs/api.md), consumed by the front's `sitemap.xml`.
 *
 * Entry types:
 * - `product`, `collection`, `launch`, `project`: one per published record,
 *   `slugs` from the record's translatable `slug`.
 * - `category`: one entry per (area, category) pair that has at least one
 *   published product — not one per category — since the front routes
 *   categories under their area (`/indoor/[category]` vs `/outdoor/[category]`,
 *   see `SitemapEntry.key` in the web client). `key` is the area's key.
 * - `designer`: one per published designer. Designers use a single,
 *   non-translatable slug (docs/data-model.md), so `slugs.pt` and `slugs.en`
 *   both carry that same value.
 * - `page`: one per published page, `key` is the page's own `key`. Pages have
 *   no per-locale slug — they're routed by `key` alone (see the front's
 *   `pathnames` map) — so `slugs.pt` and `slugs.en` are both `null` (Ruling R7).
 */
class SitemapController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $entries = collect()
            ->concat($this->products())
            ->concat($this->categories())
            ->concat($this->collections())
            ->concat($this->designers())
            ->concat($this->launches())
            ->concat($this->projects())
            ->concat($this->pages())
            ->values();

        return response()->json(['data' => $entries]);
    }

    /** @return Collection<int, array<string, mixed>> */
    private function products(): Collection
    {
        return Product::published()->get()->map(fn (Product $product) => $this->productEntry($product))->values();
    }

    /** @return array<string, mixed> */
    private function productEntry(Product $product): array
    {
        return [
            'type' => 'product',
            'slugs' => $this->translatableSlugs($product, 'slug'),
            'updated_at' => $product->updated_at?->toJSON(),
        ];
    }

    /**
     * One entry per (area, category) pair with a published product, `key` the
     * area's key (see class docblock).
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function categories(): Collection
    {
        $areas = Area::all()->keyBy('id');
        $categories = Category::published()->get()->keyBy('id');
        $entries = collect();

        $pairs = Product::published()->select('area_id', 'category_id')->distinct()->get();

        foreach ($pairs as $pair) {
            $category = $categories->get($pair->category_id);
            $area = $areas->get($pair->area_id);

            if (! $category instanceof Category || ! $area instanceof Area) {
                continue;
            }

            $entries->push($this->categoryEntry($category, $area));
        }

        return $entries->values();
    }

    /** @return array<string, mixed> */
    private function categoryEntry(Category $category, Area $area): array
    {
        return [
            'type' => 'category',
            'key' => $area->key->value,
            'slugs' => $this->translatableSlugs($category, 'slug'),
            'updated_at' => $category->updated_at?->toJSON(),
        ];
    }

    /** @return Collection<int, array<string, mixed>> */
    private function collections(): Collection
    {
        return CollectionModel::published()->get()->map(fn (CollectionModel $collection) => $this->collectionEntry($collection))->values();
    }

    /** @return array<string, mixed> */
    private function collectionEntry(CollectionModel $collection): array
    {
        return [
            'type' => 'collection',
            'slugs' => $this->translatableSlugs($collection, 'slug'),
            'updated_at' => $collection->updated_at?->toJSON(),
        ];
    }

    /** @return Collection<int, array<string, mixed>> */
    private function designers(): Collection
    {
        return Designer::published()->get()->map(fn (Designer $designer) => $this->designerEntry($designer))->values();
    }

    /** @return array<string, mixed> */
    private function designerEntry(Designer $designer): array
    {
        return [
            'type' => 'designer',
            'slugs' => collect(Locales::all())->mapWithKeys(fn (string $locale) => [$locale => $designer->slug])->all(),
            'updated_at' => $designer->updated_at?->toJSON(),
        ];
    }

    /** @return Collection<int, array<string, mixed>> */
    private function launches(): Collection
    {
        return Launch::published()->get()->map(fn (Launch $launch) => $this->launchEntry($launch))->values();
    }

    /** @return array<string, mixed> */
    private function launchEntry(Launch $launch): array
    {
        return [
            'type' => 'launch',
            'slugs' => $this->translatableSlugs($launch, 'slug'),
            'updated_at' => $launch->updated_at?->toJSON(),
        ];
    }

    /** @return Collection<int, array<string, mixed>> */
    private function projects(): Collection
    {
        return Project::published()->get()->map(fn (Project $project) => $this->projectEntry($project))->values();
    }

    /** @return array<string, mixed> */
    private function projectEntry(Project $project): array
    {
        return [
            'type' => 'project',
            'slugs' => $this->translatableSlugs($project, 'slug'),
            'updated_at' => $project->updated_at?->toJSON(),
        ];
    }

    /** @return Collection<int, array<string, mixed>> */
    private function pages(): Collection
    {
        return Page::published()->get()->map(fn (Page $page) => $this->pageEntry($page))->values();
    }

    /** @return array<string, mixed> */
    private function pageEntry(Page $page): array
    {
        return [
            'type' => 'page',
            'key' => $page->key,
            'slugs' => collect(Locales::all())->mapWithKeys(fn (string $locale) => [$locale => null])->all(),
            'updated_at' => $page->updated_at?->toJSON(),
        ];
    }

    /**
     * Reads a translatable (`{pt, en}`) attribute in every configured locale,
     * without falling back to the default locale for a missing one — unlike
     * `Localized::value()`, a sitemap entry must say a translation doesn't
     * exist (`null`) rather than paper over it with the portuguese slug.
     *
     * @return array<string, string|null>
     */
    private function translatableSlugs(CollectionModel|Category|Launch|Product|Project $model, string $attribute): array
    {
        return collect(Locales::all())
            ->mapWithKeys(fn (string $locale) => [$locale => $model->getTranslation($attribute, $locale, false) ?: null])
            ->all();
    }
}
