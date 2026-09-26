<?php

namespace Database\Factories;

use App\Models\Area;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $words = fake()->unique()->words(2, true);

        return [
            'name' => ['pt' => Str::title($words), 'en' => Str::title($words)],
            'slug' => ['pt' => Str::slug($words), 'en' => Str::slug($words)],
            'sku' => Str::upper(Str::random(2)).'-'.fake()->unique()->numerify('###'),
            'description' => [
                'pt' => '<p>'.fake()->sentence().'</p>',
                'en' => '<p>'.fake()->sentence().'</p>',
            ],
            // Ruling R1: reuse the existing `indoor` area instead of creating a new
            // one on every product, since areas are unique by `key`.
            'area_id' => fn () => Area::where('key', 'indoor')->value('id') ?? Area::factory()->indoor()->create()->id,
            'category_id' => Category::factory(),
            'dimensions' => [
                ['width' => 600, 'depth' => 600, 'height' => 750],
            ],
            'is_3d_enabled' => true,
            'is_featured' => false,
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
