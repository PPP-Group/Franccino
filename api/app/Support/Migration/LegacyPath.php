<?php

namespace App\Support\Migration;

/**
 * Normalizes an URL of the old site into the `from_path` of `redirects`: only path and query, no trailing
 * slash (except the root), query keys in alphabetical order. Same rule as `normalizeLegacyPath` in the web
 * (web/src/lib/redirects/match.ts), so both sides find the same row.
 */
final class LegacyPath
{
    public static function normalize(string $url): string
    {
        $path = (string) (parse_url($url, PHP_URL_PATH) ?? '');
        $path = $path === '' ? '/' : $path;
        if (strlen($path) > 1) {
            $path = rtrim($path, '/');
        }

        parse_str((string) (parse_url($url, PHP_URL_QUERY) ?? ''), $params);
        ksort($params);
        $query = http_build_query($params);

        return $query === '' ? $path : "{$path}?{$query}";
    }
}
