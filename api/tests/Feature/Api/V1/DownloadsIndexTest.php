<?php

use App\Models\Product;
use App\Models\ProductFile;

it('lists only published products with at least one published file, without the file path', function () {
    $withFile = publishedProduct(['slug' => ['pt' => 'com-arquivo', 'en' => 'with-file']]);
    ProductFile::factory()->for($withFile)->create(['is_published' => true]);

    $withUnpublishedFile = Product::factory()->for(area('indoor'))->create(['is_published' => true]);
    ProductFile::factory()->for($withUnpublishedFile)->create(['is_published' => false]);

    Product::factory()->for(area('indoor'))->create(['is_published' => true]);

    $response = $this->getJson('/api/v1/downloads')->assertOk();

    $response->assertJsonStructure([
        'data' => ['*' => ['id', 'slug', 'name', 'area', 'category', 'designer', 'cover', 'is_new', 'files' => ['*' => ['id', 'type', 'title', 'format', 'size']]]],
        'links' => ['first', 'last', 'prev', 'next'],
        'meta' => ['current_page', 'last_page', 'per_page', 'total'],
    ]);

    expect($response->json('meta.total'))->toBe(1);
    $response->assertJsonMissingPath('data.0.files.0.path');
});
