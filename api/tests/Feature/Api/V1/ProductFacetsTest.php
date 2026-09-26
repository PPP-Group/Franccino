<?php

use App\Models\Category;
use App\Models\Product;

it('counts categories within an area, ignoring products from other areas', function () {
    $indoor = area('indoor');
    $outdoor = area('outdoor');

    $chairs = Category::factory()->create(['name' => ['pt' => 'Cadeiras', 'en' => 'Chairs']]);
    $tables = Category::factory()->create(['name' => ['pt' => 'Mesas', 'en' => 'Tables']]);

    Product::factory()->for($outdoor)->for($chairs)->count(2)->create();
    Product::factory()->for($indoor)->for($chairs)->create();
    Product::factory()->for($outdoor)->for($tables)->create();

    $response = $this->getJson('/api/v1/products/facets?area=outdoor')->assertOk();

    $categories = collect($response->json('data.categories'))->keyBy('name');

    expect($categories['Cadeiras']['count'])->toBe(2);
    expect($categories['Mesas']['count'])->toBe(1);
});

it('ignores unpublished products in the counts', function () {
    $indoor = area('indoor');
    $category = Category::factory()->create();

    Product::factory()->for($indoor)->for($category)->create(['is_published' => true]);
    Product::factory()->for($indoor)->for($category)->create(['is_published' => false]);

    $response = $this->getJson('/api/v1/products/facets')->assertOk();

    $payload = collect($response->json('data.categories'))->firstWhere('name', Category::first()->getTranslation('name', 'pt', false));

    expect($payload['count'])->toBe(1);
});

it('returns the expected facet groups', function () {
    publishedProduct();

    $this->getJson('/api/v1/products/facets')
        ->assertOk()
        ->assertJsonStructure(['data' => ['categories', 'designers', 'collections', 'lines', 'finish_groups']]);
});

it('rejects an invalid area filter', function () {
    $this->getJson('/api/v1/products/facets?area=bogus')->assertStatus(422);
});
