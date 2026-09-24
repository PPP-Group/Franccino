<?php

namespace App\Models;

use App\Enums\ProductFileType;
use App\Models\Concerns\HasPublication;
use Database\Factories\ProductFileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class ProductFile extends Model
{
    /** @use HasFactory<ProductFileFactory> */
    use HasFactory, HasPublication, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public $translatable = ['title'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => ProductFileType::class,
            'is_published' => 'boolean',
        ];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return HasMany<DownloadLog, $this> */
    public function downloadLogs(): HasMany
    {
        return $this->hasMany(DownloadLog::class);
    }
}
