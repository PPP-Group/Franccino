<?php

namespace App\Support;

use App\Jobs\RevalidateFrontend;

/**
 * Collects cache tags touched during a request, command or queued job and
 * dispatches a single `RevalidateFrontend` with the unique tags when it ends
 * (`docs/api.md`, "Revalidação do front"). Bound as a singleton; flushed by
 * `app()->terminating()` and after every processed queue job.
 */
final class FrontendRevalidator
{
    /** @var array<string, true> */
    private array $pending = [];

    public function queue(string ...$tags): void
    {
        foreach ($tags as $tag) {
            $this->pending[$tag] = true;
        }
    }

    /** @return list<string> */
    public function pending(): array
    {
        return array_keys($this->pending);
    }

    public function flush(): void
    {
        $tags = $this->pending();
        $this->pending = [];

        if ($tags === [] || blank(config('franccino.frontend.revalidate_url'))) {
            return;
        }

        RevalidateFrontend::dispatch($tags);
    }
}
