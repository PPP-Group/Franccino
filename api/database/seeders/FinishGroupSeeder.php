<?php

namespace Database\Seeders;

use App\Models\FinishGroup;
use Illuminate\Database\Seeder;

class FinishGroupSeeder extends Seeder
{
    /**
     * Seed the fixed finish groups (the WordPress site has no structured swatch,
     * see docs/data-model.md). Idempotent: safe to run more than once.
     */
    public function run(): void
    {
        $groups = [
            ['pt' => 'Madeiras', 'en' => 'Woods'],
            ['pt' => 'Tecidos', 'en' => 'Fabrics'],
            ['pt' => 'Couros', 'en' => 'Leathers'],
            ['pt' => 'Cordas e fibras', 'en' => 'Ropes and fibers'],
            ['pt' => 'Metais', 'en' => 'Metals'],
            ['pt' => 'Pedras', 'en' => 'Stones'],
            ['pt' => 'Vidros', 'en' => 'Glass'],
        ];

        foreach ($groups as $index => $name) {
            FinishGroup::updateOrCreate(
                ['name->pt' => $name['pt']],
                ['name' => $name, 'sort_order' => $index],
            );
        }
    }
}
