<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\AreaResource;
use App\Http\Resources\V1\Refs;
use App\Models\Area;
use App\Models\Category;
use App\Support\ImagePresenter;
use App\Support\Localized;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AreaController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $areas = Area::withCount(['products' => fn ($query) => $query->published()])
            ->with('media')
            ->orderBy('sort_order')
            ->get();

        return AreaResource::collection($areas);
    }

    public function show(string $key): JsonResponse
    {
        $area = Area::withCount(['products' => fn ($query) => $query->published()])
            ->with('media')
            ->where('key', $key)
            ->firstOrFail();

        $categories = Category::published()
            ->whereHas('products', fn ($query) => $query->where('area_id', $area->id)->published())
            ->withCount(['products' => fn ($query) => $query->where('area_id', $area->id)->published()])
            ->with('media')
            ->orderBy('sort_order')
            ->get();

        $data = (new AreaResource($area))->resolve();

        $data['categories'] = $categories
            ->map(fn (Category $category) => [
                ...Refs::category($category),
                'product_count' => $category->products_count,
                'cover' => ImagePresenter::present($category->getFirstMedia('cover'), Localized::value($category, 'name')),
            ])
            ->values()
            ->all();

        return response()->json(['data' => $data]);
    }
}
