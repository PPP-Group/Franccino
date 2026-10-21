<?php

namespace App\Models;

use App\Models\Concerns\PrunedAfterRetention;
use Database\Factories\DownloadLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DownloadLog extends Model
{
    /** @use HasFactory<DownloadLogFactory> */
    use HasFactory, PrunedAfterRetention;

    /**
     * Download logs are never updated after creation (see docs/data-model.md).
     */
    const UPDATED_AT = null;

    protected $guarded = [];

    /** @return BelongsTo<ProductFile, $this> */
    public function productFile(): BelongsTo
    {
        return $this->belongsTo(ProductFile::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected static function retentionKey(): string
    {
        return 'download_logs';
    }
}
