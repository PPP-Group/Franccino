<?php

namespace App\Http\Resources\V1;

use App\Models\Launch;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `LaunchCard` from docs/api.md (`id`, `slug`, `title`, `year`, `summary`,
 * `cover`).
 *
 * @property-read Launch $resource
 */
class LaunchCardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $launch = $this->resource;
        $title = Localized::value($launch, 'title');

        return [
            'id' => $launch->id,
            'slug' => Localized::value($launch, 'slug'),
            'title' => $title,
            'year' => $launch->year,
            'summary' => Localized::value($launch, 'summary'),
            'cover' => ImagePresenter::present($launch->getFirstMedia('cover'), $title),
        ];
    }
}
