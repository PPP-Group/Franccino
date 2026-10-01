<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\StoreType;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\StoreResource;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'state' => ['sometimes', 'string', 'size:2'],
            'type' => ['sometimes', 'string', Rule::in(array_column(StoreType::cases(), 'value'))],
        ]);

        $stores = Store::published()
            ->when($validated['state'] ?? null, fn ($query, $state) => $query->whereRaw('UPPER(state) = ?', [mb_strtoupper($state)]))
            ->when($validated['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->ordered()
            ->with('media')
            ->get();

        $states = Store::published()
            ->select('state')
            ->distinct()
            ->orderBy('state')
            ->pluck('state')
            ->all();

        return response()->json([
            'data' => StoreResource::collection($stores),
            'meta' => ['states' => $states],
        ]);
    }
}
