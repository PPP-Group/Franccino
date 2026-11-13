<?php

use App\Models\Product;

it('takes only the test product off the site', function () {
    $test = publishedProduct(['name' => ['pt' => 'Produto de Teste'], 'slug' => ['pt' => 'produto-de-teste']]);
    $migration = require database_path('migrations/2026_11_13_110000_remove_test_product.php');

    $migration->up();

    expect(Product::query()->whereKey($test->id)->exists())->toBeFalse()
        ->and(Product::withTrashed()->whereKey($test->id)->exists())->toBeTrue();

    $migration->down();

    expect(Product::query()->whereKey($test->id)->exists())->toBeTrue();
});

it('leaves a real product with another name alone', function () {
    $real = publishedProduct();
    $migration = require database_path('migrations/2026_11_13_110000_remove_test_product.php');

    $migration->up();

    expect(Product::query()->whereKey($real->id)->exists())->toBeTrue();
});
