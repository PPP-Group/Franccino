<?php

namespace Database\Factories;

use App\Models\DownloadLog;
use App\Models\Product;
use App\Models\ProductFile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DownloadLog>
 */
class DownloadLogFactory extends Factory
{
    protected $model = DownloadLog::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_file_id' => ProductFile::factory(),
            'product_id' => function (array $attributes) {
                return ProductFile::find($attributes['product_file_id'])->product_id
                    ?? Product::factory()->create()->id;
            },
            'locale' => 'pt',
            'ip_hash' => hash('sha256', fake()->ipv4()),
            'user_agent' => fake()->userAgent(),
            'referer' => fake()->url(),
        ];
    }
}
