<?php

use App\Support\Migration\LegacyPath;

it('keeps only path and query, without the trailing slash', function () {
    expect(LegacyPath::normalize('https://franccino.com.br/produto/cadeira-aura/'))->toBe('/produto/cadeira-aura')
        ->and(LegacyPath::normalize('/institucional/'))->toBe('/institucional')
        ->and(LegacyPath::normalize('/produto/*'))->toBe('/produto/*');
});

it('keeps the root and sorts the query keys', function () {
    expect(LegacyPath::normalize('https://franccino.com.br/'))->toBe('/')
        ->and(LegacyPath::normalize('https://franccino.com.br/?term=pinot&taxonomy=linhas'))->toBe('/?taxonomy=linhas&term=pinot');
});
