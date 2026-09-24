<?php

namespace App\Models;

use App\Models\Concerns\HasImageConversions;
use App\Models\Concerns\HasPublication;
use Database\Factories\FinishFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;

class Finish extends Model implements HasMedia
{
    /** @use HasFactory<FinishFactory> */
    use HasFactory, HasImageConversions, HasPublication, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public $translatable = ['name', 'description'];

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
        $this->addMediaCollection('swatch')->singleFile();
    }

    /** @return BelongsTo<FinishGroup, $this> */
    public function group(): BelongsTo
    {
        return $this->belongsTo(FinishGroup::class, 'finish_group_id');
    }

    /** @return BelongsToMany<Product, $this> */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'finish_product')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }
}
