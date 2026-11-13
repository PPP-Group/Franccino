<?php

namespace App\Http\Resources\V1;

use App\Models\Scene;
use App\Models\SceneHotspot;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `ImagePoints` from docs/api.md (`{ id, media_id, title, hotspots: { x, y, product: ProductCard }[] }`): the points
 * of a scene that sits on a photo already on the site. Expects the hotspots filtered to published products.
 *
 * @property-read Scene $resource
 */
class ImagePointsResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $scene = $this->resource;

        return [
            'id' => $scene->id,
            'media_id' => $scene->photo_media_id,
            'title' => Localized::value($scene, 'title'),
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
