<?php

namespace Database\Factories;

use App\Enums\RedirectStatus;
use App\Models\Redirect;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Redirect>
 */
class RedirectFactory extends Factory
{
    protected $model = Redirect::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'from_path' => '/'.fake()->unique()->slug(3),
            'to_path' => '/'.fake()->slug(3),
            'status_code' => RedirectStatus::MovedPermanently,
            'is_active' => true,
        ];
    }

    public function gone(): static
    {
        return $this->state(fn (array $attributes) => [
            'to_path' => null,
            'status_code' => RedirectStatus::Gone,
        ]);
    }
}
