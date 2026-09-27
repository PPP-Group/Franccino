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

it('matches designers and collections case-insensitively', function () {
    Designer::factory()->create(['name' => 'Andrea Zanocchi']);
    CollectionModel::factory()->create(['name' => ['pt' => 'Edicao Studio', 'en' => 'Studio Edition']]);

    $response = $this->getJson('/api/v1/search?q=ANDREA')->assertOk();
    expect($response->json('data.designers'))->toHaveCount(1);

    $response = $this->getJson('/api/v1/search?q=STUDIO')->assertOk();
    expect($response->json('data.collections'))->toHaveCount(1);
});

it('treats % and _ in designer/collection search terms as literal characters', function () {
    Designer::factory()->create(['name' => 'Studio 50% Design']);
    Designer::factory()->create(['name' => 'Studio 50X Design']);

    $response = $this->getJson('/api/v1/search?'.http_build_query(['q' => '50% design']))->assertOk();
    expect($response->json('data.designers'))->toHaveCount(1);

    CollectionModel::factory()->create(['name' => ['pt' => 'Serie Art_Deco', 'en' => 'Art_Deco Series']]);
    CollectionModel::factory()->create(['name' => ['pt' => 'Serie ArtXDeco', 'en' => 'ArtXDeco Series']]);

    $response = $this->getJson('/api/v1/search?'.http_build_query(['q' => 'art_deco']))->assertOk();
    expect($response->json('data.collections'))->toHaveCount(1);
});
