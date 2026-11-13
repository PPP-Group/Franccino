<?php

use App\Models\Banner;
use App\Models\Scene;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('media');
    config(['media-library.queue_conversions_by_default' => false]);
    config(['franccino.import.token' => 'abc123']);
});

function bannerPhoto(): int
{
    $banner = Banner::factory()->create();

    return $banner->addMedia(UploadedFile::fake()->image('banner.jpg', 2560, 1440))->toMediaCollection('image')->id;
}

it('saves the points of a photo already on the site and lists them by its media id', function () {
    publishedProduct();
    $media = bannerPhoto();
    $auth = ['Authorization' => 'Bearer abc123'];

    $this->postJson('/api/import/image-points', ['items' => [[
        'media_id' => $media,
        'title' => 'Banner 1',
        'points' => [
            ['x' => 40, 'y' => 62.5, 'product' => 'cadeira-aura'],
            ['x' => 70, 'y' => 50, 'product' => 'peca-que-nao-existe'],
        ],
    ]]], $auth)
        ->assertOk()
        ->assertJsonPath('data.scenes', 1)
        ->assertJsonPath('data.points', 1)
        ->assertJsonPath('data.not_found', ['peca-que-nao-existe']);

    $response = $this->getJson('/api/v1/image-points')->assertOk();
    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.media_id'))->toBe($media)
        ->and($response->json('data.0.hotspots.0'))->toMatchArray(['x' => 40, 'y' => 62.5])
        ->and($response->json('data.0.hotspots.0.product.slug'))->toBe('cadeira-aura');

    // Os pontos de uma foto do site não entram na lista de ambientes da home.
    expect($this->getJson('/api/v1/scenes')->json('data'))->toBe([]);
});

it('replaces the points on a second import and removes them with an empty list', function () {
    publishedProduct();
    $media = bannerPhoto();
    $auth = ['Authorization' => 'Bearer abc123'];
    $send = fn (array $points) => $this->postJson('/api/import/image-points', [
        'items' => [['media_id' => $media, 'points' => $points]],
    ], $auth)->assertOk();

    $send([['x' => 10, 'y' => 10, 'product' => 'cadeira-aura'], ['x' => 20, 'y' => 20, 'product' => 'cadeira-aura']]);
    $send([['x' => 30, 'y' => 30, 'product' => 'cadeira-aura']]);
    expect(Scene::query()->where('photo_media_id', $media)->sole()->hotspots)->toHaveCount(1);

    $send([])->assertJsonPath('data.removed', 1);
    expect(Scene::query()->where('photo_media_id', $media)->exists())->toBeFalse();
});

it('replaces the points of an existing scene, like the one of a project', function () {
    publishedProduct();
    $scene = Scene::factory()->create();
    $scene->addMedia(UploadedFile::fake()->image('ambiente.jpg', 1600, 900))->toMediaCollection('image');

    $this->postJson('/api/import/image-points', ['items' => [[
        'scene_id' => $scene->id,
        'points' => [['x' => 55, 'y' => 45, 'product' => 'cadeira-aura']],
    ]]], ['Authorization' => 'Bearer abc123'])->assertOk();

    expect($scene->fresh()->hotspots->first()->x)->toBe(55.0);
});

it('hides unpublished scenes and pieces', function () {
    $media = bannerPhoto();
    $scene = Scene::factory()->create(['photo_media_id' => $media, 'is_published' => false]);
    $scene->hotspots()->create(['product_id' => publishedProduct()->id, 'x' => 10, 'y' => 10]);

    expect($this->getJson('/api/v1/image-points')->json('data'))->toBe([]);
});
