<?php

namespace App\Support;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Downloads demo images once into a local cache (`franccino.demo.image_cache`,
 * default `storage/app/demo-cache`) so re-seeding does not hit the site again.
 */
class DemoImageCache
{
    /** Local path of the cached copy, or `null` when the download fails (the seeder carries on without it). */
    public function path(string $url): ?string
    {
        $directory = (string) config('franccino.demo.image_cache');
        $extension = strtolower(pathinfo((string) parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION)) ?: 'jpg';
        $file = $directory.DIRECTORY_SEPARATOR.sha1($url).'.'.$extension;

        if (File::exists($file)) {
            return $file;
        }

        try {
            $response = Http::timeout(20)->get($url);
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
}
