<?php

namespace Database\Seeders;

use App\Enums\BannerPlacement;
use App\Enums\ProjectType;
use App\Enums\StoreType;
use App\Models\Area;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Client;
use App\Models\Collection;
use App\Models\Designer;
use App\Models\Launch;
use App\Models\Product;
use App\Models\Project;
use App\Models\Store;
use App\Support\DemoImageCache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Events\NullDispatcher;
use Spatie\MediaLibrary\HasMedia;

/**
 * Local demo content from public pages of the current site (`data/demo-content.php`). Idempotent:
 * records are matched by slug/name and images are only attached when the collection is empty.
 */
class DemoContentSeeder extends Seeder
{
    public function __construct(private readonly DemoImageCache $images) {}

    public function run(): void
    {
        // `DatabaseSeeder` mutes model events; demo content needs them (search_text, media, revalidation).
        $previous = Model::getEventDispatcher();
        if ($previous instanceof NullDispatcher) {
            Model::setEventDispatcher($this->container->make('events'));
        }

        try {
            $this->seedContent(require __DIR__.'/data/demo-content.php');
        } finally {
            if ($previous !== null) {
                Model::setEventDispatcher($previous);
            }
        }
    }

    /** @param array<string, mixed> $data */
    private function seedContent(array $data): void
    {
        $this->call(AreaSeeder::class);
        $areas = Area::pluck('id', 'key');

        $categories = [];
        foreach ($data['categories'] as $key => $category) {
            $categories[$key] = $this->bySlug(Category::class, $category['slug']['pt'], $category + ['is_published' => true])->id;
        }

        $designers = [];
        foreach ($data['designers'] as $index => $designer) {
            $model = Designer::firstOrNew(['slug' => $designer['slug']]);
            $model->fill(collect($designer)->except('portrait')->all() + ['is_published' => true, 'sort_order' => $index])->save();
            $this->attach($model, 'portrait', $designer['portrait']);
            $designers[$designer['slug']] = $model->id;
        }

        $products = [];
        foreach ($data['products'] as $index => $product) {
            $model = $this->bySlug(Product::class, $product['slug']['pt'], [
                'name' => $product['name'],
                'slug' => $product['slug'],
                'tagline' => $product['tagline'],
                'description' => $product['description'],
                'area_id' => $areas[$product['area']],
                'category_id' => $categories[$product['category']],
                'designer_id' => $designers[$product['designer']] ?? null,
                'dimensions' => $product['dimensions'],
                'materials' => $product['materials'],
                'finishes_note' => $product['finishes_note'],
                'is_featured' => $product['is_featured'],
                'is_published' => true,
                'sort_order' => $index,
                'legacy_wp_id' => $product['legacy_wp_id'],
                'legacy_url' => $product['legacy_url'],
            ]);
            $this->attach($model, 'cover', $product['cover']);
            $products[$product['slug']['pt']] = $model->id;
        }

        foreach ($data['collections'] as $index => $collection) {
            $model = $this->bySlug(Collection::class, $collection['slug']['pt'], collect($collection)->except(['cover', 'products'])->all() + [
                'is_published' => true,
                'sort_order' => $index,
            ]);
            $this->attach($model, 'cover', $collection['cover']);
            $model->products()->sync($this->ordered($collection['products'], $products));
        }

        $year = (int) now()->year;
        $launch = $this->bySlug(Launch::class, "{$data['launch']['slug']['pt']}-{$year}", [
            'title' => ['pt' => "{$data['launch']['title']['pt']} {$year}", 'en' => "{$data['launch']['title']['en']} {$year}"],
            'slug' => ['pt' => "{$data['launch']['slug']['pt']}-{$year}", 'en' => "{$data['launch']['slug']['en']}-{$year}"],
            'year' => $year,
            'summary' => $data['launch']['summary'],
            'description' => $data['launch']['description'],
            'is_published' => true,
        ]);
        $launch->products()->sync($this->ordered($data['launch']['products'], $products));

        foreach ($data['projects'] as $index => $project) {
            $model = $this->bySlug(Project::class, $project['slug']['pt'], collect($project)->except('cover')->all() + [
                'type' => ProjectType::Corporate,
                'is_published' => true,
                'sort_order' => $index,
            ]);
            $this->attach($model, 'cover', $project['cover']);
        }

        foreach ($data['clients'] as $index => $client) {
            Client::updateOrCreate(['name' => $client['name']], $client + ['is_published' => true, 'sort_order' => $index]);
        }

        foreach ($data['stores'] as $index => $store) {
            Store::updateOrCreate(['name' => $store['name']], ['type' => StoreType::from($store['type'])] + $store + [
                'country' => 'BR',
                'is_published' => true,
                'sort_order' => $index,
            ]);
        }

        foreach ($data['banners'] as $index => $banner) {
            $model = Banner::updateOrCreate(
                ['placement' => BannerPlacement::HomeHero, 'sort_order' => $index],
                ['is_published' => true],
            );
            $this->attach($model, 'image', $banner['image']);
        }
    }

    /**
     * Finds a record by its Portuguese slug or starts a new one, then fills and saves it.
     *
     * @template TModel of Model
     *
     * @param  class-string<TModel>  $class
     * @param  array<string, mixed>  $attributes
     * @return TModel
     */
    private function bySlug(string $class, string $slug, array $attributes): Model
    {
        $model = $class::query()->where('slug->pt', $slug)->first() ?? new $class;
        $model->fill($attributes)->save();

        return $model;
    }

    private function attach(HasMedia $model, string $collection, ?string $url): void
    {
        if ($url === null || $model->hasMedia($collection)) {
            return;
        }

        $path = $this->images->path($url);
        if ($path !== null) {
            $model->addMedia($path)->preservingOriginal()->toMediaCollection($collection);
        }
    }

    /**
     * @param  list<string>  $slugs
     * @param  array<string, int>  $ids
     * @return array<int, array{sort_order: int}>
     */
    private function ordered(array $slugs, array $ids): array
    {
        $pivot = [];
        foreach ($slugs as $order => $slug) {
            if (isset($ids[$slug])) {
                $pivot[$ids[$slug]] = ['sort_order' => $order];
            }
        }

        return $pivot;
    }
}
