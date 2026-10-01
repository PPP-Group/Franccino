<?php

namespace App\Models;

use App\Enums\ProductFileType;
use App\Models\Concerns\HasPublication;
use Database\Factories\ProductFileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Spatie\Translatable\HasTranslations;
use Throwable;

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

    protected static function booted(): void
    {
        // The panel upload only stores the path: read the size from the disk so the site can show it.
        static::saving(function (ProductFile $file): void {
            if ($file->isDirty('path') || $file->size === null) {
                try {
                    $file->size = Storage::disk($file->disk)->size($file->path);
                } catch (Throwable) {
                    // A missing file keeps the size unknown; the download link reports it.
                }
            }
        });
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<Designer, $this> */
    public function designer(): BelongsTo
    {
        return $this->belongsTo(Designer::class);
    }

    /** @return BelongsTo<Launch, $this> */
    public function launch(): BelongsTo
    {
        return $this->belongsTo(Launch::class);
    }

    /** The product, designer or launch the file belongs to (PPP-109). */
    public function owner(): Product|Designer|Launch|null
    {
        return $this->product ?? $this->designer ?? $this->launch;
    }

    /** @return HasMany<DownloadLog, $this> */
    public function downloadLogs(): HasMany
    {
        return $this->hasMany(DownloadLog::class);
    }
}
