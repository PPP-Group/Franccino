<?php

namespace App\Models\Manage;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;

/**
 * Um aplicativo registrado no OAuth: pelo registro dinâmico (RFC 7591) ou pelo documento de metadados do cliente
 * (o `client_id` é um endereço https).
 *
 * @property list<string> $redirect_uris
 */
class OAuthClient extends Model
{
    use MassPrunable;

    protected $table = 'oauth_clients';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['redirect_uris' => 'array', 'is_metadata_document' => 'boolean', 'last_used_at' => 'datetime'];
    }

    /** @return Builder<static> Registros que nunca conectaram em 7 dias saem. */
    public function prunable(): Builder
    {
        return static::query()->whereNull('last_used_at')->where('created_at', '<', now()->subDays(7));
    }
}
