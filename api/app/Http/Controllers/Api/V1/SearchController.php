<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ProductCardResource;
use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Queries\ProductQuery;
use App\Support\ContentLocale;
use App\Support\ImagePresenter;
use App\Support\LikeSearch;
use App\Support\Localized;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * `GET /search`: up to 12 products, 6 designers and 6 collections matching
 * `q` (minimum 2 characters). `DesignerCard`/`CollectionCard` are assembled
 * inline here rather than through dedicated resources — those belong to the
 * designers/collections endpoints, outside this task's scope.
 */
class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2'],
        ]);

        $locale = app(ContentLocale::class)->current();
        $term = $validated['q'];
        $pattern = LikeSearch::contains(Str::lower($term));

        $products = ProductQuery::make(['q' => $term])->limit(12)->get();

        $designers = Designer::published()
            ->whereRaw('LOWER(name) LIKE ? ESCAPE ?', [$pattern, LikeSearch::ESCAPE_CHARACTER])
            ->ordered()
            ->with('media')
            ->limit(6)
            ->get();

        // `name` is a translatable JSON column: MySQL's `JSON_EXTRACT` returns a
        // JSON-quoted string (needs `JSON_UNQUOTE`) while SQLite's `json_extract`
        // already returns the plain scalar — so, unlike the plain `name` column
        // above, this one needs a driver-specific expression to wrap in `LOWER()`.
        // `ConnectionInterface` doesn't expose `getDriverName()`, so the driver
        // is read from config instead of the connection instance.
        $connection = (new CollectionModel)->getConnectionName() ?? config('database.default');
        $driver = config("database.connections.{$connection}.driver");
        $nameColumn = $driver === 'sqlite'
            ? "json_extract(name, '$.\"{$locale}\"')"
            : "JSON_UNQUOTE(JSON_EXTRACT(name, '$.\"{$locale}\"'))";

        $collections = CollectionModel::published()
            ->whereRaw("LOWER({$nameColumn}) LIKE ? ESCAPE ?", [$pattern, LikeSearch::ESCAPE_CHARACTER])
            ->withCount(['products' => fn ($query) => $query->published()])
            ->ordered()
            ->with('media')
            ->limit(6)
            ->get();

        return response()->json(['data' => [
            'products' => ProductCardResource::collection($products),
            'designers' => $designers->map(fn (Designer $designer) => [
                'id' => $designer->id,
                'slug' => $designer->slug,
                'name' => $designer->name,
                'short_bio' => Localized::value($designer, 'short_bio'),
                'portrait' => ImagePresenter::present($designer->getFirstMedia('portrait'), $designer->name),
                'location' => $designer->location,
            ])->values(),
            'collections' => $collections->map(fn (CollectionModel $collection) => [
                'id' => $collection->id,
                'slug' => Localized::value($collection, 'slug'),
                'name' => Localized::value($collection, 'name'),
                'year' => $collection->year,
                'summary' => Localized::value($collection, 'summary'),
                'cover' => ImagePresenter::present($collection->getFirstMedia('cover'), Localized::value($collection, 'name')),
                'product_count' => $collection->products_count,
            ])->values(),
        ]]);
    }
}
