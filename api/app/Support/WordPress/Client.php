<?php

namespace App\Support\WordPress;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\LazyCollection;
use RuntimeException;
use Throwable;

/**
 * Read-only access to the current WordPress site (`franccino.wordpress.base_url`): paginated REST
 * endpoints, product page HTML and media files (cached under `franccino.wordpress.cache` so a rerun
 * does not download the same image twice).
 */
class Client
{
    /**
     * @param  array<string, scalar>  $query
     * @return LazyCollection<int, array<string, mixed>>
     */
    public function paginate(string $endpoint, array $query = []): LazyCollection
    {
        return LazyCollection::make(function () use ($endpoint, $query) {
            $page = 1;
            do {
                $response = $this->get($this->url('wp-json/wp/v2/'.ltrim($endpoint, '/')), $query + [
                    'per_page' => (int) config('franccino.wordpress.per_page', 100),
                    'page' => $page,
                ]);
                $pages = max(1, (int) $response->header('X-WP-TotalPages'));
                foreach ((array) $response->json() as $item) {
                    if (is_array($item)) {
                        yield $item;
                    }
                }
                $page++;
            } while ($page <= $pages);
        });
    }

    public function html(string $url): string
    {
        return $this->get($url)->body();
    }

    /** Local copy of a remote file, or `null` when it cannot be downloaded (the import carries on). */
    public function download(string $url): ?string
    {
        $directory = (string) config('franccino.wordpress.cache');
        $extension = strtolower(pathinfo((string) parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION)) ?: 'bin';
        $file = $directory.DIRECTORY_SEPARATOR.sha1($url).'.'.$extension;

        if (File::exists($file)) {
            return $file;
        }

        try {
            $response = $this->request()->get($url);
        } catch (Throwable) {
            return null;
        }

        if (! $response->successful() || $response->body() === '') {
            return null;
        }

        File::ensureDirectoryExists($directory);
        File::put($file, $response->body());

        return $file;
    }

    /** @param array<string, scalar> $query */
    private function get(string $url, array $query = []): Response
    {
        $response = $this->request()->get($url, $query);
        if (! $response->successful()) {
            throw new RuntimeException("WordPress respondeu {$response->status()} em {$url}");
        }

        return $response;
    }

    private function request(): PendingRequest
    {
        return Http::timeout(30)
            ->retry(3, 500, throw: false)
            ->withHeaders(['User-Agent' => 'FranccinoMigration/1.0']);
    }

    private function url(string $path): string
    {
        return rtrim((string) config('franccino.wordpress.base_url'), '/').'/'.$path;
    }
}
