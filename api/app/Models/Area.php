<?php

namespace App\Models;

use App\Enums\AreaKey;
use App\Models\Concerns\HasImageConversions;
use Database\Factories\AreaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;

class Area extends Model implements HasMedia
{
    /** @use HasFactory<AreaFactory> */
    use HasFactory, HasImageConversions, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public $translatable = ['name', 'description', 'seo_title', 'seo_description'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'key' => AreaKey::class,
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')->singleFile();
    }

    /** @return HasMany<Product, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
