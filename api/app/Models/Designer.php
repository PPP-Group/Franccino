<?php

namespace App\Models;

use App\Models\Concerns\HasDownloadFiles;
use App\Models\Concerns\HasImageConversions;
use App\Models\Concerns\HasMediaLinks;
use App\Models\Concerns\HasPublication;
use Database\Factories\DesignerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;

class Designer extends Model implements HasMedia
{
    /** @use HasFactory<DesignerFactory> */
    use HasDownloadFiles, HasFactory, HasImageConversions, HasMediaLinks, HasPublication, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public $translatable = ['short_bio', 'bio', 'seo_title', 'seo_description'];

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
        $this->addMediaCollection('portrait')->singleFile();
    }

    /** @return HasMany<Product, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /** @return HasMany<Line, $this> */
    public function lines(): HasMany
    {
        return $this->hasMany(Line::class);
    }
}
