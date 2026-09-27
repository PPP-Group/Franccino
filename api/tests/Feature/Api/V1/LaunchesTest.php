<?php

use App\Models\Launch;
use App\Models\Product;

it('lists published launches with the contract shape', function () {
    Launch::factory()->create(['title' => ['pt' => 'Lançamentos 2026', 'en' => '2026 Launches']]);
    Launch::factory()->create(['is_published' => false]);

    $response = $this->getJson('/api/v1/launches')->assertOk();

    $response->assertJsonStructure([
        'data' => ['*' => ['id', 'slug', 'title', 'year', 'summary', 'cover']],
    ]);
});

it('shows a launch by its localized slug with description, gallery, products, seo and slugs', function () {
    $indoor = area('indoor');
    $launch = Launch::factory()->create([
        'title' => ['pt' => 'Lançamentos 2026', 'en' => '2026 Launches'],
        'slug' => ['pt' => 'lancamentos-2026', 'en' => '2026-launches'],
        'description' => ['pt' => '<p>Texto <script>x</script></p>', 'en' => '<p>Text</p>'],
    ]);

    $product = Product::factory()->for($indoor)->create(['is_published' => true]);
    $launch->products()->attach($product);

    $response = $this->getJson('/api/v1/launches/2026-launches?locale=en')->assertOk();

    $response->assertJsonPath('data.title', '2026 Launches')
        ->assertJsonPath('data.description', '<p>Text</p>')
        ->assertJsonPath('data.slugs', ['pt' => 'lancamentos-2026', 'en' => '2026-launches'])
        ->assertJsonCount(1, 'data.products');
});

it('returns 404 for an unpublished launch', function () {
    Launch::factory()->create(['slug' => ['pt' => 'oculto', 'en' => 'hidden'], 'is_published' => false]);

    $this->getJson('/api/v1/launches/oculto')->assertNotFound();
});
