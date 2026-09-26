<?php

use App\Enums\RedirectStatus;
use App\Filament\Resources\Redirects\Pages\CreateRedirect;
use App\Filament\Resources\Redirects\Pages\ListRedirects;
use App\Models\Redirect;
use App\Models\User;

use function Pest\Livewire\livewire;

it('forbids editors from managing redirects', function () {
    $this->actingAs(User::factory()->editor()->create())
        ->get('/admin/redirects')
        ->assertForbidden();
});

it('lets an admin create a permanent redirect', function () {
    $this->actingAs(User::factory()->admin()->create());

    livewire(CreateRedirect::class)
        ->fillForm([
            'from_path' => '/produto/cadeira-aura/',
            'to_path' => '/pt/produtos/cadeira-aura',
            'status_code' => 301,
            'is_active' => true,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $redirect = Redirect::sole();

    expect($redirect->from_path)->toBe('/produto/cadeira-aura/')
        ->and($redirect->to_path)->toBe('/pt/produtos/cadeira-aura')
        ->and($redirect->status_code)->toBe(RedirectStatus::MovedPermanently);
});

it('requires the from path to start with a slash', function () {
    $this->actingAs(User::factory()->admin()->create());

    livewire(CreateRedirect::class)
        ->fillForm([
            'from_path' => 'produto/cadeira-aura',
            'to_path' => '/pt/produtos/cadeira-aura',
            'status_code' => 301,
        ])
        ->call('create')
        ->assertHasFormErrors(['from_path']);
});

it('requires to_path unless the status is 410 gone', function () {
    $this->actingAs(User::factory()->admin()->create());

    livewire(CreateRedirect::class)
        ->fillForm([
            'from_path' => '/produto/descontinuado',
            'to_path' => null,
            'status_code' => 301,
        ])
        ->call('create')
        ->assertHasFormErrors(['to_path']);

    livewire(CreateRedirect::class)
        ->fillForm([
            'from_path' => '/produto/descontinuado',
            'to_path' => null,
            'status_code' => 410,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Redirect::where('from_path', '/produto/descontinuado')->sole()->to_path)->toBeNull();
});

it('rejects a redirect that points to itself, unless it is a 410 gone', function () {
    $this->actingAs(User::factory()->admin()->create());

    livewire(CreateRedirect::class)
        ->fillForm([
            'from_path' => '/produto/cadeira-aura',
            'to_path' => '/produto/cadeira-aura',
            'status_code' => 301,
        ])
        ->call('create')
        ->assertHasFormErrors(['to_path']);

    livewire(CreateRedirect::class)
        ->fillForm([
            'from_path' => '/produto/descontinuado',
            'to_path' => '/produto/descontinuado',
            'status_code' => 410,
        ])
        ->call('create')
        ->assertHasNoFormErrors();
});

it('lists redirects to admins', function () {
    $this->actingAs(User::factory()->admin()->create());
    $redirects = Redirect::factory()->count(2)->create();

    livewire(ListRedirects::class)->assertCanSeeTableRecords($redirects);
});
