<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\SceneResource;
use App\Models\Scene;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SceneController extends Controller
{
    /** Published scenes with a photo, each with the points whose product is published. */
    public function index(): AnonymousResourceCollection
    {
        $scenes = Scene::published()
            ->whereHas('media', fn ($query) => $query->where('collection_name', 'image'))
            ->with([
                'media',
                'hotspots' => fn ($query) => $query->whereHas('product', fn ($product) => $product->published()),
                'hotspots.product.area', 'hotspots.product.category', 'hotspots.product.designer',
                'hotspots.product.media',
                'hotspots.product.launches' => fn ($query) => $query->published(),
            ])
            ->ordered()
            ->get();

        return SceneResource::collection($scenes);
    }
}
