<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\AreaKey;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\CategoryResource;
use App\Models\Area;
use App\Models\Category;
use App\Support\ContentLocale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'area' => ['sometimes', 'string', Rule::in(array_column(AreaKey::cases(), 'value'))],
        ]);

        $areaId = null;

        if (filled($validated['area'] ?? null)) {
            $areaId = Area::where('key', $validated['area'])->value('id');
        }

        $categories = Category::published()
            ->withCount(['products' => fn ($query) => $query->published()->when($areaId, fn ($query) => $query->where('area_id', $areaId))])
            ->with('media')
            ->orderBy('sort_order')
            ->get();

        return CategoryResource::collection($categories);
    }

    public function show(string $slug): JsonResponse
    {
        $locale = app(ContentLocale::class)->current();

        $category = Category::published()
            ->where("slug->{$locale}", $slug)
            ->with('media')
            ->firstOrFail();

        return response()->json(['data' => (new CategoryResource($category, detailed: true))->resolve()]);
    }
}
