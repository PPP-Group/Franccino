<?php

namespace App\Http\Resources\V1;

use App\Models\Area;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `Area` from docs/api.md (`AreaRef` + `description`, `cover`, `product_count`,
 * `seo`). `product_count` reads `products_count` when the caller pre-loaded it
 * with `withCount()` (see `AreaController`), falling back to a query otherwise.
 *
 * @property-read Area $resource
 */
class AreaResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $area = $this->resource;
        $ref = Refs::area($area);
        $cover = $area->getFirstMedia('cover');

        return [
            ...$ref,
            'description' => Localized::value($area, 'description'),
            'cover' => ImagePresenter::present($cover, $ref['name']),
            'product_count' => $area->products_count ?? $area->products()->published()->count(),
            'seo' => Refs::seo($area, $cover, $ref['name']),
        ];
    }
}
