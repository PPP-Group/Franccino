<?php

namespace App\Actions;

use App\Models\NewsletterSubscriber;
use App\Support\IpHasher;
use Illuminate\Http\Request;

/**
 * Stores a `POST /newsletter` subscription. Re-subscribing an existing,
 * unsubscribed e-mail simply clears `unsubscribed_at` instead of creating a
 * duplicate row (`email` is unique) — see `docs/api.md` (R4).
 */
class SubscribeToNewsletter
{
    /**
     * @param  array<string, mixed>  $data  validated `NewsletterRequest` data
     * @return bool `true` when a new subscriber was created, `false` when an existing one was reactivated
     */
    public function handle(array $data, Request $request): bool
    {
        $existing = NewsletterSubscriber::where('email', $data['email'])->first();

        if ($existing) {
            $existing->update(['unsubscribed_at' => null]);

            return false;
        }

        NewsletterSubscriber::create([
            'email' => $data['email'],
            'name' => $data['name'] ?? null,
            'locale' => $data['locale'],
            'source' => $data['source'] ?? null,
            'consent_at' => now(),
            'ip_hash' => IpHasher::hash($request->ip()),
        ]);

        return true;
    }
}
