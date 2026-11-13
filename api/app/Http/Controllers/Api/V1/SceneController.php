<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\SceneResource;
use App\Models\Scene;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SceneController extends Controller
{
    /** Published scenes with a photo and no project, each with the points whose product is published. */
    public function index(): AnonymousResourceCollection
    {
        // The scenes of a project show up in the project (Corporativo and its page), not on the home page.
        $scenes = Scene::query()
            ->shown()
            ->whereNull('project_id')
            ->ordered()
            ->with(Scene::apiRelations())
            ->get();

        return SceneResource::collection($scenes);
    }
}
