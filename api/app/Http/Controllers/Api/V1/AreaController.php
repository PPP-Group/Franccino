<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\AreaResource;
use App\Http\Resources\V1\Refs;
use App\Models\Area;
use App\Models\Category;
use App\Models\Product;
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

        // Categoria sem capa no painel: a capa de uma peça dela nesta área (a primeira em destaque, pela ordem), para o
        // filtro do catálogo mostrar uma foto ao passar o mouse (retorno de 12/11/2026).
        $samples = Product::published()
            ->where('area_id', $area->id)
            ->whereIn('category_id', $categories->pluck('id'))
            ->whereHas('media', fn ($query) => $query->where('collection_name', 'cover'))
            ->with('media')
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->unique('category_id')
            ->keyBy('category_id');

        $data = (new AreaResource($area))->resolve();

        $data['categories'] = $categories
            ->map(function (Category $category) use ($samples): array {
                $name = Localized::value($category, 'name');
                $cover = $category->getFirstMedia('cover') ?? $samples->get($category->id)?->getFirstMedia('cover');

                return [
                    ...Refs::category($category),
                    'product_count' => $category->products_count,
                    'cover' => ImagePresenter::present($cover, $name),
                ];
            })
            ->values()
            ->all();

        return response()->json(['data' => $data]);
    }
}
