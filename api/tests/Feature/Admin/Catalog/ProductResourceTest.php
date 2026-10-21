<?php

use App\Filament\Resources\Products\Pages\CreateProduct;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Filament\Resources\Products\Pages\ListProducts;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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

it('stores photos on the public media disk and the 3d model on the private downloads disk', function () {
    Storage::fake('media');
    Storage::fake('downloads');
    Storage::fake('local');
    $product = Product::factory()->create();

    livewire(EditProduct::class, ['record' => $product->getRouteKey()])
        ->fillForm([
            'cover' => UploadedFile::fake()->image('capa.jpg', 40, 30),
            'model_3d' => UploadedFile::fake()->createWithContent('cadeira.glb', minimalGlb()),
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    $product->refresh();
    $cover = $product->getFirstMedia('cover');
    $model = $product->getFirstMedia('model_3d');

    expect($cover?->disk)->toBe('media')
        ->and($model?->disk)->toBe('downloads');
    Storage::disk('downloads')->assertExists($model->getPathRelativeToRoot());
    Storage::disk('media')->assertMissing($model->getPathRelativeToRoot());
    Storage::disk('local')->assertDirectoryEmpty('/');
});

it('shows product and category names in portuguese, not in the fallback language', function () {
    $product = publishedProduct();

    livewire(ListProducts::class)
        ->assertCanSeeTableRecords([$product])
        ->assertSee('Cadeira Aura')
        ->assertSee('Cadeiras')
        ->assertDontSee('Aura Chair');
});

it('filters products by collection and by missing cover', function () {
    $inCollection = Product::factory()->create();
    $other = Product::factory()->create();
    $collection = Collection::factory()->create();
    $collection->products()->attach($inCollection);

    livewire(ListProducts::class)
        ->filterTable('collection', $collection->id)
        ->assertCanSeeTableRecords([$inCollection])
        ->assertCanNotSeeTableRecords([$other]);

    livewire(ListProducts::class)
        ->filterTable('cover', false)
        ->assertCanSeeTableRecords([$inCollection, $other]);
});
