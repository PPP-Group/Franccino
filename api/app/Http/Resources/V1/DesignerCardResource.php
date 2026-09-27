<?php

namespace App\Http\Resources\V1;

use App\Models\Designer;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `DesignerCard` from docs/api.md (`DesignerRef` + `short_bio`, `portrait`,
 * `location`).
 *
 * @property-read Designer $resource
 */
class DesignerCardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $designer = $this->resource;
        $ref = Refs::designer($designer);

        return [
            ...$ref,
            'short_bio' => Localized::value($designer, 'short_bio'),
            'portrait' => ImagePresenter::present($designer->getFirstMedia('portrait'), $designer->name),
            'location' => $designer->location,
        ];
    }
}
