<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cloudflare Turnstile verification (`docs/api.md`, "Escrita"). Verification
 * is skipped entirely — always `true`, no HTTP call — when
 * `franccino.turnstile.secret_key` is empty, which is the local/testing
 * default (see `TURNSTILE_SECRET_KEY` in `.env.example`).
 *
 * If Cloudflare doesn't answer in 5 seconds, the form is refused like a failed challenge (the visitor sees the
 * validation message and can try again), never accepted without a check and never a server error.
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

        try {
            $response = Http::asForm()->timeout(5)->connectTimeout(3)->post(self::VERIFY_URL, [
                'secret' => $secret,
                'response' => (string) $token,
                'remoteip' => (string) $ip,
            ]);
        } catch (ConnectionException $exception) {
            Log::warning('Turnstile sem resposta; envio recusado.', ['error' => $exception->getMessage()]);

            return false;
        }

        return $response->successful() && (bool) $response->json('success');
    }
}
