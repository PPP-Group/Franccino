<?php

namespace App\Models\Manage;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;

/** A resposta guardada de uma `Idempotency-Key` (vale 24 horas; apagada em 2 dias). */
class ApiIdempotency extends Model
{
    use MassPrunable;

    public const UPDATED_AT = null;

    protected $table = 'api_idempotency';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    /** @return Builder<static> */
    public function prunable(): Builder
    {
        return static::query()->where('created_at', '<', now()->subDays(2));
    }
}
