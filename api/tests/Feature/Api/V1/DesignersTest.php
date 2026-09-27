<?php

use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Product;

it('lists published designers with the contract shape', function () {
    Designer::factory()->create(['name' => 'Andrea Zanocchi', 'slug' => 'andrea-zanocchi']);
    Designer::factory()->create(['is_published' => false]);

    $response = $this->getJson('/api/v1/designers')->assertOk();

    $response->assertJsonStructure([
        'data' => ['*' => ['id', 'slug', 'name', 'short_bio', 'portrait', 'location']],
    ]);

    expect(collect($response->json('data'))->pluck('slug'))->toContain('andrea-zanocchi');
});

it('shows a designer with bio, products and collections', function () {
    $indoor = area('indoor');
    $designer = Designer::factory()->create([
        'name' => 'Andrea Zanocchi',
        'slug' => 'andrea-zanocchi',
        'bio' => ['pt' => '<p>Bio <script>x</script></p>', 'en' => '<p>Bio</p>'],
    ]);

    $product = Product::factory()->for($indoor)->for($designer)->create(['is_published' => true]);
    $collection = CollectionModel::factory()->create();
    $collection->products()->attach($product);

    $response = $this->getJson('/api/v1/designers/andrea-zanocchi?locale=en')->assertOk();

    $response->assertJsonPath('data.slug', 'andrea-zanocchi')
        ->assertJsonPath('data.bio', '<p>Bio</p>')
        ->assertJsonCount(1, 'data.products')
        ->assertJsonCount(1, 'data.collections');
});

it('returns 404 for an unpublished designer', function () {
    Designer::factory()->create(['slug' => 'oculto', 'is_published' => false]);

    $this->getJson('/api/v1/designers/oculto')->assertNotFound();
});
