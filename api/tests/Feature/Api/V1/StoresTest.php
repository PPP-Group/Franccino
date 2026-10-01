<?php

use App\Models\Store;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('lists only published stores with the contract shape and distinct sorted states in meta', function () {
    Store::factory()->create(['state' => 'MG']);
    Store::factory()->create(['state' => 'SP']);
    Store::factory()->create(['state' => 'SP']);
    Store::factory()->create(['is_published' => false, 'state' => 'RJ']);

    $response = $this->getJson('/api/v1/stores')->assertOk();

    $response->assertJsonStructure([
        'data' => ['*' => [
            'id', 'name', 'type', 'address', 'address_complement', 'district', 'city', 'state',
            'postal_code', 'country', 'latitude', 'longitude', 'phone', 'whatsapp', 'email',
            'website_url', 'instagram_url', 'opening_hours', 'description', 'image',
        ]],
        'meta' => ['states'],
    ]);

    expect($response->json('meta.states'))->toBe(['MG', 'SP']);
    expect($response->json('data'))->toHaveCount(3);
});

it('filters stores by state', function () {
    Store::factory()->create(['state' => 'MG']);
    Store::factory()->count(2)->create(['state' => 'SP']);

    $response = $this->getJson('/api/v1/stores?state=SP')->assertOk();

    expect($response->json('data'))->toHaveCount(2);
});

it('filters stores by type', function () {
    Store::factory()->create(['type' => 'exclusive']);
    Store::factory()->count(2)->create(['type' => 'reseller']);

    $response = $this->getJson('/api/v1/stores?type=reseller')->assertOk();

    expect($response->json('data'))->toHaveCount(2);
});

it('returns the store description in the request locale and the store image', function () {
    Storage::fake('media');
    $store = Store::factory()->create(['description' => ['pt' => 'Showroom com a linha completa.', 'en' => 'Showroom with the full line.']]);
    $store->addMedia(UploadedFile::fake()->image('loja.jpg', 800, 600))->toMediaCollection('image');

    $pt = $this->getJson('/api/v1/stores')->assertOk();
    expect($pt->json('data.0.description'))->toBe('Showroom com a linha completa.')
        ->and($pt->json('data.0.image.width'))->toBe(800);

    expect($this->getJson('/api/v1/stores?locale=en')->json('data.0.description'))->toBe('Showroom with the full line.');
});

it('returns null description and image when the store has neither', function () {
    Store::factory()->create();

    $response = $this->getJson('/api/v1/stores')->assertOk();
    expect($response->json('data.0.description'))->toBeNull()
        ->and($response->json('data.0.image'))->toBeNull();
});
