<?php

use App\Models\Store;

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
            'website_url', 'instagram_url', 'opening_hours',
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
