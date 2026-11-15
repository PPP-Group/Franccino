<?php

use App\Models\Product;

/** Roda de novo a migration da Poltrona Tatu sobre o que estiver salvo. */
function runTatuMigration(): void
{
    $migration = require database_path('migrations/2026_11_15_110000_fix_and_translate_poltrona_tatu.php');
    $migration->up();
}

it('fixes the typos in the portuguese text and fills the english version', function () {
    $product = Product::factory()->create([
        'name' => ['pt' => 'Poltrona Tatu'],
        'slug' => ['pt' => 'poltrona-tatu'],
        'tagline' => ['pt' => 'Trabalho artesanal com calor humano.'],
        'description' => ['pt' => '<p>A Poltrona Tatu te sua ergonomia do casco de um dos animas mais curiosos da fauna '
            .'brasileira, e é a inspiração de Sergio J. Matos para a criação da poltrona Tatu.</p>'],
    ]);

    runTatuMigration();

    $product->refresh();
    expect($product->getTranslation('description', 'pt'))
        ->toBe('<p>A Poltrona Tatu tem sua ergonomia do casco de um dos animais mais curiosos da fauna brasileira, e é a '
            .'inspiração de Sérgio J. Matos para a criação da poltrona Tatu.</p>')
        ->and($product->getTranslation('name', 'en', false))->toBe('Tatu Armchair')
        ->and($product->getTranslation('slug', 'en', false))->toBe('tatu-armchair')
        ->and($product->getTranslation('tagline', 'en', false))->toBe('Handcrafted work with human warmth.')
        ->and($product->getTranslation('description', 'en', false))->toStartWith('<p>The Tatu Armchair');
});

it('keeps an english text already written in the panel', function () {
    $product = Product::factory()->create([
        'name' => ['pt' => 'Poltrona Tatu', 'en' => 'Armadillo Chair'],
        'slug' => ['pt' => 'poltrona-tatu', 'en' => 'armadillo-chair'],
    ]);

    runTatuMigration();

    $product->refresh();
    expect($product->getTranslation('name', 'en'))->toBe('Armadillo Chair')
        ->and($product->getTranslation('slug', 'en'))->toBe('armadillo-chair');
});

it('does nothing without the piece', function () {
    $other = Product::factory()->create(['name' => ['pt' => 'Cadeira Aura'], 'slug' => ['pt' => 'cadeira-aura']]);

    runTatuMigration();

    expect($other->refresh()->getTranslation('name', 'en', false))->toBe('');
});
