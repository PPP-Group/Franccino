<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ProductIndexRequest;
use App\Http\Resources\V1\ProductCardResource;
use App\Http\Resources\V1\ProductDetailResource;
use App\Models\Product;
use App\Queries\ProductQuery;
use App\Support\ContentLocale;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(ProductIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $perPage = $filters['per_page'] ?? 24;
        $page = $filters['page'] ?? 1;

        $paginator = ProductQuery::make($filters)
            ->paginate($perPage, ['*'], 'page', $page)
            ->appends($request->query());

        return response()->json([
            'data' => ProductCardResource::collection($paginator->items())->toArray($request),
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

    public function show(string $slug): JsonResponse
    {
        $locale = app(ContentLocale::class)->current();

        $product = Product::published()
            ->where("slug->{$locale}", $slug)
            ->with([
                'area', 'category', 'designer', 'line', 'collections',
                'finishes.group', 'media', 'mediaLinks',
                'files' => fn ($query) => $query->published(),
                'launches' => fn ($query) => $query->published(),
            ])
            ->firstOrFail();

        return response()->json(['data' => (new ProductDetailResource($product))->resolve()]);
    }
}
