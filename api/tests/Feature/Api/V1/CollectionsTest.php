<?php

use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Product;

it('lists published collections with the contract shape and published-only product count', function () {
    $indoor = area('indoor');
    $collection = CollectionModel::factory()->create(['name' => ['pt' => 'Linha Verão', 'en' => 'Summer Line']]);
    CollectionModel::factory()->create(['is_published' => false]);

    publishedProduct(['slug' => ['pt' => 'a', 'en' => 'a-en']]);
    $product = Product::factory()->for($indoor)->create(['is_published' => true]);
    $collection->products()->attach($product);

    $response = $this->getJson('/api/v1/collections')->assertOk();

    $response->assertJsonStructure([
        'data' => ['*' => ['id', 'slug', 'name', 'year', 'summary', 'cover', 'product_count']],
    ]);

    $payload = collect($response->json('data'))->firstWhere('id', $collection->id);
    expect($payload['product_count'])->toBe(1);
    expect(collect($response->json('data'))->pluck('id'))->not->toContain(CollectionModel::where('is_published', false)->value('id'));
});

it('shows a collection by its localized slug with description, gallery, designers, products, seo and slugs', function () {
    $indoor = area('indoor');
    $designer = Designer::factory()->create(['name' => 'Marcela', 'slug' => 'marcela']);

    $collection = CollectionModel::factory()->create([
        'name' => ['pt' => 'Linha Verão', 'en' => 'Summer Line'],
        'slug' => ['pt' => 'linha-verao', 'en' => 'summer-line'],
        'description' => ['pt' => '<p>Descrição <script>x</script></p>', 'en' => '<p>Description</p>'],
    ]);

    $product = Product::factory()->for($indoor)->for($designer)->create(['is_published' => true]);
    $collection->products()->attach($product);

    $response = $this->getJson('/api/v1/collections/summer-line?locale=en')->assertOk();

    $response->assertJsonPath('data.name', 'Summer Line')
        ->assertJsonPath('data.description', '<p>Description</p>')
        ->assertJsonPath('data.slugs', ['pt' => 'linha-verao', 'en' => 'summer-line'])
        ->assertJsonPath('data.designers.0.slug', 'marcela')
        ->assertJsonCount(1, 'data.products');
});

it('returns 404 for an unpublished collection', function () {
    CollectionModel::factory()->create(['slug' => ['pt' => 'oculta', 'en' => 'hidden'], 'is_published' => false]);

    $this->getJson('/api/v1/collections/oculta')->assertNotFound();
});
