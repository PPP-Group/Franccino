<?php

namespace Database\Factories;

use App\Models\FinishGroup;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<FinishGroup>
 */
class FinishGroupFactory extends Factory
{
    protected $model = FinishGroup::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'name' => ['pt' => Str::title($name), 'en' => Str::title($name)],
            'sort_order' => 0,
        ];
    }
}
