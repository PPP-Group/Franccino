<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\AreaKey;
use App\Http\Controllers\Controller;
use App\Queries\ProductFacets;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductFacetController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'area' => ['sometimes', 'string', Rule::in(array_column(AreaKey::cases(), 'value'))],
            'category' => ['sometimes', 'string'],
            'q' => ['sometimes', 'string'],
        ]);

        return response()->json(['data' => ProductFacets::for($filters)]);
    }
}
