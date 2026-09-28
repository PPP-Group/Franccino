<?php

namespace Database\Factories;

use App\Models\Designer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Designer>
 */
class DesignerFactory extends Factory
{
    protected $model = Designer::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->name();

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('###'),
            'short_bio' => ['pt' => fake()->sentence(), 'en' => fake()->sentence()],
            'bio' => ['pt' => '<p>'.fake()->paragraph().'</p>', 'en' => '<p>'.fake()->paragraph().'</p>'],
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
