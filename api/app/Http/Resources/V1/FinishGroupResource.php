<?php

namespace App\Http\Resources\V1;

use App\Models\Finish;
use App\Models\FinishGroup;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `{ id, name, items: { id, name, code, description, swatch }[] }` from
 * docs/api.md, for `GET /finishes`. Expects the group loaded with published
 * `finishes.media` — see `FinishController`.
 *
 * @property-read FinishGroup $resource
 */
class FinishGroupResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $group = $this->resource;

        return [
            'id' => $group->id,
            'name' => Localized::value($group, 'name'),
            'items' => $group->finishes->map(fn (Finish $finish) => [
                'id' => $finish->id,
                'name' => Localized::value($finish, 'name'),
                'code' => $finish->code,
                'description' => Localized::value($finish, 'description'),
                'swatch' => ImagePresenter::present($finish->getFirstMedia('swatch'), Localized::value($finish, 'name')),
            ])->values()->all(),
        ];
    }
}
