<?php

use App\Models\Area;
use App\Models\Category;
use App\Models\Designer;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/**
 * Returns the area for the given key, creating it first if needed. Areas are unique
 * by `key` (see Ruling R1), so tests share this helper instead of creating a new one.
 */
function area(string $key): Area
{
    return Area::firstOrCreate(['key' => $key], Area::factory()->{$key}()->raw());
}

/**
 * Creates a published product with a full set of related catalog records
 * (area, category, designer), used by every `Api/V1` test that needs a
 * realistic product to query. Shared across test files per the project's
 * testing rule (helpers used by more than one file live here).
 */
function publishedProduct(array $attributes = []): Product
{
    return Product::factory()
        ->for(area('indoor'))
        ->for(Category::factory()->state([
            'name' => ['pt' => 'Cadeiras', 'en' => 'Chairs'],
            'singular_name' => ['pt' => 'Cadeira', 'en' => 'Chair'],
            'slug' => ['pt' => 'cadeiras', 'en' => 'chairs'],
        ]))
        ->for(Designer::factory()->state(['name' => 'Andrea Zanocchi', 'slug' => 'andrea-zanocchi']))
        ->create(array_merge([
            'name' => ['pt' => 'Cadeira Aura', 'en' => 'Aura Chair'],
            'slug' => ['pt' => 'cadeira-aura', 'en' => 'aura-chair'],
            'description' => ['pt' => '<p>Texto <script>x</script></p>', 'en' => '<p>Text</p>'],
        ], $attributes));
}

/**
 * A minimal, structurally valid binary GLB (glTF 2.0) header with no chunks —
 * enough for `finfo` to recognize it and for media conversions to skip it
 * safely. See Ruling R3: tests attaching a `model_3d` file must use this
 * instead of arbitrary text, since the media collection validates mime type.
 */
function minimalGlb(): string
{
    return pack('a4VV', 'glTF', 2, 12);
}
