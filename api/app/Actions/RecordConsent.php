<?php

namespace App\Actions;

use App\Models\ConsentRecord;
use App\Support\IpHasher;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Stores a `POST /consents` choice. No personal data: the visitor id is a random UUID made in the
 * browser and the IP is kept only as a hash, like the download log.
 */
class RecordConsent
{
    /** @param array<string, mixed> $data validated `ConsentRequest` data */
    public function handle(array $data, Request $request): ConsentRecord
    {
        return ConsentRecord::create([
            'visitor_id' => $data['visitor_id'],
            'choice' => $data['choice'],
            'policy_version' => $data['policy_version'] ?? null,
            'locale' => $data['locale'],
            'ip_hash' => IpHasher::hash($request->ip()),
            'user_agent' => Str::limit((string) $request->userAgent(), 509) ?: null,
        ]);
    }
}
