<?php

namespace App\Models\Manage;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;

/**
 * Um pedido de autorização à espera do administrador (vale 15 minutos).
 *
 * @property list<string> $scopes
 */
class OAuthRequest extends Model
{
    use HasUuids, MassPrunable;

    protected $table = 'oauth_requests';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['scopes' => 'array', 'expires_at' => 'datetime'];
    }

    /** @return Builder<static> */
    public function prunable(): Builder
    {
        return static::query()->where('expires_at', '<', now()->subDay());
    }
}
