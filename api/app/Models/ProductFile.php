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

    /** Same as the column default, so a new record knows its disk before it is saved (`fillFileDetails`). */
    protected $attributes = ['disk' => 'downloads'];

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
        static::saving(function (ProductFile $file): void {
            if ($file->isDirty('path') || $file->size === null || $file->mime_type === null) {
                $file->fillFileDetails();
            }
        });

        // A replaced or deleted file leaves nothing behind on the private disk.
        static::updated(function (ProductFile $file): void {
            if ($file->wasChanged('path') && filled($old = $file->getOriginal('path'))) {
                Storage::disk($file->getOriginal('disk') ?? $file->disk)->delete($old);
            }
        });
        static::deleted(fn (ProductFile $file) => Storage::disk($file->disk)->delete($file->path));
    }

    /** Size and type read from the disk: the panel upload only stores the path, and the site shows both. */
    public function fillFileDetails(): static
    {
        try {
            $disk = Storage::disk($this->disk);
            $this->size = $disk->size($this->path);
            $this->mime_type = $disk->mimeType($this->path) ?: null;
        } catch (Throwable) {
            // A missing file keeps the size unknown; the download link reports it.
        }

        return $this;
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
