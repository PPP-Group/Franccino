<?php

namespace App\Http\Resources\V1;

use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Product;
use App\Support\ImagePresenter;
use App\Support\Locales;
use App\Support\Localized;
use App\Support\RichText;
use Illuminate\Http\Request;

/**
 * `CollectionCard` + `description`, `gallery`, `designers`, `products`, `seo`,
 * `slugs` from docs/api.md, for `GET /collections/{slug}`. Expects the
 * collection loaded with `products.designer` and `media` — see
 * `CollectionController::show()`. `designers` is the distinct, published set
 * of designers behind the collection's products.
 *
 * @property-read CollectionModel $resource
 */
class CollectionResource extends CollectionCardResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $collection = $this->resource;
        $name = Localized::value($collection, 'name');
        $products = $collection->products;

        return array_merge(parent::toArray($request), [
            'description' => RichText::sanitize(Localized::value($collection, 'description')),
            'gallery' => ImagePresenter::presentMany($collection->getMedia('gallery'), $name),
            'designers' => $products
                ->map(fn (Product $product) => $product->designer)
                ->filter(fn (?Designer $designer) => $designer instanceof Designer && $designer->is_published)
                ->unique('id')
                ->values()
                ->map(fn (Designer $designer) => Refs::designer($designer))
                ->all(),
            'products' => ProductCardResource::collection($products)->toArray($request),
            'seo' => Refs::seo($collection, $collection->getFirstMedia('cover'), $name),
            'slugs' => collect(Locales::all())
                ->mapWithKeys(fn (string $locale) => [$locale => $collection->getTranslation('slug', $locale, false) ?: null])
                ->all(),
        ]);
    }
}
