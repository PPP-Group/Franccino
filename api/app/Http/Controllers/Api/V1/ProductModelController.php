<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\CreateModelLink;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\ContentLocale;
use Illuminate\Http\JsonResponse;

class ProductModelController extends Controller
{
    /**
     * `POST /products/{slug}/model-3d/link` (`docs/api.md`). Only a published product with the 3D switched on and a
     * model uploaded gets a link; anything else is a `404`.
     */
    public function link(string $slug, CreateModelLink $createLink): JsonResponse
    {
        $product = Product::published()
            ->where('is_3d_enabled', true)
            ->whereLocalizedSlug($slug, app(ContentLocale::class)->current())
            ->firstOrFail();

        $media = $product->getFirstMedia('model_3d');
        abort_if($media === null, 404);

        return response()->json(['data' => $createLink->handle($media)], 201);
    }
}
