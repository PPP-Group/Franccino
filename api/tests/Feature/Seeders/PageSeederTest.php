<?php

use App\Models\Page;
use Database\Seeders\PageSeeder;

it('is idempotent and never overwrites edited content', function () {
    (new PageSeeder)->run();

    expect(Page::count())->toBe(17);

    $home = Page::where('key', 'home')->firstOrFail();
    $home->setTranslation('title', 'pt', 'Início editado');
    $home->save();

    (new PageSeeder)->run();

    expect(Page::count())->toBe(17)
        ->and(Page::where('key', 'home')->firstOrFail()->getTranslation('title', 'pt'))->toBe('Início editado');
});
