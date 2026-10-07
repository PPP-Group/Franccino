<?php

use App\Support\LocalizedBlocks;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class);

it('resolves texts, sanitizes html and builds image urls', function () {
    Storage::fake('media');

    $blocks = [
        ['type' => 'rich_text', 'data' => ['body' => ['pt' => '<p>Oi<script>x</script></p>', 'en' => '<p>Hi</p>']]],
        ['type' => 'image', 'data' => ['image' => 'pages/fabrica.jpg', 'caption' => ['pt' => 'Fábrica', 'en' => null]]],
        ['type' => 'timeline', 'data' => ['items' => [['year' => '2000', 'title' => ['pt' => 'Fundação', 'en' => 'Foundation'], 'text' => ['pt' => 'x', 'en' => 'y']]]]],
    ];

    $en = LocalizedBlocks::resolve($blocks, 'en');

    expect($en[0]['data']['body'])->toBe('<p>Hi</p>')
        ->and($en[1]['data']['caption'])->toBe('Fábrica')
        ->and($en[1]['data']['image'])->toBe(Storage::disk('media')->url('pages/fabrica.jpg'))
        ->and($en[2]['data']['items'][0]['title'])->toBe('Foundation')
        ->and(LocalizedBlocks::resolve($blocks, 'pt')[0]['data']['body'])->not->toContain('script');
});

it('resolves the remaining block types', function () {
    Storage::fake('media');

    $blocks = [
        ['type' => 'image_text', 'data' => [
            'image' => 'pages/oficina.jpg',
            'heading' => ['pt' => 'Título', 'en' => 'Heading'],
            'body' => ['pt' => '<p>Corpo<script>x</script></p>', 'en' => null],
            'image_position' => 'right',
        ]],
        ['type' => 'faq', 'data' => ['items' => [['question' => ['pt' => 'P?', 'en' => 'Q?'], 'answer' => ['pt' => 'R.', 'en' => 'A.']]]]],
        ['type' => 'stats', 'data' => ['items' => [['value' => '30', 'label' => ['pt' => 'Anos', 'en' => 'Years']]]]],
        ['type' => 'quote', 'data' => ['text' => ['pt' => 'Frase', 'en' => 'Quote'], 'author' => 'Fulano']],
        ['type' => 'cta', 'data' => [
            'heading' => ['pt' => 'Vamos', 'en' => 'Let\'s go'],
            'body' => ['pt' => 'Texto', 'en' => 'Text'],
            'label' => ['pt' => 'Clique', 'en' => 'Click'],
            'url' => ['pt' => '/pt/contato', 'en' => '/en/contact'],
        ]],
        ['type' => 'gallery', 'data' => ['images' => ['pages/a.jpg', 'pages/b.jpg'], 'caption' => ['pt' => 'Legenda', 'en' => null]]],
    ];

    $en = LocalizedBlocks::resolve($blocks, 'en');

    expect($en[0]['data'])->toBe([
        'image' => Storage::disk('media')->url('pages/oficina.jpg'),
        'heading' => 'Heading',
        // English body is missing, falls back to portuguese (sanitized).
        'body' => '<p>Corpo</p>',
        'image_position' => 'right',
    ])
        ->and($en[1]['data']['items'][0])->toBe(['question' => 'Q?', 'answer' => 'A.'])
        ->and($en[2]['data']['items'][0])->toBe(['value' => '30', 'label' => 'Years'])
        ->and($en[3]['data'])->toBe(['text' => 'Quote', 'author' => 'Fulano'])
        ->and($en[4]['data'])->toBe(['heading' => 'Let\'s go', 'body' => 'Text', 'label' => 'Click', 'url' => '/en/contact'])
        ->and($en[5]['data'])->toBe([
            'images' => [Storage::disk('media')->url('pages/a.jpg'), Storage::disk('media')->url('pages/b.jpg')],
            'caption' => 'Legenda',
        ]);
});

it('resolves a video block with its embed url and cover', function () {
    Storage::fake('media');

    $blocks = [
        ['type' => 'video', 'data' => [
            'url' => 'https://youtu.be/OG_GNCn0HoQ',
            'poster' => 'pages/video.png',
            'title' => ['pt' => 'Conheça a Franccino', 'en' => 'Meet Franccino'],
        ]],
        ['type' => 'video', 'data' => ['url' => 'https://example.com/video.mp4', 'poster' => null, 'title' => null]],
    ];

    $en = LocalizedBlocks::resolve($blocks, 'en');

    expect($en[0]['data'])->toBe([
        'url' => 'https://youtu.be/OG_GNCn0HoQ',
        'embed_url' => 'https://www.youtube-nocookie.com/embed/OG_GNCn0HoQ',
        'poster' => Storage::disk('media')->url('pages/video.png'),
        'title' => 'Meet Franccino',
    ])
        ->and($en[1]['data']['embed_url'])->toBeNull()
        ->and($en[1]['data']['poster'])->toBeNull();
});
