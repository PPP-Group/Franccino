<?php

use App\Models\Page;

it('points the cookie policy text to the preferences at the end of the page', function () {
    $page = Page::query()->where('key', 'cookies')->first() ?? Page::factory()->create(['key' => 'cookies']);
    $page->update(['content' => [[
        'type' => 'rich_text',
        'data' => ['body' => [
            'pt' => '<p>Você pode mudar a escolha a qualquer momento em "Preferências de cookies", no rodapé de todas as páginas. Fim.</p>',
            'en' => '<p>You can change your choice at any time under "Cookie preferences", in the footer of every page.</p>',
        ]],
    ]]]);

    (require database_path('migrations/2026_11_13_100000_point_cookie_preferences_to_the_page.php'))->up();

    $body = $page->refresh()->content[0]['data']['body'];
    expect($body['pt'])->toContain('no fim desta página')->not->toContain('rodapé')->toContain('Fim.')
        ->and($body['en'])->toContain('at the end of this page');
});
