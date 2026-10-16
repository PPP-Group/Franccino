<?php

use App\Actions\ContentTranslations;
use App\Models\Page;
use App\Models\Product;

function untranslatedProduct(array $attributes = []): Product
{
    $attributes = array_merge([
        'name' => ['pt' => 'Mesa lateral Rito'],
        'slug' => ['pt' => 'mesa-lateral-rito'],
        'description' => ['pt' => '<p>Mesa em madeira maciça.</p>'],
        'materials' => ['pt' => 'Madeira maciça Tauari.'],
        'dimensions' => [['label' => ['pt' => 'Pequena'], 'width' => 400, 'depth' => 400, 'height' => 550]],
    ], $attributes);

    // publishedProduct() creates its category and designer, which have unique slugs: the next products reuse them.
    $first = Product::query()->first();

    return $first === null
        ? publishedProduct($attributes)
        : Product::factory()->for($first->area)->for($first->category)->for($first->designer)
            ->create(['is_published' => true, ...$attributes]);
}

it('exports the texts still missing a translation, including page blocks and dimension labels', function () {
    untranslatedProduct();
    Page::factory()->create([
        'key' => 'factory',
        'title' => ['pt' => 'Fábrica', 'en' => 'Factory'],
        'content' => [['type' => 'rich_text', 'data' => ['body' => ['pt' => '<p>Quem somos</p>']]]],
    ]);

    $texts = collect(app(ContentTranslations::class)->export('en'))
        ->map(fn (array $item): string => "{$item['model']}.{$item['field']}: {$item['pt']}");

    expect($texts)->toContain('product.name: Mesa lateral Rito')
        ->toContain('product.materials: Madeira maciça Tauari.')
        ->toContain('product.dimensions: Pequena')
        ->toContain('page.content: <p>Quem somos</p>')
        ->not->toContain('page.title: Fábrica');
});

it('fills only the empty translations and makes the english slug from the new name', function () {
    $product = untranslatedProduct();
    $kept = untranslatedProduct([
        'name' => ['pt' => 'Cadeira Toé', 'en' => 'Toé Chair (panel)'],
        'slug' => ['pt' => 'cadeira-toe', 'en' => 'toe-chair-panel'],
    ]);

    $counts = app(ContentTranslations::class)->import([
        ['model' => 'product', 'field' => 'name', 'pt' => 'Mesa lateral Rito', 'en' => 'Rito Side Table'],
        ['model' => 'product', 'field' => 'name', 'pt' => 'Cadeira Toé', 'en' => 'Toé Chair'],
        ['model' => 'product', 'field' => 'description', 'pt' => '<p>Mesa em madeira maciça.</p>', 'en' => '<p>Solid wood table.</p>'],
        ['model' => 'product', 'field' => 'dimensions', 'pt' => 'Pequena', 'en' => 'Small'],
        ['model' => 'product', 'field' => 'name', 'pt' => 'Peça que não existe', 'en' => 'Missing piece'],
    ], 'en');

    $product->refresh();
    $kept->refresh();

    expect($product->getTranslation('name', 'en', false))->toBe('Rito Side Table')
        ->and($product->getTranslation('slug', 'en', false))->toBe('rito-side-table')
        ->and($product->getTranslation('description', 'en', false))->toBe('<p>Solid wood table.</p>')
        ->and($product->dimensions[0]['label'])->toBe(['pt' => 'Pequena', 'en' => 'Small'])
        ->and($product->search_text)->toContain('rito side table')
        ->and($kept->getTranslation('name', 'en', false))->toBe('Toé Chair (panel)')
        ->and($kept->getTranslation('slug', 'en', false))->toBe('toe-chair-panel')
        ->and($counts['kept'])->toBe(1)
        ->and($counts['unmatched'])->toBe(1);
});

it('keeps english slugs unique', function () {
    untranslatedProduct(['name' => ['pt' => 'Mesa lateral Rito'], 'slug' => ['pt' => 'mesa-lateral-rito-a']]);
    untranslatedProduct(['name' => ['pt' => 'Mesa lateral Rito'], 'slug' => ['pt' => 'mesa-lateral-rito-b']]);

    app(ContentTranslations::class)->import([
        ['model' => 'product', 'field' => 'name', 'pt' => 'Mesa lateral Rito', 'en' => 'Rito Side Table'],
    ], 'en');

    expect(Product::query()->get()->map(fn (Product $p) => $p->getTranslation('slug', 'en', false))->sort()->values()->all())
        ->toBe(['rito-side-table', 'rito-side-table-2']);
});

it('overwrites existing translations only with force, and writes nothing on a dry run', function () {
    $product = untranslatedProduct(['name' => ['pt' => 'Cadeira Toé', 'en' => 'Old name']]);
    $items = [['model' => 'product', 'field' => 'name', 'pt' => 'Cadeira Toé', 'en' => 'Toé Chair']];

    app(ContentTranslations::class)->import($items, 'en', force: true, dryRun: true);
    expect($product->refresh()->getTranslation('name', 'en', false))->toBe('Old name');

    app(ContentTranslations::class)->import($items, 'en', force: true);
    expect($product->refresh()->getTranslation('name', 'en', false))->toBe('Toé Chair');
});

it('fills page blocks by matching the portuguese text anywhere in the tree', function () {
    $page = Page::factory()->create([
        'key' => 'factory',
        'content' => [
            ['type' => 'timeline', 'data' => ['items' => [
                ['year' => '2000', 'title' => ['pt' => 'Fundação da Franccino.'], 'text' => ['pt' => 'Primeira loja']],
            ]]],
        ],
    ]);

    app(ContentTranslations::class)->import([
        ['model' => 'page', 'field' => 'content', 'pt' => 'Fundação da Franccino.', 'en' => 'Franccino is founded.'],
        ['model' => 'page', 'field' => 'content', 'pt' => 'Primeira loja', 'en' => 'First store'],
    ], 'en');

    $item = $page->refresh()->content[0]['data']['items'][0];

    expect($item['title'])->toBe(['pt' => 'Fundação da Franccino.', 'en' => 'Franccino is founded.'])
        ->and($item['text']['en'])->toBe('First store')
        ->and($item['year'])->toBe('2000');
});

it('runs export and import from the command line', function () {
    untranslatedProduct();
    $file = tempnam(sys_get_temp_dir(), 'trad');

    $this->artisan('franccino:translations:export', ['file' => $file])->assertSuccessful();
    $data = json_decode(file_get_contents($file), true);
    expect($data['locale'])->toBe('en')->and($data['items'][0])->toHaveKey('en');

    $data['items'] = [['model' => 'product', 'field' => 'name', 'pt' => 'Mesa lateral Rito', 'en' => 'Rito Side Table']];
    file_put_contents($file, json_encode($data));

    $this->artisan('franccino:translations:import', ['file' => $file])->assertSuccessful();
    expect(Product::query()->first()->getTranslation('name', 'en', false))->toBe('Rito Side Table');

    $this->artisan('franccino:translations:import', ['file' => '/nao/existe.json'])->assertFailed();
});
