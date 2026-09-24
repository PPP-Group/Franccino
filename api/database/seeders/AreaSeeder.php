<?php

namespace Database\Seeders;

use App\Models\Area;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    /**
     * Seed the two fixed catalog areas. Idempotent: safe to run more than once.
     */
    public function run(): void
    {
        Area::updateOrCreate(
            ['key' => 'indoor'],
            [
                'name' => ['pt' => 'Interno', 'en' => 'Indoor'],
                'brand_name' => 'Franccino Casa',
                'sort_order' => 0,
            ],
        );

        Area::updateOrCreate(
            ['key' => 'outdoor'],
            [
                'name' => ['pt' => 'Externo', 'en' => 'Outdoor'],
                'brand_name' => 'Franccino Giardini',
                'sort_order' => 1,
            ],
        );
    }
}
