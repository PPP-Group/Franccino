<?php

use App\Support\RichText;
use Tests\TestCase;

uses(TestCase::class);

it('keeps allowed markup', function () {
    $html = '<h2>Título</h2><p>Texto <strong>forte</strong> e <a href="https://franccino.com.br">link</a></p>';

    expect(RichText::sanitize($html))->toContain('<h2>Título</h2>')
        ->toContain('<strong>forte</strong>')
        ->toContain('href="https://franccino.com.br"');
});

it('removes scripts, event handlers and javascript links', function () {
    $html = '<p onclick="x()">a</p><script>alert(1)</script><a href="javascript:alert(1)">b</a><img src="x">';
    $clean = RichText::sanitize($html);

    expect($clean)->not->toContain('script')
        ->not->toContain('onclick')
        ->not->toContain('javascript:')
        ->not->toContain('<img');
});

it('returns null for blank input', function () {
    expect(RichText::sanitize(null))->toBeNull()
        ->and(RichText::sanitize('   '))->toBeNull();
});
