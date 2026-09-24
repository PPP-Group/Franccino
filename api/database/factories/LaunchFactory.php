<?php

namespace Database\Factories;

use App\Models\Launch;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Launch>
 */
class LaunchFactory extends Factory
{
    protected $model = Launch::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $words = fake()->unique()->words(2, true);

        return [
            'title' => ['pt' => Str::title($words), 'en' => Str::title($words)],
            'slug' => ['pt' => Str::slug($words), 'en' => Str::slug($words)],
            'year' => now()->year,
            'summary' => ['pt' => fake()->sentence(), 'en' => fake()->sentence()],
            'description' => ['pt' => '<p>'.fake()->paragraph().'</p>', 'en' => '<p>'.fake()->paragraph().'</p>'],
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
