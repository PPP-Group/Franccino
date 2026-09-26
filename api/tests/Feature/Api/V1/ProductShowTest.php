<?php

it('returns the product detail in portuguese by default', function () {
    publishedProduct();

    $this->getJson('/api/v1/products/cadeira-aura')
        ->assertOk()
        ->assertJsonPath('data.name', 'Cadeira Aura')
        ->assertJsonPath('data.slugs', ['pt' => 'cadeira-aura', 'en' => 'aura-chair'])
        ->assertJsonPath('data.category.singular_name', 'Cadeira')
        ->assertJsonPath('data.area.key', 'indoor')
        ->assertJsonPath('data.designer.slug', 'andrea-zanocchi')
        ->assertJsonPath('data.locale_fallback', false)
        ->assertJsonPath('data.model_3d', null)
        ->assertJsonMissingPath('data.search_text');

    expect($this->getJson('/api/v1/products/cadeira-aura')->json('data.description'))->not->toContain('script');
});

it('finds the product by the english slug', function () {
    publishedProduct();

    $this->getJson('/api/v1/products/aura-chair?locale=en')
        ->assertOk()
        ->assertJsonPath('data.name', 'Aura Chair')
        ->assertJsonPath('data.category.name', 'Chairs');
});

it('flags fallback when english is missing', function () {
    publishedProduct(['name' => ['pt' => 'Mesa Joey'], 'slug' => ['pt' => 'mesa-joey', 'en' => 'joey-table'], 'description' => ['pt' => '<p>x</p>']]);

    $this->getJson('/api/v1/products/joey-table?locale=en')
        ->assertOk()
        ->assertJsonPath('data.name', 'Mesa Joey')
        ->assertJsonPath('data.locale_fallback', true);
});

it('hides unpublished and trashed products', function () {
    publishedProduct(['is_published' => false]);
    $this->getJson('/api/v1/products/cadeira-aura')->assertNotFound();
});

it('omits the 3d model when disabled', function () {
    $product = publishedProduct(['is_3d_enabled' => false]);
    $product->addMediaFromString(minimalGlb())->usingFileName('aura.glb')->toMediaCollection('model_3d');

    $this->getJson('/api/v1/products/cadeira-aura')->assertJsonPath('data.model_3d', null);
});

it('exposes the 3d model when enabled', function () {
    $product = publishedProduct(['is_3d_enabled' => true]);
    $product->addMediaFromString(minimalGlb())->usingFileName('aura.glb')->toMediaCollection('model_3d');

    $response = $this->getJson('/api/v1/products/cadeira-aura')->assertOk();

    expect($response->json('data.model_3d.url'))->toContain('aura.glb');
    expect($response->json('data.model_3d.size'))->not->toBeNull();
});

it('rejects unsupported locales', function () {
    $this->getJson('/api/v1/products/x?locale=es')->assertStatus(422)->assertJsonValidationErrors('locale');
});
