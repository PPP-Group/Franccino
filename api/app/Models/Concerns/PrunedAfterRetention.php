<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;

/**
 * Personal-data logs kept only for the period in `franccino.retention` (LGPD), then removed by the daily
 * `model:prune` (`routes/console.php`). An empty period keeps the records.
 */
trait PrunedAfterRetention
{
    use MassPrunable;

    abstract protected static function retentionKey(): string;

    /** @return Builder<static> */
    public function prunable(): Builder
    {
        $days = config('franccino.retention.'.static::retentionKey());

        return blank($days)
            ? static::query()->whereRaw('1 = 0')
            : static::query()->where('created_at', '<', now()->subDays((int) $days));
    }
}
