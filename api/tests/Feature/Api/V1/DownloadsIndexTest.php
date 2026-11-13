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

it('filters by file type and lists the formats with how many pieces have each', function () {
    $glb = publishedProduct(['slug' => ['pt' => 'com-glb', 'en' => 'with-glb']]);
    ProductFile::factory()->for($glb)->create(['is_published' => true, 'format' => 'glb']);
    ProductFile::factory()->for($glb)->create(['is_published' => true, 'format' => 'SKP']);
    $skp = Product::factory()->for(area('indoor'))->create(['is_published' => true]);
    ProductFile::factory()->for($skp)->create(['is_published' => true, 'format' => 'SKP']);

    $response = $this->getJson('/api/v1/downloads?format=glb')->assertOk();

    expect($response->json('meta.total'))->toBe(1)
        ->and($response->json('data.0.id'))->toBe($glb->id)
        ->and($response->json('meta.formats'))->toBe([
            ['format' => 'SKP', 'count' => 2],
            ['format' => 'GLB', 'count' => 1],
        ]);
});
