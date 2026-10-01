<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\DesignerCardResource;
use App\Http\Resources\V1\DesignerResource;
use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DesignerController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $designers = Designer::published()
            ->ordered()
            ->with('media')
            ->get();

        return DesignerCardResource::collection($designers);
    }

    /**
     * Designers use a single, non-translatable slug (see docs/data-model.md), so
     * unlike categories/collections/launches/projects this is a plain lookup.
     */
    public function show(string $slug): JsonResponse
    {
        $designer = Designer::published()
            ->where('slug', $slug)
            ->with(['media', 'mediaLinks'])
            ->firstOrFail();

        $products = $designer->products()
            ->published()
            ->with(['area', 'category', 'designer', 'media', 'launches' => fn ($query) => $query->published()])
            ->ordered()
            ->get();

        $collections = CollectionModel::published()
            ->whereHas('products', fn ($query) => $query->where('designer_id', $designer->id)->published())
            ->ordered()
            ->get();

        $resource = new DesignerResource($designer, $products, $collections);

        return response()->json(['data' => $resource->resolve()]);
    }
}
