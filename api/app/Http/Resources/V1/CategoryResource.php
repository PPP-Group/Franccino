<?php

namespace App\Http\Resources\V1;

use App\Models\Category;
use App\Support\ImagePresenter;
use App\Support\Locales;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serializes a `Category` in one of two shapes from docs/api.md, depending on
 * `$detailed`:
 * - list (`GET /categories`): `CategoryRef` + `cover`, `product_count`.
 * - detail (`GET /categories/{slug}`): `CategoryRef` + `description`, `cover`,
 *   `seo`, `slugs`.
 *
 * `product_count` reads `products_count` when the caller pre-loaded it with
 * `withCount()` (see `CategoryController`), falling back to a query otherwise.
 *
 * @property-read Category $resource
 */
class CategoryResource extends JsonResource
{
    /**
     * Forma do detalhe. Não vai no construtor: a coleção (`CategoryResource::collection`) passa o índice do item como
     * segundo argumento, e a partir do segundo item a lista saía na forma do detalhe, sem `product_count`
     * (retorno de 12/11/2026).
     */
    private bool $detailed = false;

    public static function detail(Category $category): self
    {
        $resource = new self($category);
        $resource->detailed = true;

        return $resource;
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $category = $this->resource;
        $ref = Refs::category($category);
        $cover = $category->getFirstMedia('cover');

        if ($this->detailed) {
            return [
                ...$ref,
                'description' => Localized::value($category, 'description'),
                'cover' => ImagePresenter::present($cover, $ref['name']),
                'seo' => Refs::seo($category, $cover, $ref['name']),
                'slugs' => collect(Locales::all())
                    ->mapWithKeys(fn (string $locale) => [$locale => $category->getTranslation('slug', $locale, false) ?: null])
                    ->all(),
            ];
        }

        return [
            ...$ref,
            'cover' => ImagePresenter::present($cover ?? $category->sampleCover, $ref['name']),
            'product_count' => $category->products_count ?? $category->products()->published()->count(),
        ];
    }
}
