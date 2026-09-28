<?php

namespace Database\Factories;

use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    protected $model = Page::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => fake()->unique()->slug(2),
            'title' => ['pt' => fake()->sentence(3), 'en' => fake()->sentence(3)],
            'content' => [],
            'is_published' => true,
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
