<?php

use App\Models\Category;
use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Finish;
use App\Models\Launch;
use App\Models\Line;
use App\Models\Product;

it('paginates with a default per_page of 24 and rejects per_page over 48', function () {
    $indoor = area('indoor');
    Product::factory()->for($indoor)->count(3)->create();

    $this->getJson('/api/v1/products')
        ->assertOk()
        ->assertJsonPath('meta.per_page', 24)
        ->assertJsonPath('meta.total', 3)
        ->assertJsonStructure(['data', 'links' => ['first', 'last', 'prev', 'next'], 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);

    $this->getJson('/api/v1/products?per_page=49')
        ->assertStatus(422)
        ->assertJsonValidationErrors('per_page');
});

it('hides unpublished products from the index', function () {
    $indoor = area('indoor');
    Product::factory()->for($indoor)->create(['is_published' => true]);
    Product::factory()->for($indoor)->create(['is_published' => false]);

    $this->getJson('/api/v1/products')->assertJsonPath('meta.total', 1);
});

it('filters by area', function () {
    $indoor = area('indoor');
    $outdoor = area('outdoor');
    Product::factory()->for($indoor)->create();
    Product::factory()->for($outdoor)->create();

    $this->getJson('/api/v1/products?area=outdoor')->assertJsonPath('meta.total', 1);
    $this->getJson('/api/v1/products?area=bogus')->assertStatus(422);
});

it('filters by category using the localized slug', function () {
    $indoor = area('indoor');
    $chairs = Category::factory()->create(['slug' => ['pt' => 'cadeiras', 'en' => 'chairs']]);
    $tables = Category::factory()->create(['slug' => ['pt' => 'mesas', 'en' => 'tables']]);

    Product::factory()->for($indoor)->for($chairs)->create();
    Product::factory()->for($indoor)->for($tables)->create();

    $this->getJson('/api/v1/products?category=cadeiras')->assertJsonPath('meta.total', 1);
    $this->getJson('/api/v1/products?category=tables&locale=en')->assertJsonPath('meta.total', 1);
});

it('filters by designer, collection, line, finish and launch', function () {
    $indoor = area('indoor');
    $designer = Designer::factory()->create(['slug' => 'andrea-zanocchi']);
    $collection = CollectionModel::factory()->create(['slug' => ['pt' => 'edicao-2026', 'en' => 'edition-2026']]);
    $line = Line::factory()->create(['slug' => 'pinot']);
    $finish = Finish::factory()->create();
    $launch = Launch::factory()->create(['slug' => ['pt' => 'lancamentos-2026', 'en' => 'launches-2026']]);

    $product = Product::factory()->for($indoor)->for($designer)->create(['line_id' => $line->id]);
    $product->collections()->attach($collection);
    $product->finishes()->attach($finish);
    $product->launches()->attach($launch);

    Product::factory()->for($indoor)->create();

    $this->getJson('/api/v1/products?designer=andrea-zanocchi')->assertJsonPath('meta.total', 1);
    $this->getJson('/api/v1/products?collection=edicao-2026')->assertJsonPath('meta.total', 1);
    $this->getJson('/api/v1/products?line=pinot')->assertJsonPath('meta.total', 1);
    $this->getJson('/api/v1/products?finish='.$finish->id)->assertJsonPath('meta.total', 1);
    $this->getJson('/api/v1/products?launch=lancamentos-2026')->assertJsonPath('meta.total', 1);
});

it('searches ignoring accents and case', function () {
    $indoor = area('indoor');
    Product::factory()->for($indoor)->create(['name' => ['pt' => 'Sofá Antônio', 'en' => 'Antonio Sofa']]);
    Product::factory()->for($indoor)->create(['name' => ['pt' => 'Cadeira Aura', 'en' => 'Aura Chair']]);

    $this->getJson('/api/v1/products?q=sofa')->assertJsonPath('meta.total', 1);
    $this->getJson('/api/v1/products?q=SOFA')->assertJsonPath('meta.total', 1);
});

it('treats % and _ in the search term as literal characters, not SQL wildcards', function () {
    $indoor = area('indoor');
    Product::factory()->for($indoor)->create(['name' => ['pt' => 'Sofa 50% Off', 'en' => 'Sofa 50% Off']]);
    Product::factory()->for($indoor)->create(['name' => ['pt' => 'Sofa 50X Off', 'en' => 'Sofa 50X Off']]);

    // Unescaped, `%` in the term would act as "any characters" and match both
    // products above (since "50" + anything + " off" matches either name).
    $this->getJson('/api/v1/products?'.http_build_query(['q' => '50% off']))->assertJsonPath('meta.total', 1);

    Product::factory()->for($indoor)->create(['name' => ['pt' => 'Mesa Art_Deco', 'en' => 'Table Art_Deco']]);
    Product::factory()->for($indoor)->create(['name' => ['pt' => 'Mesa ArtXDeco', 'en' => 'Table ArtXDeco']]);

    // Unescaped, `_` in the term would match any single character, so
    // "art_deco" would also match "artxdeco".
    $this->getJson('/api/v1/products?'.http_build_query(['q' => 'art_deco']))->assertJsonPath('meta.total', 1);
});

it('sorts by name in the requested locale', function () {
    $indoor = area('indoor');
    Product::factory()->for($indoor)->create(['name' => ['pt' => 'Zebra', 'en' => 'Alpha']]);
    Product::factory()->for($indoor)->create(['name' => ['pt' => 'Alfa', 'en' => 'Zulu']]);

    $namesPt = $this->getJson('/api/v1/products?sort=name')->json('data.*.name');
    expect($namesPt)->toBe(['Alfa', 'Zebra']);

    $namesEn = $this->getJson('/api/v1/products?sort=name&locale=en')->json('data.*.name');
    expect($namesEn)->toBe(['Alpha', 'Zulu']);
});

it('flags is_new for products in a current published launch', function () {
    $indoor = area('indoor');
    $launch = Launch::factory()->create(['year' => now()->year, 'is_published' => true]);
    $new = Product::factory()->for($indoor)->create();
    $new->launches()->attach($launch);
    $old = Product::factory()->for($indoor)->create();

    $response = $this->getJson('/api/v1/products')->assertOk();
    $byId = collect($response->json('data'))->keyBy('id');

    expect($byId[$new->id]['is_new'])->toBeTrue();
    expect($byId[$old->id]['is_new'])->toBeFalse();
});
