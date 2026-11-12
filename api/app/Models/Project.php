<?php

namespace App\Models;

use App\Enums\ProjectType;
use App\Models\Concerns\HasImageConversions;
use App\Models\Concerns\HasLocalizedSlug;
use App\Models\Concerns\HasPublication;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;

class Project extends Model implements HasMedia
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory, HasImageConversions, HasLocalizedSlug, HasPublication, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public $translatable = ['title', 'slug', 'summary', 'description', 'seo_title', 'seo_description'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => ProjectType::class,
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')->singleFile();
        $this->addMediaCollection('gallery');
    }

    /** @return BelongsToMany<Product, $this> */
    /**
     * Peça em destaque ao lado do texto do projeto, escolhida no painel.
     *
     * @return BelongsTo<Product, $this>
     */
    public function featuredProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'featured_product_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_project');
    }

    /**
     * The project photo with clickable points (`Scene`), when the panel has one published with a photo (the first by
     * order, if there are several).
     *
     * @return HasOne<Scene, $this>
     */
    public function scene(): HasOne
    {
        return $this->hasOne(Scene::class)->ofMany(['sort_order' => 'min', 'id' => 'min'], fn ($query) => $query->shown());
    }
}
