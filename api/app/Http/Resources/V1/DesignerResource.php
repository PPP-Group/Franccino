<?php

namespace App\Http\Resources\V1;

use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Product;
use App\Support\Localized;
use App\Support\RichText;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\Request;

/**
 * `DesignerCard` + `bio`, `website_url`, `instagram_url`, `products`,
 * `collections`, `seo` from docs/api.md, for `GET /designers/{slug}`.
 *
 * `products` and `collections` are separate queries computed by
 * `DesignerController::show()` (the designer has no direct `collections`
 * relation), so — like `CategoryResource`'s `$detailed` flag — they're passed
 * through the constructor rather than read off the model.
 *
 * @property-read Designer $resource
 */
class DesignerResource extends DesignerCardResource
{
    /**
     * @param  EloquentCollection<int, Product>  $products
     * @param  EloquentCollection<int, CollectionModel>  $collections
     */
    public function __construct(
        Designer $resource,
        private readonly EloquentCollection $products,
        private readonly EloquentCollection $collections,
    ) {
        parent::__construct($resource);
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $designer = $this->resource;

        return array_merge(parent::toArray($request), [
            'bio' => RichText::sanitize(Localized::value($designer, 'bio')),
            'website_url' => $designer->website_url,
            'instagram_url' => $designer->instagram_url,
            'products' => ProductCardResource::collection($this->products)->toArray($request),
            'collections' => $this->collections
                ->map(fn (CollectionModel $collection) => Refs::collection($collection))
                ->values()
                ->all(),
            'seo' => Refs::seo($designer, $designer->getFirstMedia('portrait'), $designer->name),
        ]);
    }
}
