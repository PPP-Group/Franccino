<?php

namespace App\Models;

use App\Models\Concerns\PrunedAfterRetention;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Quem se cadastrou para baixar arquivos técnicos (revisão da Franccino, 12/11/2026, item 22). Dado pessoal: sai pela
 * retenção (`franccino.retention.download_leads`, LGPD).
 */
class DownloadLead extends Model
{
    use PrunedAfterRetention;

    protected $guarded = [];

    protected $hidden = ['token_hash'];

    /** @return HasMany<DownloadLog, $this> */
    public function downloads(): HasMany
    {
        return $this->hasMany(DownloadLog::class);
    }

    /** Novo token do cadastro: o site guarda o token; o banco, só o hash. */
    public static function newToken(): string
    {
        return Str::random(48);
    }

    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    public static function findByToken(?string $token): ?self
    {
        if ($token === null || $token === '' || strlen($token) > 128) {
            return null;
        }

        return self::query()->where('token_hash', self::hashToken($token))->first();
    }

    protected static function retentionKey(): string
    {
        return 'download_leads';
    }
}
