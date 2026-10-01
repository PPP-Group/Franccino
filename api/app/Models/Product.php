<?php

namespace App\Models;

use App\Models\Collection as CollectionModel;
use App\Models\Concerns\HasImageConversions;
use App\Models\Concerns\HasMediaLinks;
use App\Models\Concerns\HasPublication;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;

class Product extends Model implements HasMedia
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, HasImageConversions, HasMediaLinks, HasPublication, HasTranslations, SoftDeletes;

    protected $guarded = [];

    /** @var list<string> */
    public $translatable = [
        'name', 'slug', 'tagline', 'description', 'materials', 'finishes_note', 'seo_title', 'seo_description',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'dimensions' => 'array',
            'is_3d_enabled' => 'boolean',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Product $product): void {
            $parts = [
                ...array_values($product->getTranslations('name')),
                $product->sku,
                $product->designer?->name,
            ];

            $product->search_text = Str::of(implode(' ', array_filter($parts)))->ascii()->lower()->squish()->toString();
        });
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')->singleFile();
        $this->addMediaCollection('gallery');
        $this->addMediaCollection('model_3d')
            ->singleFile()
            ->acceptsMimeTypes(['model/gltf-binary', 'application/octet-stream']);
    }

    /** @return BelongsTo<Area, $this> */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<Line, $this> */
    public function line(): BelongsTo
    {
        return $this->belongsTo(Line::class);
    }

    /** @return BelongsTo<Designer, $this> */
    public function designer(): BelongsTo
    {
        return $this->belongsTo(Designer::class);
    }

    /** @return BelongsToMany<Finish, $this> */
    public function finishes(): BelongsToMany
    {
        return $this->belongsToMany(Finish::class, 'finish_product')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }

    /** @return HasMany<ProductFile, $this> */
    public function files(): HasMany
    {
        return $this->hasMany(ProductFile::class)->orderBy('sort_order');
    }

    /** @return HasMany<DownloadLog, $this> */
    public function downloadLogs(): HasMany
    {
        return $this->hasMany(DownloadLog::class);
    }

    /** @return BelongsToMany<CollectionModel, $this> */
    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(CollectionModel::class, 'collection_product')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }

    /** @return BelongsToMany<Launch, $this> */
    public function launches(): BelongsToMany
    {
        return $this->belongsToMany(Launch::class, 'launch_product')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }

    /** @return BelongsToMany<Project, $this> */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'product_project');
    }

    /**
     * Whether this product belongs to a published launch from the current or previous
     * year. Uses the `launches` relation when it is already loaded, to avoid an extra
     * query when many products are checked at once.
     */
    public function isNew(): bool
    {
        $launches = $this->relationLoaded('launches') ? $this->launches : $this->launches()->get();

        return $launches->contains(
            fn (Launch $launch) => $launch->is_published && $launch->year >= now()->year - 1
        );
    }
}
