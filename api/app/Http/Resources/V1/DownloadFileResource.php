<?php

namespace App\Http\Resources\V1;

use App\Models\ProductFile;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `DownloadFile` from docs/api.md: a file of a product, designer or launch. The file itself only leaves
 * through `POST /downloads/{id}/link`.
 *
 * @property-read ProductFile $resource
 */
class DownloadFileResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $file = $this->resource;

        return [
            'id' => $file->id,
            'type' => $file->type->value,
            'title' => Localized::value($file, 'title'),
            'format' => $file->format,
            'size' => $file->size,
        ];
    }
}
