<?php

namespace App\Http\Resources\V1;

use App\Models\MediaLink;
use App\Support\Localized;
use App\Support\VideoEmbed;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `MediaLink` from docs/api.md: a video (with `embed_url` when it is YouTube or Vimeo) or an external link.
 *
 * @property-read MediaLink $resource
 */
class MediaLinkResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $link = $this->resource;

        return [
            'id' => $link->id,
            'kind' => $link->kind,
            'title' => Localized::value($link, 'title'),
            'url' => $link->url,
            'embed_url' => $link->kind === 'video' ? VideoEmbed::url($link->url) : null,
        ];
    }
}
