<?php

namespace App\Models\Manage;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

/**
 * Uma credencial da API de gestão (docs/api-gestao.md): a chave criada no painel (`key`) ou a conexão do Claude ou do
 * ChatGPT aprovada pelo OAuth (`connector`). O segredo da chave só existe como SHA-256; os da conexão são os tokens de
 * `oauth_tokens`.
 *
 * @property int $id
 * @property string $kind
 * @property string $name
 * @property list<string> $scopes
 */
class ApiCredential extends Model
{
    public const KEY = 'key';

    public const CONNECTOR = 'connector';

    /** Prefixo da chave do painel (o resto são 48 caracteres hexadecimais). */
    public const KEY_PREFIX = 'fcc_';

    /** Chaves do painel ativas ao mesmo tempo, no máximo. */
    public const MAX_ACTIVE_KEYS = 10;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'scopes' => 'array',
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
            'last_used_at' => 'datetime',
        ];
    }

    /** @return HasOne<User, $this> */
    public function account(): HasOne
    {
        return $this->hasOne(User::class, 'api_credential_id');
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @param  Builder<self>  $query */
    public function scopeActive(Builder $query): void
    {
        $query->whereNull('revoked_at')
            ->where(fn (Builder $q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }

    public function isActive(): bool
    {
        return $this->revoked_at === null && ($this->expires_at === null || $this->expires_at->isFuture());
    }

    /**
     * Cria uma chave do painel e devolve [credencial, segredo]. O segredo só aparece aqui, uma vez.
     *
     * @param  list<string>  $scopes
     * @return array{0: self, 1: string}
     */
    public static function issueKey(string $name, array $scopes, ?int $days, ?User $creator): array
    {
        $secret = self::KEY_PREFIX.bin2hex(random_bytes(24));
        $credential = self::query()->create([
            'kind' => self::KEY,
            'name' => $name,
            'prefix' => substr($secret, 0, 12),
            'secret_hash' => hash('sha256', $secret),
            'scopes' => $scopes,
            'created_by' => $creator?->id,
            'expires_at' => $days ? now()->addDays($days) : null,
        ]);

        return [$credential, $secret];
    }

    public static function findBySecret(string $secret): ?self
    {
        return self::query()->where('kind', self::KEY)->where('secret_hash', hash('sha256', $secret))->first();
    }

    /**
     * A conta interna ("API · nome"): administradora e ativa, para valerem as mesmas permissões e regras do painel,
     * mas ligada à credencial, então nunca entra no painel (`User::canAccessPanel`), não conta como administradora de
     * verdade e não recebe e-mails. Criada na primeira chamada; o registro de atividade
     * mostra o nome dela em cada mudança.
     */
    public function internalUser(): User
    {
        $user = $this->account()->first();
        if ($user !== null) {
            return $user;
        }

        $user = new User;
        $user->forceFill([
            'name' => Str::limit('API · '.$this->name, 250, ''),
            'email' => 'api-'.$this->id.'-'.Str::lower(Str::random(8)).'@api.franccino.invalid',
            'password' => Str::random(64),
            'role' => UserRole::Admin,
            'is_active' => true,
            'api_credential_id' => $this->id,
        ])->save();

        return $user;
    }

    /** Para de valer na hora, com os tokens do conector. */
    public function revoke(): void
    {
        $this->forceFill(['revoked_at' => now()])->save();
        OAuthToken::query()->where('api_credential_id', $this->id)->whereNull('revoked_at')->update(['revoked_at' => now()]);
    }
}
