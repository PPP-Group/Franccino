<?php

namespace App\Http\Resources\V1;

use App\Models\Finish;
use App\Models\Product;
use App\Models\ProductFile;
use App\Support\ImagePresenter;
use App\Support\Locales;
use App\Support\Localized;
use App\Support\RichText;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * `ProductDetail` from docs/api.md. Expects the product loaded with `area`,
 * `category`, `designer`, `line`, `collections`, `finishes.group`,
 * `files` (published), `launches` (published) and `media` — see
 * `ProductController::show()`. `line_products` and `related` are separate,
 * necessarily distinct, queries.
 *
 * @property-read Product $resource
 */
class ProductDetailResource extends ProductCardResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $product = $this->resource;
        $name = Localized::value($product, 'name');

        $lineProducts = $this->lineProducts($product);
        $related = $this->related($product, $lineProducts->pluck('id')->all());

        return array_merge(parent::toArray($request), [
            'slugs' => $this->slugs($product),
            'sku' => $product->sku,
            'tagline' => Localized::value($product, 'tagline'),
            'description' => RichText::sanitize(Localized::value($product, 'description')),
            'line' => Refs::line($product->line),
            'collections' => $product->collections->map(fn ($collection) => Refs::collection($collection))->values()->all(),
            'dimensions' => $this->dimensions($product),
            'materials' => Localized::value($product, 'materials'),
            'finishes_note' => Localized::value($product, 'finishes_note'),
            'finishes' => $this->finishes($product),
            'gallery' => ImagePresenter::presentMany($product->getMedia('gallery'), $name),
            'model_3d' => $this->model3d($product),
            'files' => $this->files($product),
            'line_products' => ProductCardResource::collection($lineProducts)->toArray($request),
            'related' => ProductCardResource::collection($related)->toArray($request),
            'seo' => Refs::seo($product, $product->getFirstMedia('cover'), $name),
            'locale_fallback' => Localized::missing($product, ['name', 'description']),
        ]);
    }

    /** @return array<string, string|null> */
    private function slugs(Product $product): array
    {
        return collect(Locales::all())
            ->mapWithKeys(fn (string $locale) => [$locale => $product->getTranslation('slug', $locale, false) ?: null])
            ->all();
    }

    /** @return list<array<string, mixed>> */
    private function dimensions(Product $product): array
    {
        return collect($product->dimensions ?? [])
            ->map(fn (array $dimension) => [
                'label' => Localized::array($dimension['label'] ?? null),
                'width' => $dimension['width'] ?? null,
                'depth' => $dimension['depth'] ?? null,
                'height' => $dimension['height'] ?? null,
                'seat_height' => $dimension['seat_height'] ?? null,
                'diameter' => $dimension['diameter'] ?? null,
            ])
            ->values()
            ->all();
    }

    /** @return list<array<string, mixed>> */
    private function finishes(Product $product): array
    {
        return $product->finishes
            ->groupBy('finish_group_id')
            ->sortBy(fn (Collection $items) => $items->first()->group->sort_order)
            ->map(fn (Collection $items) => [
                'group' => Localized::value($items->first()->group, 'name'),
                'items' => $items->map(fn (Finish $finish) => [
                    'id' => $finish->id,
                    'name' => Localized::value($finish, 'name'),
                    'code' => $finish->code,
                    'swatch' => ImagePresenter::present($finish->getFirstMedia('swatch'), Localized::value($finish, 'name')),
                ])->values()->all(),
            ])
            ->values()
            ->all();
    }

    /** @return array{url: string, size: int|null}|null */
    private function model3d(Product $product): ?array
    {
        if (! $product->is_3d_enabled) {
            return null;
        }

        $media = $product->getFirstMedia('model_3d');

        if ($media === null) {
            return null;
        }

        return ['url' => $media->getFullUrl(), 'size' => $media->size];
    }

    /** @return list<array<string, mixed>> */
    private function files(Product $product): array
    {
        return $product->files->map(fn (ProductFile $file) => [
            'id' => $file->id,
            'type' => $file->type->value,
            'title' => Localized::value($file, 'title'),
            'format' => $file->format,
            'size' => $file->size,
        ])->values()->all();
    }

    /**
     * Other products in the same line (excluding this one), up to 8.
     *
     * @return EloquentCollection<int, Product>
     */
    private function lineProducts(Product $product): EloquentCollection
    {
        if ($product->line_id === null) {
            return new EloquentCollection;
        }

        return Product::published()
            ->where('line_id', $product->line_id)
            ->where('id', '!=', $product->id)
            ->with(['area', 'category', 'designer', 'media', 'launches' => fn ($query) => $query->published()])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->limit(8)
            ->get();
    }

    /**
     * Products in the same area and category, excluding this one and the
     * line products already shown, up to 8.
     *
     * @param  list<int>  $lineProductIds
     * @return EloquentCollection<int, Product>
     */
    private function related(Product $product, array $lineProductIds): EloquentCollection
    {
        return Product::published()
            ->where('area_id', $product->area_id)
            ->where('category_id', $product->category_id)
            ->whereNotIn('id', [$product->id, ...$lineProductIds])
            ->with(['area', 'category', 'designer', 'media', 'launches' => fn ($query) => $query->published()])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->limit(8)
            ->get();
    }
}
