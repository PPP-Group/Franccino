<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the initial administrator account from config('franccino.admin.*').
     */
    public function run(): void
    {
        $email = config('franccino.admin.email');
        $password = config('franccino.admin.password');

        if (blank($email) || blank($password)) {
            $this->command->warn(
                'ADMIN_EMAIL/ADMIN_PASSWORD nao configurados; usuario administrador nao foi criado.'
            );

            return;
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => config('franccino.admin.name'),
                'password' => $password,
                'role' => UserRole::Admin,
                'is_active' => true,
            ],
        );
    }
}
