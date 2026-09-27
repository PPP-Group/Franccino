<?php

use App\Models\Client;

it('lists only published clients with the contract shape', function () {
    Client::factory()->create(['name' => 'JHSF']);
    Client::factory()->create(['is_published' => false]);

    $response = $this->getJson('/api/v1/clients')->assertOk();

    $response->assertJsonStructure(['data' => ['*' => ['id', 'name', 'url', 'logo']]]);
    expect(collect($response->json('data'))->pluck('name'))->toContain('JHSF')->toHaveCount(1);
});
