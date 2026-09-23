<?php

namespace App\Support;

final class IpHasher
{
    public static function hash(?string $ip): string
    {
        return hash('sha256', ($ip ?? 'unknown').'|'.config('app.key'));
    }
}
