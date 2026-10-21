<?php

namespace App\Providers\Filament;

use App\Filament\Pages\Dashboard;
use App\Filament\Pages\HelpCenter;
use App\Filament\Support\InitialsAvatarProvider;
use App\Filament\Support\PanelGuides;
use App\Http\Middleware\RequireAdminMultiFactor;
use Filament\Auth\MultiFactor\App\AppAuthentication;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\View\PanelsRenderHook;
use Illuminate\Contracts\View\View;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->brandName('Franccino')
            ->brandLogo(fn (): View => view('filament.hooks.brand'))
            ->darkMode(false)
            ->sidebarCollapsibleOnDesktop()
            ->login()
            ->passwordReset()
            ->profile(isSimple: false)
            // 2FA required for administrators only (RequireAdminMultiFactor); everyone else may turn it on.
            ->multiFactorAuthentication([
                AppAuthentication::make()->recoverable(),
            ], isRequired: (bool) config('franccino.panel.admin_mfa_required'))
            ->multiFactorAuthenticationRequiredMiddlewareName(RequireAdminMultiFactor::class)
            ->colors([
                // Madeira do site (web/src/styles/tokens.css, --wood) no tom 600, que é o dos botões; cinzas quentes
                // como o fundo do site. A paleta é fixa porque a gerada a partir do hex sai alaranjada.
                'primary' => array_map(Color::convertToOklch(...), [
                    50 => '#faf6f2',
                    100 => '#f3eae1',
                    200 => '#e5d2bf',
                    300 => '#d0b293',
                    400 => '#b38a66',
                    500 => '#966b47',
                    600 => '#7b4b2a',
                    700 => '#653d22',
                    800 => '#4f301b',
                    900 => '#3d2515',
                    950 => '#22140b',
                ]),
                'gray' => Color::Stone,
            ])
            ->defaultAvatarProvider(InitialsAvatarProvider::class)
            ->databaseNotifications()
            ->navigationGroups([
                NavigationGroup::make(fn () => __('Catalog')),
                NavigationGroup::make(fn () => __('Content')),
                NavigationGroup::make(fn () => __('Relationship')),
                NavigationGroup::make(fn () => __('System')),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->renderHook(PanelsRenderHook::HEAD_END, fn (): View => view('filament.hooks.styles'))
            ->renderHook(PanelsRenderHook::AUTH_LOGIN_FORM_BEFORE, fn (): View => view('filament.hooks.login-note'))
            ->renderHook(PanelsRenderHook::USER_MENU_BEFORE, fn (): View => view('filament.hooks.topbar-help'))
            ->renderHook(PanelsRenderHook::BODY_END, fn (): string => filament()->auth()->check()
                ? view('filament.hooks.onboarding-tour')->render()
                : '')
            ->renderHook(PanelsRenderHook::PAGE_HEADER_ACTIONS_BEFORE, function (): string {
                $guide = PanelGuides::forRoute(request()->route()?->getName());

                return $guide === null ? '' : view('filament.hooks.contextual-help', [
                    'url' => HelpCenter::getUrl().'#'.$guide,
                ])->render();
            })
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
