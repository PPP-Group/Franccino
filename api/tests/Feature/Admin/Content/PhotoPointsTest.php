<?php

use App\Filament\Resources\Projects\Pages\EditProject;
use App\Filament\Resources\Scenes\Pages\ListScenes;
use App\Filament\Resources\Scenes\SceneResource;
use App\Filament\Support\PhotoPlaces;
use App\Models\Project;
use App\Models\Scene;
use App\Models\User;
use Illuminate\Http\UploadedFile;

use function Pest\Livewire\livewire;

beforeEach(fn () => $this->actingAs(User::factory()->admin()->create()));

it('opens the points of a project photo, creating the scene the first time and reusing it after', function () {
    $project = Project::factory()->create(['title' => ['pt' => 'Clara Arte']]);
    $photo = $project->addMedia(UploadedFile::fake()->image('piscina.jpg', 1600, 1000))->toMediaCollection('gallery');

    $this->get(SceneResource::getUrl('photo', ['media' => $photo->id]))->assertRedirect();
    $scene = Scene::query()->where('photo_media_id', $photo->id)->sole();
    $this->get(SceneResource::getUrl('photo', ['media' => $photo->id]))
        ->assertRedirect(SceneResource::getUrl('edit', ['record' => $scene]));

    expect(Scene::query()->count())->toBe(1)
        ->and($scene->getTranslation('title', 'pt'))->toBe('Projeto Clara Arte · galeria');
});

it('refuses a photo the site does not draw points on', function () {
    $project = Project::factory()->create();
    $poster = $project->addMedia(UploadedFile::fake()->image('capa-video.jpg'))->toMediaCollection('video_poster');

    $this->get(SceneResource::getUrl('photo', ['media' => $poster->id]))->assertNotFound();
});

it('shows the photos of a project in the points action and where each scene shows in the list', function () {
    $project = Project::factory()->create(['title' => ['pt' => 'Boa Vista']]);
    $photo = $project->addMedia(UploadedFile::fake()->image('varanda.jpg', 1200, 800))->toMediaCollection('cover');
    Scene::factory()->create(['photo_media_id' => $photo->id, 'title' => ['pt' => 'Varanda']]);

    livewire(EditProject::class, ['record' => $project->getRouteKey()])->assertActionVisible('photoPoints');
    expect(array_map(fn ($media) => PhotoPlaces::describe($media), PhotoPlaces::photosOf($project->refresh())))
        ->toBe(['Projeto Boa Vista · capa']);

    livewire(ListScenes::class)->assertSee('Varanda')->assertSee('Projeto Boa Vista · capa');
});

it('hides the points action on a project without photos', function () {
    livewire(EditProject::class, ['record' => Project::factory()->create()->getRouteKey()])->assertActionHidden('photoPoints');
});
