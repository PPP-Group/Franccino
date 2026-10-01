<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\LaunchCardResource;
use App\Http\Resources\V1\LaunchResource;
use App\Models\Launch;
use App\Support\ContentLocale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LaunchController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $launches = Launch::published()
            ->with('media')
            ->ordered()
            ->get();

        return LaunchCardResource::collection($launches);
    }

    public function show(string $slug): JsonResponse
    {
        $locale = app(ContentLocale::class)->current();

        $launch = Launch::published()
            ->where("slug->{$locale}", $slug)
            ->with([
                'media', 'mediaLinks',
                'products' => fn ($query) => $query->published(),
                'products.area', 'products.category', 'products.designer', 'products.media',
                'products.launches' => fn ($query) => $query->published(),
            ])
            ->firstOrFail();

        return response()->json(['data' => (new LaunchResource($launch))->resolve()]);
    }
}
