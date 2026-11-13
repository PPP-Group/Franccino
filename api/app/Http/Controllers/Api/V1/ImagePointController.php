<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ImagePointsResource;
use App\Models\Scene;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * `GET /image-points` (retorno de 13/11/2026): os pontos clicáveis sobre as fotos que já estão no site (banners,
 * capas, galerias), pela mídia de cada foto. O site procura a foto pelo `id` da `Image` e desenha os pontos por cima.
 */
class ImagePointController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $scenes = Scene::query()
            ->where('is_published', true)
            ->whereNotNull('photo_media_id')
            ->with(Scene::apiRelations())
            ->orderBy('id')
            ->get()
            ->filter(fn (Scene $scene) => $scene->hotspots->isNotEmpty())
            ->values();

        return ImagePointsResource::collection($scenes);
    }
}
