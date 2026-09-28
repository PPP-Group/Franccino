<?php

namespace Database\Factories;

use App\Models\Finish;
use App\Models\FinishGroup;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Finish>
 */
class FinishFactory extends Factory
{
    protected $model = Finish::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'finish_group_id' => FinishGroup::factory(),
            'name' => ['pt' => Str::title($name), 'en' => Str::title($name)],
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
