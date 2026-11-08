<?php

namespace App\Models;

use App\Models\Concerns\HasImageConversions;
use App\Models\Concerns\HasPublication;
use Database\Factories\SceneFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;

/**
 * Ambiente com pontos clicáveis (banco de ideias, ideia 7): a foto de um ambiente montado com peças da Franccino e,
 * por cima, um ponto em cada peça que leva à página dela. Ligado a um projeto, aparece no Corporativo e na página do
 * projeto (no lugar da home).
 */
class Scene extends Model implements HasMedia
{
    /** @use HasFactory<SceneFactory> */
    use HasFactory, HasImageConversions, HasPublication, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public $translatable = ['title'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('image')->singleFile();
    }

    /** @return HasMany<SceneHotspot, $this> */
    public function hotspots(): HasMany
    {
        return $this->hasMany(SceneHotspot::class)->orderBy('sort_order')->orderBy('id');
    }

    /** @return BelongsTo<Project, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** Published scenes that have a photo: the ones the API shows. */
    public static function shown(Builder $query): Builder
    {
        return $query->published()->whereHas('media', fn ($media) => $media->where('collection_name', 'image'));
    }

    /**
     * Relations the API needs to serialize a scene (`SceneResource`), with `$prefix` for nested loading
     * (`scene.`): only points whose product is published.
     *
     * @return array<int|string, mixed>
     */
    public static function apiRelations(string $prefix = ''): array
    {
        return [
            $prefix.'media',
            $prefix.'hotspots' => fn ($query) => $query->whereHas('product', fn ($product) => $product->published()),
            $prefix.'hotspots.product.area',
            $prefix.'hotspots.product.category',
            $prefix.'hotspots.product.designer',
            $prefix.'hotspots.product.media',
            $prefix.'hotspots.product.launches' => fn ($query) => $query->published(),
        ];
    }
}
