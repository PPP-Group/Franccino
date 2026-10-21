<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Filament\Auth\MultiFactor\Http\Middleware\EnsureMultiFactorAuthenticationIsEnabled;
use Filament\Facades\Filament;
use Illuminate\Http\Request;

/**
 * Two-factor authentication is required only for administrators (PPP-95): they manage users and settings. Editors
 * and customer service can turn it on in their profile. Filament's own requirement is all-or-nothing, so the panel
 * marks it as required and this middleware lets everyone else through.
 */
class RequireAdminMultiFactor extends EnsureMultiFactorAuthenticationIsEnabled
{
    public function handle(Request $request, Closure $next): mixed
    {
        $user = Filament::auth()->user();

        if (! $user instanceof User || ! $user->isAdmin()) {
            return $next($request);
        }

        return parent::handle($request, $next);
    }
}
