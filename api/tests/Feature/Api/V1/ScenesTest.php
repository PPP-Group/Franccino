<?php

use App\Models\Project;
use App\Models\Scene;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function sceneWithPhoto(array $attributes = []): Scene
{
    $scene = Scene::factory()->create($attributes);
    $scene->addMedia(UploadedFile::fake()->image('ambiente.jpg', 1600, 900))->toMediaCollection('image');

    return $scene;
}

beforeEach(function () {
    Storage::fake('media');
});

it('lists published scenes with a photo, each point with its product card', function () {
    $product = publishedProduct();
    $scene = sceneWithPhoto();
    $scene->hotspots()->create(['product_id' => $product->id, 'x' => 42.5, 'y' => 61]);
    sceneWithPhoto(['is_published' => false]);
    Scene::factory()->create();

    $response = $this->getJson('/api/v1/scenes')->assertOk();

    $response->assertJsonStructure([
        'data' => ['*' => ['id', 'title', 'image', 'hotspots' => ['*' => ['x', 'y', 'product' => ['id', 'slug', 'name', 'cover']]]]],
    ]);
    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.title'))->toBe('Varanda com a coleção Tempo')
        ->and($response->json('data.0.hotspots.0'))->toMatchArray(['x' => 42.5, 'y' => 61])
        ->and($response->json('data.0.hotspots.0.product.slug'))->toBe('cadeira-aura');
});

it('drops the points of unpublished pieces', function () {
    $scene = sceneWithPhoto();
    $scene->hotspots()->create(['product_id' => publishedProduct(['is_published' => false])->id, 'x' => 10, 'y' => 10]);

    $response = $this->getJson('/api/v1/scenes')->assertOk();

    expect($response->json('data.0.hotspots'))->toBe([]);
});

it('answers in english when asked', function () {
    sceneWithPhoto();

    $this->getJson('/api/v1/scenes?locale=en')
        ->assertOk()
        ->assertJsonPath('data.0.title', 'Porch with the Tempo collection');
});

it('shows the scene of a project on the project, not on the home list', function () {
    $project = Project::factory()->create(['slug' => ['pt' => 'fazenda-boa-vista-jhsf', 'en' => 'fazenda-boa-vista']]);
    $scene = sceneWithPhoto(['project_id' => $project->id]);
    $scene->hotspots()->create(['product_id' => publishedProduct()->id, 'x' => 38, 'y' => 56]);
    sceneWithPhoto(['project_id' => $project->id, 'is_published' => false, 'sort_order' => -1]);

    expect($this->getJson('/api/v1/scenes')->assertOk()->json('data'))->toHaveCount(0);

    $detail = $this->getJson('/api/v1/projects/fazenda-boa-vista-jhsf')->assertOk();
    expect($detail->json('data.scene.id'))->toBe($scene->id)
        ->and($detail->json('data.scene.hotspots.0'))->toMatchArray(['x' => 38, 'y' => 56])
        ->and($detail->json('data.scene.hotspots.0.product.slug'))->toBe('cadeira-aura');

    $list = $this->getJson('/api/v1/projects')->assertOk();
    expect($list->json('data.0.scene.id'))->toBe($scene->id);
});
