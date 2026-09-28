<?php

it('sends a no-store cache-control header on every read', function () {
    $response = $this->getJson('/api/v1/areas');

    expect($response->headers->get('Cache-Control'))->toContain('no-store');
});

it('defaults to portuguese when no locale is given', function () {
    publishedProduct();

    $this->getJson('/api/v1/products/cadeira-aura')->assertOk()->assertJsonPath('data.name', 'Cadeira Aura');
});

it('rejects an unsupported locale with a 422 validation error', function () {
    $response = $this->getJson('/api/v1/areas?locale=fr')
        ->assertStatus(422)
        ->assertJsonStructure(['message', 'errors' => ['locale']]);

    expect($response->headers->get('Cache-Control'))->toContain('no-store');
});

it('accepts each supported locale', function () {
    $this->getJson('/api/v1/areas?locale=pt')->assertOk();
    $this->getJson('/api/v1/areas?locale=en')->assertOk();
});
