<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\FinishGroupResource;
use App\Models\FinishGroup;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * `GET /finishes`: one entry per group that has at least one published finish
 * (groups without a published finish are omitted, mirroring how `AreaController`
 * only lists categories that have a published product).
 */
class FinishController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $groups = FinishGroup::query()
            ->whereHas('finishes', fn ($query) => $query->published())
            ->with(['finishes' => fn ($query) => $query->published()->orderBy('sort_order')->orderBy('id')->with('media')])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return FinishGroupResource::collection($groups);
    }
}
