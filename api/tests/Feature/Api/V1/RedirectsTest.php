<?php

use App\Models\Redirect;

it('lists only active redirects in the contract shape', function () {
    Redirect::factory()->create(['from_path' => '/antigo', 'to_path' => '/novo', 'status_code' => 301]);
    Redirect::factory()->gone()->create(['from_path' => '/removido']);
    Redirect::factory()->create(['is_active' => false]);

    $response = $this->getJson('/api/v1/redirects')->assertOk();

    $response->assertJsonStructure(['data' => ['*' => ['from', 'to', 'status']]]);
    expect($response->json('data'))->toHaveCount(2);

    $gone = collect($response->json('data'))->firstWhere('from', '/removido');
    expect($gone['to'])->toBeNull();
    expect($gone['status'])->toBe(410);
});
