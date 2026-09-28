<?php

use App\Models\Banner;
use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Launch;
use App\Models\Product;

it('returns the home contract shape', function () {
    $this->getJson('/api/v1/home')->assertOk()->assertJsonStructure([
        'data' => ['banners', 'featured_products', 'featured_collections', 'current_launch', 'designers'],
    ]);
});

it('only lists visible home_hero banners', function () {
    Banner::factory()->create(['placement' => 'home_hero', 'is_published' => true]);
    Banner::factory()->create(['placement' => 'home_hero', 'is_published' => false]);
    Banner::factory()->create(['placement' => 'home_hero', 'starts_at' => now()->addDay()]);

    $response = $this->getJson('/api/v1/home')->assertOk();

    expect($response->json('data.banners'))->toHaveCount(1);
});

it('only lists published featured products, up to 12', function () {
    $indoor = area('indoor');

    Product::factory()->for($indoor)->count(13)->create(['is_featured' => true, 'is_published' => true]);
    Product::factory()->for($indoor)->create(['is_featured' => false, 'is_published' => true]);
    Product::factory()->for($indoor)->create(['is_featured' => true, 'is_published' => false]);

    $response = $this->getJson('/api/v1/home')->assertOk();

    expect($response->json('data.featured_products'))->toHaveCount(12);
});

it('only lists published featured collections, up to 6', function () {
    CollectionModel::factory()->count(7)->create(['is_featured' => true, 'is_published' => true]);
    CollectionModel::factory()->create(['is_featured' => false, 'is_published' => true]);
    CollectionModel::factory()->create(['is_featured' => true, 'is_published' => false]);

    $response = $this->getJson('/api/v1/home')->assertOk();

    expect($response->json('data.featured_collections'))->toHaveCount(6);
});

it('shows the published launch with the highest year as the current launch', function () {
    Launch::factory()->create(['year' => 2024, 'is_published' => true]);
    Launch::factory()->create(['year' => 2026, 'is_published' => true]);
    Launch::factory()->create(['year' => 2027, 'is_published' => false]);

    $response = $this->getJson('/api/v1/home')->assertOk();

    expect($response->json('data.current_launch.year'))->toBe(2026);
});

it('returns null current launch when there is none published', function () {
    Launch::factory()->create(['is_published' => false]);

    $this->getJson('/api/v1/home')->assertOk()->assertJsonPath('data.current_launch', null);
});

it('only lists published designers, ordered, up to 16', function () {
    Designer::factory()->count(17)->create(['is_published' => true]);
    Designer::factory()->create(['is_published' => false]);

    $response = $this->getJson('/api/v1/home')->assertOk();

    expect($response->json('data.designers'))->toHaveCount(16);
});
