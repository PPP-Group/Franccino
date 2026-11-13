<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\PageResource;
use App\Models\Page;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    public function show(string $key): JsonResponse
    {
        $page = Page::published()
            ->where('key', $key)
            ->with([
                'media',
                'featuredProduct' => fn ($query) => $query->published(),
                'featuredProduct.area', 'featuredProduct.category', 'featuredProduct.designer', 'featuredProduct.media',
                'featuredProduct.launches' => fn ($query) => $query->published(),
            ])
            ->firstOrFail();

        return response()->json(['data' => (new PageResource($page))->resolve()]);
    }
}
