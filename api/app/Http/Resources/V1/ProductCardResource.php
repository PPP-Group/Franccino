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
            'cutout' => ImagePresenter::present($product->getFirstMedia('cutout'), Localized::value($product, 'name')),
            'is_new' => $product->isNew(),
            'color' => Localized::value($product, 'color_name'),
            'colors' => self::colors($product),
        ];
    }

    /**
     * A mesma peça nas outras cores publicadas (16/11/2026), sem esta, na ordem do grupo. Vazio quando a relação não
     * veio carregada (`Product::withColors()`), para nunca fazer uma consulta por card.
     *
     * @return list<array<string, mixed>>
     */
    public static function colors(Product $product): array
    {
        if ($product->color_group === null || ! $product->relationLoaded('colors')) {
            return [];
        }

        return $product->colors
            ->reject(fn (Product $color) => $color->id === $product->id)
            ->map(function (Product $color): array {
                $name = Localized::value($color, 'name');

                return [
                    'id' => $color->id,
                    'slug' => Localized::value($color, 'slug'),
                    'name' => $name,
                    'color' => Localized::value($color, 'color_name'),
                    'cover' => ImagePresenter::present($color->getFirstMedia('cover'), $name),
                ];
            })
            ->values()
            ->all();
    }
}
