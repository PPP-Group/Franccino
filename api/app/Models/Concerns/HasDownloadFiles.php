<?php

namespace App\Models\Concerns;

use App\Models\ProductFile;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Files for download (catalogs, presentations) of a designer or a launch (PPP-109), stored in `product_files`. */
trait HasDownloadFiles
{
    /** @return HasMany<ProductFile, $this> */
    public function files(): HasMany
    {
        return $this->hasMany(ProductFile::class)->orderBy('sort_order')->orderBy('id');
    }
}
