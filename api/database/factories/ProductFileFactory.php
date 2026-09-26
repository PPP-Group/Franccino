<?php

namespace Database\Factories;

use App\Enums\ProductFileType;
use App\Models\Product;
use App\Models\ProductFile;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductFile>
 */
class ProductFileFactory extends Factory
{
    protected $model = ProductFile::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'type' => ProductFileType::TechnicalSheet,
            'title' => ['pt' => 'Ficha técnica', 'en' => 'Technical sheet'],
            'format' => 'PDF',
            'disk' => 'downloads',
            'path' => 'product-files/'.Str::random(40).'.pdf',
            'original_name' => 'ficha-tecnica.pdf',
            'mime_type' => 'application/pdf',
            'size' => fake()->numberBetween(10_000, 2_000_000),
            'is_published' => true,
            'sort_order' => 0,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => ['is_published' => true]);
    }

    public function unpublished(): static
    {
        return $this->state(fn (array $attributes) => ['is_published' => false]);
    }
}
