<?php

namespace App\Http\Resources\V1;

use App\Models\Page;
use App\Support\ContentLocale;
use App\Support\ImagePresenter;
use App\Support\Localized;
use App\Support\LocalizedBlocks;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `{ key, title, intro, content, cover, featured_product, seo }` from docs/api.md, for
 * `GET /pages/{key}`. `intro` is plain text, not HTML (Ruling R8); `content`
 * is resolved to the current locale by `LocalizedBlocks::resolve()`.
 *
 * @property-read Page $resource
 */
class PageResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $page = $this->resource;
        $title = Localized::value($page, 'title');
        $locale = app(ContentLocale::class)->current();

        return [
            'key' => $page->key,
            'title' => $title,
            'intro' => Localized::value($page, 'intro'),
            'content' => LocalizedBlocks::resolve($page->content ?? [], $locale),
            'cover' => ImagePresenter::present($page->getFirstMedia('cover'), $title),
            // Só a peça publicada (o controller carrega a relação já filtrada).
            'featured_product' => $page->featuredProduct
                ? (new ProductCardResource($page->featuredProduct))->toArray($request)
                : null,
            'seo' => Refs::seo($page, $page->getFirstMedia('og_image') ?? $page->getFirstMedia('cover'), $title),
            'locale_fallback' => Localized::missing($page, ['title', 'intro']),
        ];
    }
}
