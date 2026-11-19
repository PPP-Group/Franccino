<?php

namespace App\Models;

use App\Jobs\SyncNewsletterSubscriber;
use Database\Factories\NewsletterSubscriberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    /** @use HasFactory<NewsletterSubscriberFactory> */
    use HasFactory;

    protected $guarded = [];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'consent_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
        ];
    }

    /** Inscrição, descadastro e nome vão para o Mailchimp quando ele está configurado (`SyncNewsletterSubscriber`). */
    protected static function booted(): void
    {
        static::saved(function (NewsletterSubscriber $subscriber): void {
            if ($subscriber->wasRecentlyCreated || $subscriber->wasChanged(['email', 'name', 'unsubscribed_at', 'locale'])) {
                SyncNewsletterSubscriber::dispatch($subscriber->id)->afterCommit();
            }
        });
    }
}
