<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\CollectionCardResource;
use App\Http\Resources\V1\CollectionResource;
use App\Models\Collection as CollectionModel;
use App\Support\ContentLocale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CollectionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $collections = CollectionModel::published()
            ->withCount(['products' => fn ($query) => $query->published()])
            ->with('media')
            ->ordered()
            ->get();

        return CollectionCardResource::collection($collections);
    }

    public function show(string $slug): JsonResponse
    {
        $locale = app(ContentLocale::class)->current();

        $collection = CollectionModel::published()
            ->where("slug->{$locale}", $slug)
            ->with([
                'media',
                'products' => fn ($query) => $query->published(),
                'products.area', 'products.category', 'products.designer', 'products.media',
                'products.launches' => fn ($query) => $query->published(),
            ])
            ->firstOrFail();

        return response()->json(['data' => (new CollectionResource($collection))->resolve()]);
    }
}
