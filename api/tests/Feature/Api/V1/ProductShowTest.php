<?php

use Illuminate\Support\Facades\File;

beforeEach(fn () => useScratchDownloadsDisk());

afterEach(fn () => File::deleteDirectory(storage_path('framework/testing/downloads')));

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

it('finds the product by the portuguese slug when it has no english slug', function () {
    publishedProduct(['slug' => ['pt' => 'cadeira-aura']]);

    $this->getJson('/api/v1/products/cadeira-aura?locale=en')
        ->assertOk()
        ->assertJsonPath('data.slugs', ['pt' => 'cadeira-aura', 'en' => null]);
});

it('does not take the portuguese slug of a product that has its own english slug', function () {
    publishedProduct();

    $this->getJson('/api/v1/products/cadeira-aura?locale=en')->assertNotFound();
});

it('hides unpublished products', function () {
    publishedProduct(['is_published' => false]);
    $this->getJson('/api/v1/products/cadeira-aura')->assertNotFound();
});

it('hides soft-deleted products', function () {
    $product = publishedProduct();
    $product->delete();

    $this->getJson('/api/v1/products/cadeira-aura')->assertNotFound();
});

it('omits the 3d model when disabled', function () {
    $product = publishedProduct(['is_3d_enabled' => false]);
    $product->addMediaFromString(minimalGlb())->usingFileName('aura.glb')->toMediaCollection('model_3d');

    $this->getJson('/api/v1/products/cadeira-aura')->assertJsonPath('data.model_3d', null);
});

it('says the 3d model exists without exposing its address', function () {
    $product = publishedProduct(['is_3d_enabled' => true]);
    $product->addMediaFromString(minimalGlb())->usingFileName('aura.glb')->toMediaCollection('model_3d');

    $response = $this->getJson('/api/v1/products/cadeira-aura')->assertOk();

    expect($response->json('data.model_3d'))->toBe(['size' => 12])
        ->and($product->getFirstMedia('model_3d')->disk)->toBe('downloads');
});

it('creates a temporary link to the private 3d model', function () {
    $product = publishedProduct(['is_3d_enabled' => true]);
    $product->addMediaFromString(minimalGlb())->usingFileName('aura.glb')->toMediaCollection('model_3d');

    $url = $this->postJson('/api/v1/products/cadeira-aura/model-3d/link')
        ->assertCreated()
        ->assertJsonStructure(['data' => ['url', 'expires_at']])
        ->json('data.url');

    expect($url)->toContain('aura.glb')->toContain('signature=');
    $this->withHeaders(['Origin' => 'http://localhost:3000'])->get($url)
        ->assertOk()
        ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    $this->get(str_replace('signature=', 'signature=x', $url))->assertForbidden();
    $this->postJson('/api/v1/products/aura-chair/model-3d/link?locale=en')->assertCreated();
});

it('refuses a 3d link for a product with the 3d off, without a model or unpublished', function () {
    $product = publishedProduct(['is_3d_enabled' => false]);
    $product->addMediaFromString(minimalGlb())->usingFileName('aura.glb')->toMediaCollection('model_3d');

    $this->postJson('/api/v1/products/cadeira-aura/model-3d/link')->assertNotFound();

    $product->update(['is_3d_enabled' => true]);
    $product->clearMediaCollection('model_3d');
    $this->postJson('/api/v1/products/cadeira-aura/model-3d/link')->assertNotFound();

    $product->update(['is_published' => false]);
    $this->postJson('/api/v1/products/cadeira-aura/model-3d/link')->assertNotFound();
});

it('rejects unsupported locales', function () {
    $this->getJson('/api/v1/products/x?locale=es')->assertStatus(422)->assertJsonValidationErrors('locale');
});
