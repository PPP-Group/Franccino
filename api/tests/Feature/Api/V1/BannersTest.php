<?php

use App\Models\Banner;

it('lists visible banners for the default placement with the contract shape', function () {
    Banner::factory()->create(['placement' => 'home_hero', 'title' => ['pt' => 'Título', 'en' => 'Title']]);
    Banner::factory()->create(['placement' => 'home_hero', 'is_published' => false]);
    Banner::factory()->create(['placement' => 'home_hero', 'starts_at' => now()->addDay()]);
    Banner::factory()->create(['placement' => 'home_hero', 'ends_at' => now()->subDay()]);

    $response = $this->getJson('/api/v1/banners')->assertOk();

    $response->assertJsonStructure([
        'data' => ['*' => ['title', 'subtitle', 'cta_label', 'cta_url', 'image', 'image_mobile']],
    ]);

    expect($response->json('data'))->toHaveCount(1);
});

it('rejects an unknown placement', function () {
    $this->getJson('/api/v1/banners?placement=unknown')->assertStatus(422);
});
