<?php

use App\Filament\Resources\Products\Pages\CreateProduct;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Filament\Resources\Products\Pages\ListProducts;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;

use function Pest\Livewire\livewire;

beforeEach(fn () => $this->actingAs(User::factory()->editor()->create()));

it('lists products', function () {
    $products = Product::factory()->count(3)->create();

    livewire(ListProducts::class)->assertCanSeeTableRecords($products);
});

it('creates a product in both languages', function () {
    $area = area('indoor');
    $category = Category::factory()->create();

    livewire(CreateProduct::class)
        ->fillForm([
            'name' => ['pt' => 'Cadeira Aura', 'en' => 'Aura Chair'],
            'slug' => ['pt' => 'cadeira-aura', 'en' => 'aura-chair'],
            'description' => ['pt' => '<p>Texto</p>', 'en' => '<p>Text</p>'],
            'area_id' => $area->id,
            'category_id' => $category->id,
            'is_3d_enabled' => true,
            'is_published' => true,
            'dimensions' => [['label' => ['pt' => null, 'en' => null], 'width' => 600, 'depth' => 600, 'height' => 750]],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $product = Product::sole();

    expect($product->getTranslation('name', 'en'))->toBe('Aura Chair')
        ->and($product->getTranslation('slug', 'pt'))->toBe('cadeira-aura')
        ->and($product->dimensions[0]['height'])->toBe(750);
});

it('loads both languages when editing', function () {
    $product = Product::factory()->create(['name' => ['pt' => 'Mesa Joey', 'en' => 'Joey Table']]);

    livewire(EditProduct::class, ['record' => $product->getRouteKey()])
        ->assertFormSet(['name' => ['pt' => 'Mesa Joey', 'en' => 'Joey Table']]);
});

it('requires portuguese name and a unique slug per locale', function () {
    Product::factory()->create(['slug' => ['pt' => 'cadeira-aura', 'en' => 'aura-chair']]);

    livewire(CreateProduct::class)
        ->fillForm(['name' => ['pt' => null], 'slug' => ['pt' => 'cadeira-aura']])
        ->call('create')
        ->assertHasFormErrors(['name.pt' => 'required', 'slug.pt' => 'unique']);
});
