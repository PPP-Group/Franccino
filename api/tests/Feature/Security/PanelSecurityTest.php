<?php

use App\Enums\UserRole;
use App\Filament\Resources\Users\Pages\EditUser;
use App\Filament\Support\InitialsAvatarProvider;
use App\Http\Middleware\RequireAdminMultiFactor;
use App\Models\User;
use Filament\Actions\DeleteAction;
use Filament\Facades\Filament;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use function Pest\Livewire\livewire;

it('sends security headers and keeps the api and the panel out of search engines', function () {
    $this->get('/up')
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
        ->assertHeaderMissing('Strict-Transport-Security');

    $this->get('https://localhost/up')->assertHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');

    expect(file_get_contents(public_path('robots.txt')))->toContain('Disallow: /');
});

it('never lets the panel lose its last active administrator', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    expect($admin->can('delete', $admin))->toBeFalse();

    livewire(EditUser::class, ['record' => $admin->getRouteKey()])
        ->fillForm(['role' => UserRole::Editor->value])
        ->call('save')
        ->assertHasFormErrors(['role']);

    livewire(EditUser::class, ['record' => $admin->getRouteKey()])
        ->fillForm(['is_active' => false])
        ->call('save')
        ->assertHasFormErrors(['is_active']);

    $other = User::factory()->admin()->create();
    expect($admin->can('delete', $other))->toBeTrue();

    livewire(EditUser::class, ['record' => $other->getRouteKey()])
        ->fillForm(['role' => UserRole::Editor->value])
        ->call('save')
        ->assertHasNoFormErrors();
    expect($other->refresh()->role)->toBe(UserRole::Editor);

    livewire(EditUser::class, ['record' => $admin->getRouteKey()])->assertActionHidden(DeleteAction::class);
    livewire(EditUser::class, ['record' => $other->getRouteKey()])->assertActionVisible(DeleteAction::class);
});

it('asks for passwords with 12 characters, letters and numbers', function () {
    $this->actingAs(User::factory()->admin()->create());
    $user = User::factory()->create();

    foreach (['curta123', 'sónumerosemletra', '123456789012'] as $weak) {
        livewire(EditUser::class, ['record' => $user->getRouteKey()])
            ->fillForm(['password' => $weak, 'password_confirmation' => $weak])
            ->call('save')
            ->assertHasFormErrors(['password']);
    }

    livewire(EditUser::class, ['record' => $user->getRouteKey()])
        ->fillForm(['password' => 'Franccino2026ok', 'password_confirmation' => 'Franccino2026ok'])
        ->call('save')
        ->assertHasNoFormErrors();
});

it('requires two-factor authentication from administrators only', function () {
    Route::get('/test-mfa-set-up', fn () => 'set-up')->name(Filament::getPanel('admin')->getSetUpRequiredMultiFactorAuthenticationRouteName());
    app('router')->getRoutes()->refreshNameLookups();
    Filament::setCurrentPanel(Filament::getPanel('admin'));
    $next = fn () => response('ok');
    $middleware = new RequireAdminMultiFactor;

    $this->actingAs(User::factory()->create(['role' => UserRole::Editor]));
    expect($middleware->handle(Request::create('/admin'), $next)->getContent())->toBe('ok');

    $this->actingAs(User::factory()->admin()->create());
    expect($middleware->handle(Request::create('/admin'), $next)->isRedirect())->toBeTrue();
});

it('draws the user avatar in the panel instead of asking a third-party service', function () {
    $this->actingAs(User::factory()->admin()->create(['name' => 'Pedro Ivo']));

    $this->get('/admin')->assertOk()->assertDontSee('ui-avatars.com')->assertSee('data:image/svg+xml;base64', false);
    expect(base64_decode(str((new InitialsAvatarProvider)->get(User::factory()->make(['name' => 'Pedro Ivo'])))->after('base64,')))
        ->toContain('>PI<');
});
