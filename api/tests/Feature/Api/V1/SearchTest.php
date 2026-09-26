<?php

use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Product;

it('rejects a query shorter than 2 characters', function () {
    $this->getJson('/api/v1/search?q=a')->assertStatus(422)->assertJsonValidationErrors('q');
    $this->getJson('/api/v1/search')->assertStatus(422)->assertJsonValidationErrors('q');
});

it('returns up to 12 products, 6 designers and 6 collections', function () {
    $indoor = area('indoor');

    Product::factory()->for($indoor)->count(15)->create(['name' => ['pt' => 'Sofa Teste', 'en' => 'Test Sofa']]);
    Designer::factory()->count(8)->create(['name' => 'Sofa Designer']);
    CollectionModel::factory()->count(8)->create(['name' => ['pt' => 'Sofa Collection', 'en' => 'Sofa Collection']]);

    $response = $this->getJson('/api/v1/search?q=sofa')->assertOk();

    expect($response->json('data.products'))->toHaveCount(12);
    expect($response->json('data.designers'))->toHaveCount(6);
    expect($response->json('data.collections'))->toHaveCount(6);
});
