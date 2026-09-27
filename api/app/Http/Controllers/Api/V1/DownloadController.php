<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\DownloadProductResource;
use App\Queries\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DownloadController extends Controller
{
    /**
     * `GET /downloads`: paginated `ProductCard & { files }`, only products
     * with at least one published `ProductFile` (docs/api.md).
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'area' => ['sometimes', 'string'],
            'category' => ['sometimes', 'string'],
            'q' => ['sometimes', 'string'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:48'],
        ]);

        $perPage = $validated['per_page'] ?? 24;
        $page = $validated['page'] ?? 1;

        $paginator = ProductQuery::make($validated)
            ->whereHas('files', fn ($query) => $query->published())
            ->with(['files' => fn ($query) => $query->published()->orderBy('sort_order')->orderBy('id')])
            ->paginate($perPage, ['*'], 'page', $page)
            ->appends($request->query());

        return response()->json([
            'data' => DownloadProductResource::collection($paginator->items())->toArray($request),
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }
}
