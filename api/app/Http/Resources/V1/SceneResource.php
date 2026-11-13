<?php

namespace App\Http\Resources\V1;

use App\Models\Scene;
use App\Models\SceneHotspot;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `Scene` from docs/api.md (`{ id, title, image, hotspots: { x, y, product: ProductCard }[] }`), for `GET /scenes`.
 * Expects the hotspots already filtered to published products, with the product card relations loaded.
 *
 * @property-read Scene $resource
 */
class SceneResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $scene = $this->resource;
        $title = Localized::value($scene, 'title');

        return [
            'id' => $scene->id,
            'title' => $title,
            'image' => ImagePresenter::present($scene->getFirstMedia('image'), (string) $title),
            'hotspots' => $scene->hotspots
                ->filter(fn (SceneHotspot $hotspot) => $hotspot->product !== null)
                ->map(fn (SceneHotspot $hotspot) => [
                    'x' => $hotspot->x,
                    'y' => $hotspot->y,
                    'product' => (new ProductCardResource($hotspot->product))->resolve($request),
                ])
                ->values()
                ->all(),
        ];
    }
}
