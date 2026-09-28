<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

/**
 * Tells the Next.js site which cache tags to revalidate (`docs/api.md`,
 * "Revalidação do front"). An error response throws, so the queue retries it.
 */
class RevalidateFrontend implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [10, 60];

    /** @param list<string> $tags */
    public function __construct(public array $tags) {}

    public function handle(): void
    {
        $url = config('franccino.frontend.revalidate_url');

        if (blank($url)) {
            return;
        }

        Http::timeout(10)
            ->acceptJson()
            ->withHeaders(['x-revalidate-secret' => (string) config('franccino.frontend.revalidate_secret')])
            ->post($url, ['tags' => $this->tags])
            ->throw();
    }
}
