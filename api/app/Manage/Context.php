<?php

namespace App\Manage;

use App\Models\Manage\ApiCredential;
use App\Models\User;

/** Quem chama: a credencial, a conta interna dela e por onde chegou (`rest` ou `mcp`). */
final class Context
{
    public function __construct(
        public readonly ApiCredential $credential,
        public readonly User $user,
        public readonly string $channel,
        public readonly ?string $ifMatch = null,
    ) {}
}
