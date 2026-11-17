<?php

namespace App\Models\Manage;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Token de acesso (`fcca_`, 1 hora) ou de renovação (`fccr_`, 90 dias, trocado a cada uso). Só o hash. */
class OAuthToken extends Model
{
    use MassPrunable;

    public const ACCESS = 'access';

    public const REFRESH = 'refresh';

    public const ACCESS_PREFIX = 'fcca_';

    public const REFRESH_PREFIX = 'fccr_';

    protected $table = 'oauth_tokens';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'revoked_at' => 'datetime'];
    }

    /** @return BelongsTo<ApiCredential, $this> */
    public function credential(): BelongsTo
    {
        return $this->belongsTo(ApiCredential::class, 'api_credential_id');
    }

    /** @return Builder<static> */
    public function prunable(): Builder
    {
        return static::query()->where('expires_at', '<', now()->subDays(2));
    }
}
