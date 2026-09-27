<?php

namespace App\Http\Resources\V1;

use App\Models\Client;
use App\Support\ImagePresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `{ id, name, url, logo }` from docs/api.md, for `GET /clients`.
 *
 * @property-read Client $resource
 */
class ClientResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $client = $this->resource;

        return [
            'id' => $client->id,
            'name' => $client->name,
            'url' => $client->url,
            'logo' => ImagePresenter::present($client->getFirstMedia('logo'), $client->name),
        ];
    }
}
