<?php

namespace App\Models\Manage;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** O código de uso único que o aplicativo troca pelos tokens (2 minutos; só o hash). */
class OAuthCode extends Model
{
    use MassPrunable;

    protected $table = 'oauth_codes';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'used_at' => 'datetime'];
    }

    /** @return BelongsTo<ApiCredential, $this> */
    public function credential(): BelongsTo
    {
        return $this->belongsTo(ApiCredential::class, 'api_credential_id');
    }

    /** @return Builder<static> */
    public function prunable(): Builder
    {
        return static::query()->where('expires_at', '<', now()->subDay());
    }
}
