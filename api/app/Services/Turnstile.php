<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

/**
 * Cloudflare Turnstile verification (`docs/api.md`, "Escrita"). Verification
 * is skipped entirely — always `true`, no HTTP call — when
 * `franccino.turnstile.secret_key` is empty, which is the local/testing
 * default (see `TURNSTILE_SECRET_KEY` in `.env.example`).
 */
final class Turnstile
{
    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    public function verify(?string $token, ?string $ip): bool
    {
        $secret = config('franccino.turnstile.secret_key');

        if (blank($secret)) {
            return true;
        }

        $response = Http::asForm()->post(self::VERIFY_URL, [
            'secret' => $secret,
            'response' => (string) $token,
            'remoteip' => (string) $ip,
        ]);

        return (bool) $response->json('success');
    }
}
