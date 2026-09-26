<?php

namespace App\Http\Resources\V1;

use App\Models\Product;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `ProductCard` from docs/api.md. Expects `area`, `category`, `designer`,
 * `media` and `launches` (published) already eager loaded — see `ProductQuery`.
 *
 * @property-read Product $resource
 */
class ProductCardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $product = $this->resource;

        return [
            'id' => $product->id,
            'slug' => Localized::value($product, 'slug'),
            'name' => Localized::value($product, 'name'),
            'area' => Refs::area($product->area),
            'category' => Refs::category($product->category),
            'designer' => Refs::designer($product->designer),
            'cover' => ImagePresenter::present($product->getFirstMedia('cover'), Localized::value($product, 'name')),
            'is_new' => $product->isNew(),
        ];
    }
}
