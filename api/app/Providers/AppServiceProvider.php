<?php

namespace App\Providers;

use App\Jobs\RevalidateFrontend;
use App\Listeners\StoreBlurPlaceholder;
use App\Listeners\StoreImageMetadata;
use App\Models\Area;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Client;
use App\Models\Collection;
use App\Models\ContactMessage;
use App\Models\Designer;
use App\Models\DownloadLog;
use App\Models\Finish;
use App\Models\FinishGroup;
use App\Models\Launch;
use App\Models\Line;
use App\Models\NewsletterSubscriber;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductFile;
use App\Models\Project;
use App\Models\Redirect;
use App\Models\Store;
use App\Models\User;
use App\Observers\RevalidatesFrontend;
use App\Policies\AdminOnlyPolicy;
use App\Policies\ContentPolicy;
use App\Policies\FixedRecordPolicy;
use App\Policies\InboxPolicy;
use App\Support\ContentLocale;
use App\Support\FrontendRevalidator;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Spatie\LaravelSettings\Events\SettingsSaved;
use Spatie\MediaLibrary\Conversions\Events\ConversionHasBeenCompletedEvent;
use Spatie\MediaLibrary\MediaCollections\Events\MediaHasBeenAddedEvent;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->scoped(ContentLocale::class);
        $this->app->singleton(FrontendRevalidator::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(User::class, AdminOnlyPolicy::class);

        Gate::policy(Area::class, FixedRecordPolicy::class);

        Gate::policy(Category::class, ContentPolicy::class);
        Gate::policy(Line::class, ContentPolicy::class);
        Gate::policy(Designer::class, ContentPolicy::class);
        Gate::policy(FinishGroup::class, ContentPolicy::class);
        Gate::policy(Finish::class, ContentPolicy::class);
        Gate::policy(Product::class, ContentPolicy::class);
        Gate::policy(ProductFile::class, ContentPolicy::class);

        Gate::policy(DownloadLog::class, InboxPolicy::class);

        Gate::policy(Page::class, FixedRecordPolicy::class);

        Gate::policy(Collection::class, ContentPolicy::class);
        Gate::policy(Launch::class, ContentPolicy::class);
        Gate::policy(Project::class, ContentPolicy::class);
        Gate::policy(Client::class, ContentPolicy::class);
        Gate::policy(Store::class, ContentPolicy::class);
        Gate::policy(Banner::class, ContentPolicy::class);

        Gate::policy(Redirect::class, AdminOnlyPolicy::class);

        Gate::policy(ContactMessage::class, InboxPolicy::class);
        Gate::policy(NewsletterSubscriber::class, InboxPolicy::class);

        Event::listen(MediaHasBeenAddedEvent::class, StoreImageMetadata::class);
        Event::listen(ConversionHasBeenCompletedEvent::class, StoreBlurPlaceholder::class);

        $this->configureRateLimiters();
        $this->configureFrontendRevalidation();
    }

    /**
     * Content changes queue cache tags; one `RevalidateFrontend` per request,
     * command or queued job (`docs/api.md`, "Revalidação do front"). Sync jobs
     * run inside the request, so they leave the flush to its end.
     */
    private function configureFrontendRevalidation(): void
    {
        foreach (array_keys(RevalidatesFrontend::TAGS) as $model) {
            $model::observe(RevalidatesFrontend::class);
        }
        Media::observe(RevalidatesFrontend::class);

        Event::listen(SettingsSaved::class, fn () => $this->app->make(FrontendRevalidator::class)->queue('settings'));

        Event::listen(JobProcessed::class, function (JobProcessed $event): void {
            if ($event->connectionName !== 'sync' && $event->job->resolveName() !== RevalidateFrontend::class) {
                $this->app->make(FrontendRevalidator::class)->flush();
            }
        });

        $this->app->terminating(fn () => $this->app->make(FrontendRevalidator::class)->flush());
    }

    /**
     * Public API rate limiters (see docs/api.md "Limites e cabeçalhos"). The
     * Next.js server sends `X-Frontend-Key` and is not rate limited; every
     * other caller is limited by IP.
     */
    private function configureRateLimiters(): void
    {
        RateLimiter::for('api-read', function (Request $request) {
            $key = config('franccino.frontend.api_key');

            if (filled($key) && hash_equals((string) $key, (string) $request->header('X-Frontend-Key'))) {
                return Limit::none();
            }

            return Limit::perMinute(300)->by($request->ip());
        });

        RateLimiter::for('api-forms', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));

        RateLimiter::for('api-downloads', fn (Request $request) => Limit::perMinute(30)->by($request->ip()));
    }
}
