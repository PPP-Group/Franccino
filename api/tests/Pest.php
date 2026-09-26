<?php

use App\Models\Area;
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
