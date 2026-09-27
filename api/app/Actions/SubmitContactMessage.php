<?php

namespace App\Actions;

use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use App\Settings\GeneralSettings;
use App\Support\IpHasher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Stores a `POST /contact` submission and, when recipients are configured,
 * queues the notification e-mail (`docs/api.md`, "Escrita").
 */
class SubmitContactMessage
{
    /** @param array<string, mixed> $data validated `ContactRequest` data */
    public function handle(array $data, Request $request): ContactMessage
    {
        $message = ContactMessage::create([
            'type' => $data['type'],
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'company' => $data['company'] ?? null,
            'profession' => $data['profession'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'message' => $data['message'],
            'product_id' => $data['product_id'] ?? null,
            'items' => $data['items'] ?? null,
            'locale' => $data['locale'],
            'source_url' => $data['source_url'] ?? null,
            'consent_at' => now(),
            'ip_hash' => IpHasher::hash($request->ip()),
            'user_agent' => $this->truncate($request->userAgent()),
        ]);

        $recipients = app(GeneralSettings::class)->contact_recipients;

        if (filled($recipients)) {
            Mail::to($recipients)->queue(new ContactMessageReceived($message));
        }

        return $message;
    }

    private function truncate(?string $value): ?string
    {
        return $value === null ? null : Str::limit($value, 512, '');
    }
}
