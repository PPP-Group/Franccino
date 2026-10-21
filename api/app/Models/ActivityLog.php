<?php

namespace App\Models;

use App\Models\Concerns\PrunedAfterRetention;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * One action of a person in the panel (PPP-54): `created`, `updated`, `deleted` or `login`. Written by
 * `RecordsActivity` and the login listener; never edited.
 */
class ActivityLog extends Model
{
    use PrunedAfterRetention;

    public const ACTIONS = ['created', 'updated', 'deleted', 'login'];

    const UPDATED_AT = null;

    protected $guarded = [];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'changes' => 'array',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return MorphTo<Model, $this> */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    protected static function retentionKey(): string
    {
        return 'activity_logs';
    }
}
