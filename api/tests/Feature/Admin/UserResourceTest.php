<?php

use App\Filament\Resources\Users\Pages\CreateUser;
use App\Filament\Resources\Users\Pages\ListUsers;
use App\Models\User;

use function Pest\Livewire\livewire;

it('shows the users list to admins', function () {
    $admin = User::factory()->admin()->create();
    $others = User::factory()->count(2)->create();

    $this->actingAs($admin);

    livewire(ListUsers::class)->assertCanSeeTableRecords($others);
});

it('forbids editors from managing users', function () {
    $this->actingAs(User::factory()->editor()->create())
        ->get('/admin/users')
        ->assertForbidden();
});

it('creates an editor', function () {
    $this->actingAs(User::factory()->admin()->create());

    livewire(CreateUser::class)
        ->fillForm([
            'name' => 'Maria',
            'email' => 'maria@franccino.com.br',
            'role' => 'editor',
            'is_active' => true,
            'password' => 'Senha-forte-2026',
            'password_confirmation' => 'Senha-forte-2026',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(User::where('email', 'maria@franccino.com.br')->sole()->role->value)->toBe('editor');
});
