<?php

use App\Support\WordPress\ProductPageParser;

function productPageHtml(): string
{
    return <<<'HTML'
        <div class="jet-engine-gallery-slider__item"><a href="https://franccino.com.br/wp-content/uploads/2026/03/Epoca-2-scaled.webp" class="x">
        <img src="https://franccino.com.br/wp-content/uploads/2026/03/Epoca-2-768x512.webp"></a></div>
        <div class="jet-engine-gallery-slider__item"><a href="https://franccino.com.br/wp-content/uploads/2026/03/Epoca-1-scaled.webp" class="x"></a></div>
        <div class="jet-engine-gallery-slider__item"><a href="https://franccino.com.br/wp-content/uploads/2026/03/Epoca-2-scaled.webp" class="x"></a></div>
        <div class="jet-listing-dynamic-field__content"></div>
        <div class="jet-listing-dynamic-field__content">Medida padrão: Modelo I</div>
        <div class="jet-listing-dynamic-field__content">50L x 50P x 45A (cm)</div>
        <div class="jet-listing-dynamic-field__content">Materiais:</div>
        <div class="jet-listing-dynamic-field__content">Estrutura em madeira tauari<br>e tampo em pedra &amp; MDF.</div>
        <div class="jet-listing-dynamic-field__content">Bloco teste</div>
        <a href="https://franccino.com.br/designer/la-mamba/">La Mamba</a>
        <a href="https://franccino.com.br/designer/andrea-zanocchi/">Andrea</a>
        HTML;
}

it('lists gallery images in page order without repeats', function () {
    expect((new ProductPageParser)->gallery(productPageHtml()))->toBe([
        'https://franccino.com.br/wp-content/uploads/2026/03/Epoca-2-scaled.webp',
        'https://franccino.com.br/wp-content/uploads/2026/03/Epoca-1-scaled.webp',
    ]);
});

it('pairs technical labels with their values and ignores unrelated fields', function () {
    expect((new ProductPageParser)->specs(productPageHtml()))->toBe([
        ['label' => 'Medida padrão: Modelo I', 'value' => '50L x 50P x 45A (cm)'],
        ['label' => 'Materiais', 'value' => "Estrutura em madeira tauari\ne tampo em pedra & MDF."],
    ]);
});

it('takes the first linked designer', function () {
    expect((new ProductPageParser)->designerSlug(productPageHtml()))->toBe('la-mamba')
        ->and((new ProductPageParser)->designerSlug('<p>sem designer</p>'))->toBeNull();
});
