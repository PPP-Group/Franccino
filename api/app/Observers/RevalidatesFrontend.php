<?php

namespace App\Observers;

use App\Models\Area;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Client;
use App\Models\Collection;
use App\Models\Designer;
use App\Models\Finish;
use App\Models\FinishGroup;
use App\Models\Launch;
use App\Models\Line;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductFile;
use App\Models\Project;
use App\Models\Redirect;
use App\Models\Store;
use App\Support\FrontendRevalidator;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Queues the front-end cache tags of any public model that is saved, deleted
 * or restored. Media changes revalidate the tags of the model that owns them.
 */
class RevalidatesFrontend
{
    /** @var array<class-string<Model>, list<string>> */
    public const TAGS = [
        Area::class => ['areas', 'products', 'home'],
        Category::class => ['categories', 'products'],
        Line::class => ['lines', 'products'],
        Designer::class => ['designers', 'products', 'home'],
        Collection::class => ['collections', 'products', 'home'],
        Product::class => ['products', 'home'],
        FinishGroup::class => ['finishes', 'products'],
        Finish::class => ['finishes', 'products'],
        ProductFile::class => ['products', 'designers', 'launches'],
        Launch::class => ['launches', 'products', 'home'],
        Project::class => ['projects', 'products'],
        Client::class => ['clients'],
        Store::class => ['stores'],
        Banner::class => ['banners', 'home'],
        Page::class => ['pages'],
        Redirect::class => ['redirects'],
    ];

    public function __construct(private readonly FrontendRevalidator $revalidator) {}

    public function saved(Model $model): void
    {
        $this->revalidate($model);
    }

    public function deleted(Model $model): void
    {
        $this->revalidate($model);
    }

    public function restored(Model $model): void
    {
        $this->revalidate($model);
    }

    private function revalidate(Model $model): void
    {
        $class = $model instanceof Media ? $model->model_type : $model::class;

        $this->revalidator->queue(...(self::TAGS[$class] ?? []));
    }
}
