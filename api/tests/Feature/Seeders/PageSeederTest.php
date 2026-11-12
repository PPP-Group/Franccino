<?php

use App\Models\Page;
use Database\Seeders\PageSeeder;

it('is idempotent and never overwrites edited content', function () {
    (new PageSeeder)->run();

    expect(Page::count())->toBe(19);

    $home = Page::where('key', 'home')->firstOrFail();
    $home->setTranslation('title', 'pt', 'Início editado');
    $home->save();

    (new PageSeeder)->run();

    expect(Page::count())->toBe(19)
        ->and(Page::where('key', 'home')->firstOrFail()->getTranslation('title', 'pt'))->toBe('Início editado');
});

it('fills the empty cookies and faq pages with the starting text (retorno de 12/11/2026)', function () {
    $faq = Page::where('key', 'faq')->first();
    $cookies = Page::where('key', 'cookies')->first();

    expect($faq?->content[0]['type'] ?? null)->toBe('faq')
        ->and(count($faq->content[0]['data']['items']))->toBeGreaterThan(3)
        ->and($cookies?->content[0]['data']['body']['pt'] ?? '')->toContain('Necessários');
});
