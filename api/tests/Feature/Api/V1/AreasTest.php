<?php

use App\Models\Category;
use App\Models\Product;

it('lists areas with the contract shape and published-only product count', function () {
    $indoor = area('indoor');
    area('outdoor');

    Product::factory()->for($indoor)->count(2)->create(['is_published' => true]);
    Product::factory()->for($indoor)->create(['is_published' => false]);

    $response = $this->getJson('/api/v1/areas')->assertOk();

    $response->assertJsonStructure([
        'data' => [
            '*' => ['key', 'name', 'brand_name', 'description', 'cover', 'product_count', 'seo' => ['title', 'description', 'image']],
        ],
    ]);

    $indoorPayload = collect($response->json('data'))->firstWhere('key', 'indoor');
    expect($indoorPayload['product_count'])->toBe(2);
});

it('shows an area with only the categories that have a published product in it', function () {
    $indoor = area('indoor');
    $outdoor = area('outdoor');

    $withProduct = Category::factory()->create(['name' => ['pt' => 'Cadeiras', 'en' => 'Chairs']]);
    $withoutProduct = Category::factory()->create(['name' => ['pt' => 'Mesas', 'en' => 'Tables']]);

    Product::factory()->for($indoor)->for($withProduct)->create(['is_published' => true]);
    Product::factory()->for($outdoor)->for($withoutProduct)->create(['is_published' => true]);

    $response = $this->getJson('/api/v1/areas/indoor')->assertOk();

    $response->assertJsonPath('data.key', 'indoor');
    $categorySlugs = collect($response->json('data.categories'))->pluck('name');
    expect($categorySlugs)->toContain('Cadeiras')->not->toContain('Mesas');
});

it('returns 404 for an unknown area key', function () {
    $this->getJson('/api/v1/areas/unknown')->assertNotFound();
});
