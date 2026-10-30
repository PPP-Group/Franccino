<?php

use App\Models\Banner;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('lists visible banners for the default placement with the contract shape', function () {
    Banner::factory()->create(['placement' => 'home_hero', 'title' => ['pt' => 'Título', 'en' => 'Title']]);
    Banner::factory()->create(['placement' => 'home_hero', 'is_published' => false]);
    Banner::factory()->create(['placement' => 'home_hero', 'starts_at' => now()->addDay()]);
    Banner::factory()->create(['placement' => 'home_hero', 'ends_at' => now()->subDay()]);

    $response = $this->getJson('/api/v1/banners')->assertOk();

    $response->assertJsonStructure([
        'data' => ['*' => ['title', 'subtitle', 'cta_label', 'cta_url', 'image', 'image_mobile', 'video']],
    ]);

    expect($response->json('data'))->toHaveCount(1);
});

it('rejects an unknown placement', function () {
    $this->getJson('/api/v1/banners?placement=unknown')->assertStatus(422);
});

it('serves the looping video by its public url, and null without one', function () {
    Storage::fake('media');
    $withVideo = Banner::factory()->create(['placement' => 'home_hero', 'sort_order' => 1]);
    $withVideo->addMedia(UploadedFile::fake()->create('loop.mp4', 512, 'video/mp4'))->toMediaCollection('video');
    Banner::factory()->create(['placement' => 'home_hero', 'sort_order' => 2]);

    $banners = $this->getJson('/api/v1/banners')->assertOk()->json('data');

    expect($banners[0]['video'])->toEndWith('loop.mp4')
        ->and($banners[1]['video'])->toBeNull();
});
