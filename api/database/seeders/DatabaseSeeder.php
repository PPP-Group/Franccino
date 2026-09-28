<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(AreaSeeder::class);
        $this->call(FinishGroupSeeder::class);
        $this->call(PageSeeder::class);
        $this->call(AdminUserSeeder::class);
    }
}
