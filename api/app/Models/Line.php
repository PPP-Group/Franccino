<?php

namespace App\Models;

use Database\Factories\LineFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class Line extends Model
{
    /** @use HasFactory<LineFactory> */
    use HasFactory, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public $translatable = ['description'];

    /** @return BelongsTo<Designer, $this> */
    public function designer(): BelongsTo
    {
        return $this->belongsTo(Designer::class);
    }

    /** @return HasMany<Product, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
