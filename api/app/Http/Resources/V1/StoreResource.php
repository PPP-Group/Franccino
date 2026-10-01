<?php

namespace App\Http\Resources\V1;

use App\Models\Store;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `Store` from docs/api.md ("Escrita" section footnote listing every field),
 * for `GET /stores`.
 *
 * @property-read Store $resource
 */
class StoreResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $store = $this->resource;

        return [
            'id' => $store->id,
            'name' => $store->name,
            'type' => $store->type->value,
            'address' => $store->address,
            'address_complement' => $store->address_complement,
            'district' => $store->district,
            'city' => $store->city,
            'state' => $store->state,
            'postal_code' => $store->postal_code,
            'country' => $store->country,
            'latitude' => $store->latitude === null ? null : (float) $store->latitude,
            'longitude' => $store->longitude === null ? null : (float) $store->longitude,
            'phone' => $store->phone,
            'whatsapp' => $store->whatsapp,
            'email' => $store->email,
            'website_url' => $store->website_url,
            'instagram_url' => $store->instagram_url,
            'opening_hours' => Localized::value($store, 'opening_hours'),
            'description' => Localized::value($store, 'description'),
            'image' => ImagePresenter::present($store->getFirstMedia('image'), $store->name),
        ];
    }
}
