<?php

namespace App\Queries;

use App\Models\Category;
use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Finish;
use App\Models\FinishGroup;
use App\Models\Line;
use App\Models\Product;
use App\Support\ContentLocale;
use App\Support\Localized;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Computes the filter panel counts behind `GET /products/facets`: for the
 * published products matching `area`, `category` and `q`, how many match
 * each category / designer / collection / line / finish group. Aggregated in
 * PHP over the (typically small) matching product set rather than raw SQL,
 * to stay portable between MySQL and the SQLite test database.
 */
final class ProductFacets
{
    /**
     * @param  array<string, mixed>  $filters
     * @return array{categories: list<array>, designers: list<array>, collections: list<array>, lines: list<array>, finish_groups: list<array>}
     */
    public static function for(array $filters): array
    {
        $products = self::baseQuery($filters)
            ->with(['category', 'designer', 'collections', 'line', 'finishes.group'])
            ->get();

        return [
            'categories' => self::countBy(
                $products,
                fn (Product $product) => $product->category,
                fn (Category $category) => [
                    'slug' => Localized::value($category, 'slug'),
                    'name' => Localized::value($category, 'name'),
                ],
            ),
            'designers' => self::countBy(
                $products,
                fn (Product $product) => $product->designer,
                fn (Designer $designer) => [
                    'slug' => $designer->slug,
                    'name' => $designer->name,
                ],
            ),
            'collections' => self::countByMany(
                $products,
                fn (Product $product) => $product->collections,
                fn (CollectionModel $collection) => [
                    'slug' => Localized::value($collection, 'slug'),
                    'name' => Localized::value($collection, 'name'),
                ],
            ),
            'lines' => self::countBy(
                $products,
                fn (Product $product) => $product->line,
                fn (Line $line) => [
                    'slug' => $line->slug,
                    'name' => $line->name,
                ],
            ),
            'finish_groups' => self::countByMany(
                $products,
                fn (Product $product) => $product->finishes->pluck('group')->unique('id'),
                fn (FinishGroup $group) => [
                    'id' => $group->id,
                    'name' => Localized::value($group, 'name'),
                ],
            ),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Product>
     */
    private static function baseQuery(array $filters): Builder
    {
        $locale = app(ContentLocale::class)->current();

        $query = Product::query()->published();

        if (filled($filters['area'] ?? null)) {
            $area = $filters['area'];
            $query->whereHas('area', fn (Builder $query) => $query->where('key', $area));
        }

        if (filled($filters['category'] ?? null)) {
            $category = $filters['category'];
            $query->whereHas('category', fn (Builder $query) => $query->where("slug->{$locale}", $category));
        }

        if (filled($filters['q'] ?? null)) {
            $normalized = Str::of((string) $filters['q'])->ascii()->lower()->squish()->toString();
            $query->where('search_text', 'like', '%'.$normalized.'%');
        }

        return $query;
    }

    /**
     * Counts products by a single (nullable) related model, e.g. `category`
     * or `designer`.
     *
     * @template TRelated of Model
     *
     * @param  Collection<int, Product>  $products
     * @param  (callable(Product): (TRelated|null))  $relation
     * @param  (callable(TRelated): array<string, mixed>)  $present
     * @return list<array<string, mixed>>
     */
    private static function countBy(Collection $products, callable $relation, callable $present): array
    {
        return self::countByMany($products, fn (Product $product) => array_filter([$relation($product)]), $present);
    }

    /**
     * Counts products by a to-many related model, e.g. `collections` or the
     * (derived) `finish_groups`.
     *
     * @template TRelated of Model
     *
     * @param  Collection<int, Product>  $products
     * @param  (callable(Product): iterable<TRelated>)  $relation
     * @param  (callable(TRelated): array<string, mixed>)  $present
     * @return list<array<string, mixed>>
     */
    private static function countByMany(Collection $products, callable $relation, callable $present): array
    {
        $counts = [];
        $models = [];

        foreach ($products as $product) {
            foreach ($relation($product) as $related) {
                $key = $related->getKey();
                $counts[$key] = ($counts[$key] ?? 0) + 1;
                $models[$key] ??= $related;
            }
        }

        // Stable sort (guaranteed since PHP 8.0): sorting by `id` first and then by
        // `sort_order` yields the usual [sort_order asc, id asc] ordering.
        return collect($models)
            ->sortBy(fn (Model $related) => $related->getKey())
            ->sortBy(fn (Model $related) => $related->sort_order ?? 0)
            ->map(fn (Model $related) => [...$present($related), 'count' => $counts[$related->getKey()]])
            ->values()
            ->all();
    }
}
