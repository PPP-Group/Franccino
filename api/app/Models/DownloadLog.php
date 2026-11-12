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

    /**
     * Quem baixou (cadastro antes do download, item 22 da revisão de 12/11/2026).
     *
     * @return BelongsTo<DownloadLead, $this>
     */
    public function downloadLead(): BelongsTo
    {
        return $this->belongsTo(DownloadLead::class);
    }

    protected static function retentionKey(): string
    {
        return 'download_logs';
    }
}
