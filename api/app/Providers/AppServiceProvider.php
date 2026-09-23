<?php

namespace App\Providers;

use App\Models\User;
use App\Policies\AdminOnlyPolicy;
use App\Support\ContentLocale;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->scoped(ContentLocale::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(User::class, AdminOnlyPolicy::class);
    }
}
