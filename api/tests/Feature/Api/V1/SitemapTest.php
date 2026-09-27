<?php

use App\Models\Category;
use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Launch;
use App\Models\Page;
use App\Models\Product;
use App\Models\Project;

it('includes every public content type with the contract shape', function () {
    publishedProduct();
    CollectionModel::factory()->create();
    Designer::factory()->create(['slug' => 'sitemap-designer']);
    Launch::factory()->create();
    Project::factory()->create();
    Page::factory()->create(['key' => 'factory']);

    $response = $this->getJson('/api/v1/sitemap')->assertOk();

    $response->assertJsonStructure(['data' => ['*' => ['type', 'slugs', 'updated_at']]]);

    $types = collect($response->json('data'))->pluck('type');
    expect($types)->toContain('product', 'category', 'collection', 'designer', 'launch', 'project', 'page');
});

it('adds one category entry per area with a published product, keyed by the area', function () {
    $indoor = area('indoor');
    $outdoor = area('outdoor');
    $category = Category::factory()->create(['slug' => ['pt' => 'cadeiras', 'en' => 'chairs']]);

    Product::factory()->for($indoor)->for($category)->create(['is_published' => true]);
    Product::factory()->for($outdoor)->for($category)->create(['is_published' => true]);

    $response = $this->getJson('/api/v1/sitemap')->assertOk();

    $categoryEntries = collect($response->json('data'))->where('type', 'category');
    expect($categoryEntries)->toHaveCount(2);
    expect($categoryEntries->pluck('key')->sort()->values()->all())->toBe(['indoor', 'outdoor']);
});

it('omits the category entry for an unpublished category even with a published product', function () {
    $indoor = area('indoor');
    $category = Category::factory()->create(['is_published' => false]);
    Product::factory()->for($indoor)->for($category)->create(['is_published' => true]);

    $response = $this->getJson('/api/v1/sitemap')->assertOk();

    $categoryEntries = collect($response->json('data'))->where('type', 'category');
    expect($categoryEntries)->toHaveCount(0);
});

it('uses the page key for page entries, with null slugs', function () {
    Page::factory()->create(['key' => 'factory']);

    $response = $this->getJson('/api/v1/sitemap')->assertOk();

    $entry = collect($response->json('data'))->firstWhere('type', 'page');
    expect($entry['key'])->toBe('factory');
    expect($entry['slugs'])->toBe(['pt' => null, 'en' => null]);
});

it('flags a missing english slug as null', function () {
    Launch::factory()->create(['slug' => ['pt' => 'somente-pt', 'en' => null]]);

    $response = $this->getJson('/api/v1/sitemap')->assertOk();

    $entry = collect($response->json('data'))->firstWhere('slugs.pt', 'somente-pt');
    expect($entry['slugs']['en'])->toBeNull();
});

it('excludes unpublished records', function () {
    CollectionModel::factory()->create(['is_published' => false]);
    Designer::factory()->create(['is_published' => false]);

    $response = $this->getJson('/api/v1/sitemap')->assertOk();

    $types = collect($response->json('data'))->pluck('type');
    expect($types->filter(fn ($type) => in_array($type, ['collection', 'designer']))->count())->toBe(0);
});
