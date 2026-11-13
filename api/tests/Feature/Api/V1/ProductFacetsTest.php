<?php

use App\Models\Category;
use App\Models\Collection;
use App\Models\Designer;
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
        ->assertJsonStructure(['data' => ['categories', 'designers', 'collections', 'lines', 'finish_groups', 'rooms', 'products']]);
});

it('rejects an invalid area filter', function () {
    $this->getJson('/api/v1/products/facets?area=bogus')->assertStatus(422);
});

it('treats % in the q filter as a literal character, not a SQL wildcard', function () {
    $indoor = area('indoor');
    $category = Category::factory()->create();

    Product::factory()->for($indoor)->for($category)->create(['name' => ['pt' => 'Sofa 50% Off', 'en' => 'Sofa 50% Off']]);
    Product::factory()->for($indoor)->for($category)->create(['name' => ['pt' => 'Sofa 50X Off', 'en' => 'Sofa 50X Off']]);

    $response = $this->getJson('/api/v1/products/facets?'.http_build_query(['q' => '50% off']))->assertOk();

    $payload = collect($response->json('data.categories'))->firstWhere('slug', $category->getTranslation('slug', 'pt', false));

    expect($payload['count'])->toBe(1);
});

it('counts products by room, in the order of the room list (revisão de 12/11/2026)', function () {
    $indoor = area('indoor');
    Product::factory()->for($indoor)->create(['rooms' => ['dining', 'living']]);
    Product::factory()->for($indoor)->create(['rooms' => ['living']]);
    Product::factory()->for($indoor)->create(['rooms' => null]);

    $this->getJson('/api/v1/products/facets')
        ->assertOk()
        ->assertJsonPath('data.rooms', [['key' => 'dining', 'count' => 1], ['key' => 'living', 'count' => 2]]);
});

it('lists the filter keys of each matching product, so the site can cross the filters', function () {
    $indoor = area('indoor');
    $outdoor = area('outdoor');
    $sideboards = Category::factory()->create(['slug' => ['pt' => 'aparadores', 'en' => 'sideboards']]);
    $designer = Designer::factory()->create(['slug' => 'ana']);
    $tempo = Collection::factory()->create(['slug' => ['pt' => 'tempo', 'en' => 'tempo']]);

    $piece = Product::factory()->for($indoor)->for($sideboards)->for($designer)->create(['rooms' => ['living']]);
    $piece->collections()->attach($tempo);
    Product::factory()->for($outdoor)->for($sideboards)->create();

    $products = $this->getJson('/api/v1/products/facets?area=indoor')->assertOk()->json('data.products');

    expect($products)->toBe([
        ['category' => 'aparadores', 'designer' => 'ana', 'collections' => ['tempo'], 'rooms' => ['living']],
    ]);
});
