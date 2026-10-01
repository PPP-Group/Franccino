<?php

namespace App\Http\Resources\V1;

use App\Models\Launch;
use App\Support\ImagePresenter;
use App\Support\Locales;
use App\Support\Localized;
use App\Support\RichText;
use Illuminate\Http\Request;

/**
 * `LaunchCard` + `description`, `gallery`, `products`, `seo`, `slugs` from
 * docs/api.md, for `GET /launches/{slug}`. Expects the launch loaded with
 * `products.*` (area, category, designer, media, launches) and `media` — see
 * `LaunchController::show()`.
 *
 * @property-read Launch $resource
 */
class LaunchResource extends LaunchCardResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $launch = $this->resource;
        $title = Localized::value($launch, 'title');

        return array_merge(parent::toArray($request), [
            'description' => RichText::sanitize(Localized::value($launch, 'description')),
            'gallery' => ImagePresenter::presentMany($launch->getMedia('gallery'), $title),
            'products' => ProductCardResource::collection($launch->products)->toArray($request),
            'media_links' => MediaLinkResource::collection($launch->mediaLinks)->resolve(),
            'files' => DownloadFileResource::collection($launch->files)->resolve(),
            'seo' => Refs::seo($launch, $launch->getFirstMedia('cover'), $title),
            'slugs' => collect(Locales::all())
                ->mapWithKeys(fn (string $locale) => [$locale => $launch->getTranslation('slug', $locale, false) ?: null])
                ->all(),
        ]);
    }
}
