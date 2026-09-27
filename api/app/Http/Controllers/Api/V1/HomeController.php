<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BannerPlacement;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BannerResource;
use App\Http\Resources\V1\CollectionCardResource;
use App\Http\Resources\V1\DesignerCardResource;
use App\Http\Resources\V1\LaunchCardResource;
use App\Http\Resources\V1\ProductCardResource;
use App\Models\Banner;
use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Launch;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

/**
 * `GET /home`: `{ banners, featured_products, featured_collections,
 * current_launch, designers }` from docs/api.md.
 */
class HomeController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $banners = Banner::visible()
            ->where('placement', BannerPlacement::HomeHero)
            ->ordered()
            ->with('media')
            ->get();

        $featuredProducts = Product::published()
            ->where('is_featured', true)
            ->with(['area', 'category', 'designer', 'media', 'launches' => fn ($query) => $query->published()])
            ->ordered()
            ->limit(12)
            ->get();

        $featuredCollections = CollectionModel::published()
            ->where('is_featured', true)
            ->withCount(['products' => fn ($query) => $query->published()])
            ->with('media')
            ->ordered()
            ->limit(6)
            ->get();

        $currentLaunch = Launch::current()->with('media')->first();

        $designers = Designer::published()
            ->ordered()
            ->with('media')
            ->limit(16)
            ->get();

        return response()->json(['data' => [
            'banners' => BannerResource::collection($banners),
            'featured_products' => ProductCardResource::collection($featuredProducts),
            'featured_collections' => CollectionCardResource::collection($featuredCollections),
            'current_launch' => $currentLaunch === null ? null : (new LaunchCardResource($currentLaunch))->resolve(),
            'designers' => DesignerCardResource::collection($designers),
        ]]);
    }
}
