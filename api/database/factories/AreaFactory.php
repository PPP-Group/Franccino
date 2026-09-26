<?php

namespace Database\Factories;

use App\Models\Area;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Area>
 */
class AreaFactory extends Factory
{
    protected $model = Area::class;

    /**
     * Default state matches the `indoor` area (see Ruling R1 in the task brief:
     * areas are unique by `key`, so this factory never uses a sequential key).
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => 'indoor',
            'name' => ['pt' => 'Interno', 'en' => 'Indoor'],
            'brand_name' => 'Franccino Casa',
            'description' => ['pt' => fake()->sentence(), 'en' => fake()->sentence()],
            'sort_order' => 0,
        ];
    }

    public function indoor(): static
    {
        return $this->state(fn (array $attributes) => [
            'key' => 'indoor',
            'name' => ['pt' => 'Interno', 'en' => 'Indoor'],
            'brand_name' => 'Franccino Casa',
        ]);
    }

    public function outdoor(): static
    {
        return $this->state(fn (array $attributes) => [
            'key' => 'outdoor',
            'name' => ['pt' => 'Externo', 'en' => 'Outdoor'],
            'brand_name' => 'Franccino Giardini',
        ]);
    }
}
