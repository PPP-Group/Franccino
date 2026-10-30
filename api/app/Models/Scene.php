<?php

namespace App\Models;

use App\Models\Concerns\HasImageConversions;
use App\Models\Concerns\HasPublication;
use Database\Factories\SceneFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;

/**
 * Ambiente com pontos clicáveis (banco de ideias, ideia 7): a foto de um ambiente montado com peças da Franccino e,
 * por cima, um ponto em cada peça que leva à página dela.
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
}
