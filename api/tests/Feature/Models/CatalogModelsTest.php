<?php

use App\Models\Area;
use App\Models\Category;
use App\Models\Designer;
use App\Models\Finish;
use App\Models\FinishGroup;
use App\Models\Line;
use App\Models\Product;
use App\Models\ProductFile;

it('wires product relations', function () {
    $designer = Designer::factory()->create(['name' => 'Andrea Zanocchi']);
    $line = Line::factory()->for($designer)->create();
    $product = Product::factory()
        ->for(Area::factory())
        ->for(Category::factory())
        ->for($line)
        ->for($designer)
        ->create();
    $finish = Finish::factory()->for(FinishGroup::factory(), 'group')->create();
    $product->finishes()->attach($finish, ['sort_order' => 1]);
    ProductFile::factory()->for($product)->create();

    $product->refresh();

    expect($product->area)->toBeInstanceOf(Area::class)
        ->and($product->category)->toBeInstanceOf(Category::class)
        ->and($product->line->is($line))->toBeTrue()
        ->and($product->designer->is($designer))->toBeTrue()
        ->and($product->finishes)->toHaveCount(1)
        ->and($product->files)->toHaveCount(1)
        ->and($designer->products)->toHaveCount(1);
});

it('keeps 3D enabled by default and stores translations', function () {
    $product = Product::factory()->create([
        'name' => ['pt' => 'Cadeira Aura', 'en' => 'Aura Chair'],
    ]);

    expect($product->is_3d_enabled)->toBeTrue()
        ->and($product->getTranslation('name', 'en'))->toBe('Aura Chair');
});

it('builds a normalized search text', function () {
    $designer = Designer::factory()->create(['name' => 'Sérgio J. Matos']);
    $product = Product::factory()->for($designer)->create([
        'name' => ['pt' => 'Sofá Antônio', 'en' => 'Antônio Sofa'],
        'sku' => 'SF-001',
    ]);

    expect($product->search_text)->toContain('sofa antonio')
        ->toContain('antonio sofa')
        ->toContain('sf-001')
        ->toContain('sergio j. matos');
});

it('filters published records in order', function () {
    Category::factory()->create(['sort_order' => 2, 'name' => ['pt' => 'B']]);
    Category::factory()->create(['sort_order' => 1, 'name' => ['pt' => 'A']]);
    Category::factory()->unpublished()->create(['sort_order' => 0]);

    expect(Category::published()->ordered()->get()->map->getTranslation('name', 'pt')->all())->toBe(['A', 'B']);
});

it('soft deletes products', function () {
    $product = Product::factory()->create();
    $product->delete();

    expect(Product::count())->toBe(0)->and(Product::withTrashed()->count())->toBe(1);
});
