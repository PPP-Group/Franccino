<?php

namespace App\Filament\Resources\Scenes\Pages;

use App\Filament\Resources\Scenes\SceneResource;
use App\Filament\Support\PhotoPlaces;
use App\Models\Scene;
use Filament\Resources\Pages\Page;
use Illuminate\Support\Facades\Gate;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * "Pontos nesta foto": opens the scene of a photo already on the site, creating it the first time, so the points are
 * marked straight on that photo (botão "Pontos nas fotos" das telas de projeto, coleção, área e página).
 */
class PhotoPoints extends Page
{
    protected static string $resource = SceneResource::class;

    public function mount(int|string $media): void
    {
        $photo = Media::query()->findOrFail((int) $media);
        abort_unless(array_key_exists($photo->model_type, PhotoPlaces::WITH_POINTS)
            && in_array($photo->collection_name, PhotoPlaces::WITH_POINTS[$photo->model_type], true), 404);

        $scene = Scene::query()->where('photo_media_id', $photo->getKey())->first();
        if ($scene === null) {
            Gate::authorize('create', Scene::class);
            $scene = Scene::query()->create([
                'title' => ['pt' => PhotoPlaces::describe($photo)],
                'photo_media_id' => $photo->getKey(),
                'is_published' => true,
                'sort_order' => (int) Scene::query()->max('sort_order') + 1,
            ]);
        }

        $this->redirect(SceneResource::getUrl('edit', ['record' => $scene]));
    }
}
