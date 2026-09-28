<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BannerPlacement;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BannerResource;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class BannerController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'placement' => ['sometimes', 'string', Rule::in(array_column(BannerPlacement::cases(), 'value'))],
        ]);

        $placement = $validated['placement'] ?? BannerPlacement::HomeHero->value;

        $banners = Banner::visible()
            ->where('placement', $placement)
            ->ordered()
            ->with('media')
            ->get();

        return BannerResource::collection($banners);
    }
}
