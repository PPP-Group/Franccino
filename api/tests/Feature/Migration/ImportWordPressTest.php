<?php

use App\Models\Category;
use App\Models\Designer;
use App\Models\Line;
use App\Models\Page;
use App\Models\Product;
use Database\Seeders\AreaSeeder;
use Database\Seeders\PageSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    config([
        'franccino.wordpress.base_url' => 'https://wp.test',
        'franccino.wordpress.cache' => storage_path('framework/testing/wordpress-cache'),
    ]);
    $this->seed(AreaSeeder::class);
    Storage::fake('media');
    // Conversions stay queued: this test checks the import, not the image pipeline.
    Queue::fake();
});

afterEach(function () {
    File::deleteDirectory(storage_path('framework/testing/wordpress-cache'));
});

function fakeWordPress(): void
{
    $page = fn (array $items) => Http::response($items, 200, ['X-WP-TotalPages' => '1']);
    $jpeg = UploadedFile::fake()->image('x.jpg', 400, 300)->getContent();
    $html = <<<'HTML'
        <div class="jet-engine-gallery-slider__item"><a href="https://wp.test/wp-content/uploads/aura-1.jpg" class="x"></a></div>
        <div class="jet-engine-gallery-slider__item"><a href="https://wp.test/wp-content/uploads/aura-2.jpg" class="x"></a></div>
        <div class="jet-listing-dynamic-field__content">Medida padrão:</div>
        <div class="jet-listing-dynamic-field__content">60L x 60P x 75A (cm)</div>
        <div class="jet-listing-dynamic-field__content">Materiais:</div>
        <div class="jet-listing-dynamic-field__content">Estrutura em madeira freijó.</div>
        <a href="https://franccino.com.br/designer/estudio-franccino/">Estúdio Franccino</a>
        HTML;

    Http::fake([
        'wp.test/wp-json/wp/v2/areas*' => $page([['id' => 82, 'slug' => 'area-interna'], ['id' => 83, 'slug' => 'area-externa']]),
        'wp.test/wp-json/wp/v2/categorias-produtos*' => $page([['id' => 290, 'name' => 'Cadeiras Giardini', 'slug' => 'cadeira-giardini', 'link' => 'https://wp.test/c/cadeira-giardini/']]),
        'wp.test/wp-json/wp/v2/designers*' => $page([['id' => 7, 'slug' => 'estudio-franccino', 'title' => ['rendered' => 'Estúdio Franccino'], 'link' => 'https://wp.test/designer/estudio-franccino/']]),
        'wp.test/wp-json/wp/v2/linhas*' => $page([['id' => 440, 'name' => 'Aura', 'slug' => 'aura', 'count' => 1, 'link' => 'https://wp.test/l/aura/']]),
        'wp.test/wp-json/wp/v2/produtos*' => $page([[
            'id' => 11122,
            'slug' => 'cadeira-aura',
            'link' => 'https://wp.test/produto/cadeira-aura/',
            'title' => ['rendered' => 'Cadeira Aura'],
            'areas' => [83],
            'categorias-produtos' => [290],
            'linhas' => [440],
            'class_list' => ['categorias-produtos-cadeira-giardini'],
            'yoast_head_json' => ['title' => 'Cadeira Aura - Franccino', 'description' => 'Cadeira com estrutura em madeira.'],
        ]]),
        'wp.test/wp-json/wp/v2/pages*' => $page([
            ['id' => 579, 'slug' => 'institucional', 'title' => ['rendered' => 'Institucional'], 'content' => ['rendered' => <<<'HTML'
                <h2>quem somos</h2><p>Há mais de 20 anos no mercado.</p><h2>NOSSA HISTÓRIA</h2>
                <div class="swiper"><div class="swiper-slide"><h2>2000</h2><h2>Fundação da Franccino.</h2></div></div>
                HTML]],
            ['id' => 1465, 'slug' => 'politica-de-privacidade', 'title' => ['rendered' => 'Política de Privacidade'], 'content' => ['rendered' => '<h2>Dados coletados</h2><p>Nome e e-mail.</p>']],
            ['id' => 40, 'slug' => 'home', 'title' => ['rendered' => 'Home'], 'content' => ['rendered' => '<p>Home</p>']],
        ]),
        'wp.test/produto/cadeira-aura/' => Http::response($html),
        'wp.test/wp-content/uploads/*' => Http::response($jpeg, 200, ['Content-Type' => 'image/jpeg']),
    ]);
}

it('imports designers, lines, one category per type and products as drafts with their gallery', function () {
    fakeWordPress();

    $this->artisan('franccino:wordpress:import')->assertSuccessful();

    $product = Product::sole();
    expect($product->getTranslation('name', 'pt'))->toBe('Cadeira Aura')
        ->and($product->is_published)->toBeFalse()
        ->and($product->legacy_wp_id)->toBe(11122)
        ->and($product->area->key->value)->toBe('outdoor')
        ->and($product->category->getTranslation('name', 'pt'))->toBe('Cadeiras')
        ->and($product->line?->name)->toBe('Aura')
        ->and($product->designer?->slug)->toBe('estudio-franccino')
        ->and($product->dimensions)->toEqual([['width' => 600, 'depth' => 600, 'height' => 750, 'seat_height' => null, 'diameter' => null]])
        ->and($product->getTranslation('materials', 'pt'))->toBe('Estrutura em madeira freijó.')
        ->and($product->getTranslation('seo_title', 'pt'))->toBe('Cadeira Aura')
        ->and($product->getMedia('gallery'))->toHaveCount(2)
        ->and($product->getFirstMedia('cover'))->not->toBeNull()
        ->and(Designer::count())->toBe(1)
        ->and(Line::count())->toBe(1)
        ->and(Category::count())->toBe(1);

    $report = File::get(storage_path('app/migration/relatorio-'.now()->format('Y-m-d').'.md'));
    expect($report)->toContain('Cadeira Aura')->toContain('sem descrição');
});

it('runs again without duplicating records or photos and keeps panel edits', function () {
    fakeWordPress();
    $this->artisan('franccino:wordpress:import')->assertSuccessful();

    $product = Product::sole();
    $product->setTranslation('materials', 'pt', 'Editado no painel')->save();

    $this->artisan('franccino:wordpress:import')->assertSuccessful();

    expect(Product::count())->toBe(1)
        ->and(Product::sole()->getMedia('gallery'))->toHaveCount(2)
        ->and(Product::sole()->getTranslation('materials', 'pt'))->toBe('Editado no painel')
        ->and(Category::count())->toBe(1)
        ->and(Line::count())->toBe(1);
});

it('reuses an existing category whose name covers the WordPress one', function () {
    fakeWordPress();
    $chairs = Category::create([
        'name' => ['pt' => 'Cadeiras'],
        'singular_name' => ['pt' => 'Cadeira'],
        'slug' => ['pt' => 'cadeiras'],
        'is_published' => true,
    ]);

    $this->artisan('franccino:wordpress:import', ['--only' => ['products']])->assertSuccessful();

    expect(Product::sole()->category_id)->toBe($chairs->id)
        ->and(Category::count())->toBe(1);
});

it('writes nothing on a dry run and publishes only when asked', function () {
    fakeWordPress();

    $this->artisan('franccino:wordpress:import', ['--dry-run' => true])->assertSuccessful();
    expect(Product::count())->toBe(0)->and(Designer::count())->toBe(0);

    $this->artisan('franccino:wordpress:import', ['--publish' => true, '--without-media' => true])->assertSuccessful();
    expect(Product::sole()->is_published)->toBeTrue()
        ->and(Product::sole()->getMedia('gallery'))->toHaveCount(0);
});

it('copies the text of the institutional pages into empty pages and keeps panel edits', function () {
    fakeWordPress();
    $this->seed(PageSeeder::class);
    Page::query()->where('key', 'terms')->sole()->update(['content' => [['type' => 'rich_text', 'data' => ['body' => ['pt' => '<p>Do painel</p>']]]]]);

    $this->artisan('franccino:wordpress:import', ['--only' => ['pages']])->assertSuccessful();

    $content = fn (string $key) => Page::query()->where('key', $key)->sole()->content;
    // toEqual: MySQL stores JSON with its own key order.
    expect($content('factory'))->toEqual([
        ['type' => 'rich_text', 'data' => ['body' => ['pt' => "<h2>Quem somos</h2>\n<p>Há mais de 20 anos no mercado.</p>"]]],
        ['type' => 'timeline', 'data' => ['items' => [['year' => '2000', 'title' => ['pt' => 'Fundação da Franccino.'], 'text' => ['pt' => '']]]]],
    ])
        ->and($content('privacy'))->toEqual([['type' => 'rich_text', 'data' => ['body' => ['pt' => "<h2>Dados coletados</h2>\n<p>Nome e e-mail.</p>"]]]])
        ->and($content('terms'))->toEqual([['type' => 'rich_text', 'data' => ['body' => ['pt' => '<p>Do painel</p>']]]])
        ->and($content('home'))->toBe([]);
});

it('picks a cover that fits a card instead of a wide banner', function () {
    Http::fake([
        'wp.test/wp-content/uploads/aura-1.jpg' => Http::response(UploadedFile::fake()->image('wide.jpg', 1200, 300)->getContent(), 200, ['Content-Type' => 'image/jpeg']),
    ]);
    fakeWordPress();

    $this->artisan('franccino:wordpress:import', ['--only' => ['products']])->assertSuccessful();

    expect(Product::sole()->getFirstMedia('cover')?->getCustomProperty('legacy_url'))->toBe('https://wp.test/wp-content/uploads/aura-2.jpg');
});
