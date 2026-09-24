<?php

namespace Database\Factories;

use App\Enums\ProjectType;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $words = fake()->unique()->words(2, true);

        return [
            'type' => ProjectType::Residential,
            'title' => ['pt' => Str::title($words), 'en' => Str::title($words)],
            'slug' => ['pt' => Str::slug($words), 'en' => Str::slug($words)],
            'client_name' => fake()->company(),
            'location' => fake()->city(),
            'year' => now()->year,
            'summary' => ['pt' => fake()->sentence(), 'en' => fake()->sentence()],
            'description' => ['pt' => '<p>'.fake()->paragraph().'</p>', 'en' => '<p>'.fake()->paragraph().'</p>'],
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
