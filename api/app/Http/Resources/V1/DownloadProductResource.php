<?php

namespace App\Http\Resources\V1;

use App\Models\Product;
use App\Models\ProductFile;
use App\Support\Localized;
use Illuminate\Http\Request;

/**
 * `ProductCard & { files: DownloadFile[] }` from docs/api.md, for
 * `GET /downloads`. Expects the product loaded with published `files` — see
 * `DownloadController::index()`.
 *
 * @property-read Product $resource
 */
class DownloadProductResource extends ProductCardResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $product = $this->resource;

        return array_merge(parent::toArray($request), [
            'files' => $product->files->map(fn (ProductFile $file) => [
                'id' => $file->id,
                'type' => $file->type->value,
                'title' => Localized::value($file, 'title'),
                'format' => $file->format,
                'size' => $file->size,
            ])->values()->all(),
        ]);
    }
}
