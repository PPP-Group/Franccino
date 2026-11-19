<?php

namespace App\Models;

use App\Models\Concerns\HasDownloadFiles;
use App\Models\Concerns\HasImageConversions;
use App\Models\Concerns\HasLocalizedSlug;
use App\Models\Concerns\HasMediaLinks;
use App\Models\Concerns\HasPublication;
use Database\Factories\LaunchFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;

class Launch extends Model implements HasMedia
{
    /** @use HasFactory<LaunchFactory> */
    use HasDownloadFiles, HasFactory, HasImageConversions, HasLocalizedSlug, HasMediaLinks, HasPublication, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public $translatable = ['title', 'slug', 'summary', 'description', 'seo_title', 'seo_description'];

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
        $this->addMediaCollection('cover')->singleFile();
        $this->addMediaCollection('gallery');
    }

    /**
     * The published launch with the highest `year` (see docs/data-model.md: a product
     * is "new" when it belongs to the current/latest published launch).
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeCurrent(Builder $query): Builder
    {
        return $query->published()->orderByDesc('year');
    }

    /** @return BelongsToMany<Product, $this> */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'launch_product')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    /** Quanto tempo a peça fica como "Lançamento" depois de entrar no lançamento (revisão de 18/11/2026). */
    public const NEW_FOR_MONTHS = 12;

    /** A peça que entrou no lançamento nessa data ainda é "Lançamento"? Sem data (registro antigo), sim. */
    public static function stillNew(mixed $addedAt): bool
    {
        if ($addedAt === null) {
            return true;
        }

        return Carbon::parse($addedAt)->greaterThan(now()->subMonths(self::NEW_FOR_MONTHS));
    }

    /**
     * Só as peças que ainda são "Lançamento": entraram no lançamento há menos de um ano (ou sem data).
     *
     * @param  Builder<*>|BelongsToMany<*, *>  $query
     */
    public static function onlyStillNew(Builder|BelongsToMany $query): void
    {
        $query->where(fn ($query) => $query
            ->whereNull('launch_product.created_at')
            ->orWhere('launch_product.created_at', '>', now()->subMonths(self::NEW_FOR_MONTHS)));
    }
}
