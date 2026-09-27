<?php

namespace App\Http\Resources\V1;

use App\Models\Collection as CollectionModel;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `CollectionCard` from docs/api.md (`CollectionRef` + `summary`, `cover`,
 * `product_count`). `product_count` reads `products_count` when the caller
 * pre-loaded it with `withCount()` (see `CollectionController`), falling
 * back to a query otherwise.
 *
 * @property-read CollectionModel $resource
 */
class CollectionCardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $collection = $this->resource;
        $ref = Refs::collection($collection);

        return [
            ...$ref,
            'summary' => Localized::value($collection, 'summary'),
            'cover' => ImagePresenter::present($collection->getFirstMedia('cover'), $ref['name']),
            'product_count' => $collection->products_count ?? $collection->products()->published()->count(),
        ];
    }
}
