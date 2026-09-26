<?php

namespace App\Queries;

use App\Models\Product;
use App\Support\ContentLocale;
use App\Support\LikeSearch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

/**
 * Builds the filtered, sorted query behind `GET /products` (and reused by
 * `SearchController` for the `q`-only lookup). Only published products;
 * `area`, `category`, `designer`, `media` (cover) and published `launches`
 * are eager loaded so `ProductCardResource` never triggers extra queries.
 */
final class ProductQuery
{
    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Product>
     */
    public static function make(array $filters): Builder
    {
        $locale = app(ContentLocale::class)->current();

        $query = Product::query()
            ->published()
            ->with([
                'area', 'category', 'designer', 'media',
                'launches' => fn ($query) => $query->published(),
            ]);

        if (filled($filters['area'] ?? null)) {
            $area = $filters['area'];
            $query->whereHas('area', fn (Builder $query) => $query->where('key', $area));
        }

        if (filled($filters['category'] ?? null)) {
            $category = $filters['category'];
            $query->whereHas('category', fn (Builder $query) => $query->where("slug->{$locale}", $category));
        }

        if (filled($filters['designer'] ?? null)) {
            $designer = $filters['designer'];
            $query->whereHas('designer', fn (Builder $query) => $query->where('slug', $designer));
        }

        if (filled($filters['collection'] ?? null)) {
            $collection = $filters['collection'];
            $query->whereHas('collections', fn (Builder $query) => $query->where("slug->{$locale}", $collection));
        }

        if (filled($filters['line'] ?? null)) {
            $line = $filters['line'];
            $query->whereHas('line', fn (Builder $query) => $query->where('slug', $line));
        }

        if (filled($filters['finish'] ?? null)) {
            $finish = $filters['finish'];
            $query->whereHas('finishes', fn (Builder $query) => $query->where('finishes.id', $finish));
        }

        if (filled($filters['launch'] ?? null)) {
            $launch = $filters['launch'];
            $query->whereHas('launches', fn (Builder $query) => $query->published()->where("slug->{$locale}", $launch));
        }

        if (filled($filters['q'] ?? null)) {
            $normalized = Str::of((string) $filters['q'])->ascii()->lower()->squish()->toString();
            $query->whereRaw('search_text LIKE ? ESCAPE ?', [LikeSearch::contains($normalized), LikeSearch::ESCAPE_CHARACTER]);
        }

        return match ($filters['sort'] ?? 'featured') {
            'name' => $query->orderBy("name->{$locale}")->orderBy('id'),
            'newest' => $query->orderByDesc('created_at')->orderBy('id'),
            default => $query->orderByDesc('is_featured')->orderBy('sort_order')->orderBy("name->{$locale}")->orderBy('id'),
        };
    }
}
