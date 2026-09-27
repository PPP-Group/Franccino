<?php

use App\Models\Category;
use App\Models\Product;

it('lists published categories with the contract shape and published-only product count', function () {
    $indoor = area('indoor');
    $category = Category::factory()->create(['name' => ['pt' => 'Cadeiras', 'en' => 'Chairs']]);
    Category::factory()->create(['is_published' => false]);

    Product::factory()->for($indoor)->for($category)->count(2)->create(['is_published' => true]);
    Product::factory()->for($indoor)->for($category)->create(['is_published' => false]);

    $response = $this->getJson('/api/v1/categories')->assertOk();

    $response->assertJsonStructure([
        'data' => ['*' => ['id', 'slug', 'name', 'singular_name', 'cover', 'product_count']],
    ]);

    $payload = collect($response->json('data'))->firstWhere('id', $category->id);
    expect($payload['product_count'])->toBe(2);
    expect(collect($response->json('data'))->pluck('id'))->not->toContain(Category::where('is_published', false)->value('id'));
});

it('filters the category product count by area', function () {
    $indoor = area('indoor');
    $outdoor = area('outdoor');
    $category = Category::factory()->create();

    Product::factory()->for($indoor)->for($category)->create(['is_published' => true]);
    Product::factory()->for($outdoor)->for($category)->count(2)->create(['is_published' => true]);

    $response = $this->getJson('/api/v1/categories?area=outdoor')->assertOk();

    $payload = collect($response->json('data'))->firstWhere('id', $category->id);
    expect($payload['product_count'])->toBe(2);
});

it('shows a category by its localized slug with description, seo and slugs', function () {
    Category::factory()->create([
        'name' => ['pt' => 'Cadeiras', 'en' => 'Chairs'],
        'slug' => ['pt' => 'cadeiras', 'en' => 'chairs'],
        'description' => ['pt' => 'Descrição em texto simples', 'en' => 'Plain text description'],
    ]);

    $this->getJson('/api/v1/categories/chairs?locale=en')
        ->assertOk()
        ->assertJsonPath('data.name', 'Chairs')
        ->assertJsonPath('data.description', 'Plain text description')
        ->assertJsonPath('data.slugs', ['pt' => 'cadeiras', 'en' => 'chairs'])
        ->assertJsonMissingPath('data.product_count');
});

it('returns 404 for an unpublished category', function () {
    Category::factory()->create(['slug' => ['pt' => 'oculta', 'en' => 'hidden'], 'is_published' => false]);

    $this->getJson('/api/v1/categories/oculta')->assertNotFound();
});
