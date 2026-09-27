<?php

namespace App\Http\Resources\V1;

use App\Models\Banner;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `Banner` from docs/api.md (`title`, `subtitle`, `cta_label`, `cta_url`,
 * `image`, `image_mobile`), for `GET /banners`.
 *
 * @property-read Banner $resource
 */
class BannerResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $banner = $this->resource;
        $title = Localized::value($banner, 'title');

        return [
            'title' => $title,
            'subtitle' => Localized::value($banner, 'subtitle'),
            'cta_label' => Localized::value($banner, 'cta_label'),
            'cta_url' => Localized::value($banner, 'cta_url'),
            'image' => ImagePresenter::present($banner->getFirstMedia('image'), (string) $title),
            'image_mobile' => ImagePresenter::present($banner->getFirstMedia('image_mobile'), (string) $title),
        ];
    }
}
