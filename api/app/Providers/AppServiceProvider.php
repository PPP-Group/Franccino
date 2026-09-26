<?php

namespace App\Providers;

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
use App\Policies\AdminOnlyPolicy;
use App\Policies\ContentPolicy;
use App\Policies\FixedRecordPolicy;
use App\Policies\InboxPolicy;
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
    }
}
