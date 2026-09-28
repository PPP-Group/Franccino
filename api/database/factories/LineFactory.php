<?php

namespace Database\Factories;

use App\Models\Line;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Line>
 */
class LineFactory extends Factory
{
    protected $model = Line::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'designer_id' => null,
            'sort_order' => 0,
        ];
    }
}
