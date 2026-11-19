<?php

namespace App\Jobs;

use App\Models\NewsletterSubscriber;
use App\Services\Mailchimp;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/** Leva uma inscrição ou um descadastro da newsletter ao Mailchimp, fora da resposta ao visitante. */
class SyncNewsletterSubscriber implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [60, 300];

    public function __construct(public int $subscriberId) {}

    public function handle(Mailchimp $mailchimp): void
    {
        $subscriber = NewsletterSubscriber::find($this->subscriberId);
        if ($subscriber === null || ! $mailchimp->enabled()) {
            return;
        }

        $mailchimp->sync($subscriber);
    }
}
