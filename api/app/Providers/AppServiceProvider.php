<?php

namespace App\Providers;

use App\Listeners\StoreBlurPlaceholder;
use App\Listeners\StoreImageMetadata;
use App\Models\User;
use App\Policies\AdminOnlyPolicy;
use App\Support\ContentLocale;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Spatie\MediaLibrary\Conversions\Events\ConversionHasBeenCompletedEvent;
use Spatie\MediaLibrary\MediaCollections\Events\MediaHasBeenAddedEvent;

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

        Event::listen(MediaHasBeenAddedEvent::class, StoreImageMetadata::class);
        Event::listen(ConversionHasBeenCompletedEvent::class, StoreBlurPlaceholder::class);
    }
}
