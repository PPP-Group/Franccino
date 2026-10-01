<?php

namespace App\Support;

/**
 * Embed URL for the video services the site plays inline (YouTube in its no-cookie domain, Vimeo).
 * Any other address stays a plain external link.
 */
final class VideoEmbed
{
    public static function url(string $url): ?string
    {
        $parts = parse_url(trim($url));
        $host = strtolower((string) ($parts['host'] ?? ''));
        $host = (string) preg_replace('/^(www\.|m\.)/', '', $host);
        $path = (string) ($parts['path'] ?? '');
        parse_str((string) ($parts['query'] ?? ''), $query);

        $youtubeId = match (true) {
            $host === 'youtu.be' => ltrim($path, '/'),
            $host === 'youtube.com' && $path === '/watch' => (string) ($query['v'] ?? ''),
            $host === 'youtube.com' && preg_match('#^/(shorts|embed|live)/([^/]+)#', $path, $match) === 1 => $match[2],
            default => null,
        };
        if ($youtubeId !== null && preg_match('/^[A-Za-z0-9_-]{6,20}$/', $youtubeId)) {
            return "https://www.youtube-nocookie.com/embed/{$youtubeId}";
        }

        if ($host === 'vimeo.com' && preg_match('#^/(\d+)#', $path, $match)) {
            return "https://player.vimeo.com/video/{$match[1]}";
        }
        if ($host === 'player.vimeo.com' && preg_match('#^/video/(\d+)#', $path, $match)) {
            return "https://player.vimeo.com/video/{$match[1]}";
        }

        return null;
    }
}
