<?php

use App\Support\WordPress\PageContentParser;

$html = <<<'HTML'
    <div class="elementor-widget-container"><h2 class="elementor-heading-title">quem somos</h2></div>
    <div class="elementor-widget-container"><p>Peças exclusivas&nbsp;e especiais.</p></div>
    <div class="elementor-widget-container"><p>Peças exclusivas e especiais.</p></div>
    <ul><li><p>Primeira loja</p></li><li>Primeira fábrica</li></ul>
    <h2>NOSSA HISTÓRIA</h2>
    <div class="e-n-carousel swiper"><div class="swiper-wrapper">
      <div class="swiper-slide"><h2>2000</h2><h2>Fundação da Franccino.</h2><ul><li>Primeira loja (SP)</li><li>Primeira fábrica</li></ul></div>
      <div class="swiper-slide"><h2>2008</h2><h2>Criação do Estúdio Franccino</h2></div>
    </div></div>
    <div class="swiper"><div class="swiper-slide"><img src="x.png"></div></div>
    <h3>Certificados</h3>
    HTML;

it('turns headings, paragraphs and lists into rich text up to the stop heading', function () use ($html) {
    expect((new PageContentParser)->richText($html, 'nossa história'))->toBe(implode("\n", [
        '<h2>Quem somos</h2>',
        '<p>Peças exclusivas e especiais.</p>',
        '<ul><li>Primeira loja</li><li>Primeira fábrica</li></ul>',
    ]));
});

it('keeps reading past headings when there is no stop heading and skips carousels', function () use ($html) {
    expect((new PageContentParser)->richText($html))
        ->toContain('<h2>Nossa história</h2>')
        ->toContain('<h3>Certificados</h3>')
        ->not->toContain('2008');
});

it('reads the year carousel as a timeline', function () use ($html) {
    expect((new PageContentParser)->timeline($html))->toBe([
        ['year' => '2000', 'title' => 'Fundação da Franccino.', 'text' => "Primeira loja (SP)\nPrimeira fábrica"],
        ['year' => '2008', 'title' => 'Criação do Estúdio Franccino', 'text' => ''],
    ]);
});

it('returns nothing for a page without text', function () {
    expect((new PageContentParser)->richText('<div><img src="x.png"></div>'))->toBeNull()
        ->and((new PageContentParser)->timeline('<div></div>'))->toBe([]);
});
