<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Turns a JPEG or PNG into WebP (revisão de 17/11/2026: "todas as imagens em WebP, reduzindo o tamanho sem perder
 * qualidade"). Quality 90 keeps photos visually the same at a fraction of the size; PNG keeps its transparency (the
 * cutouts of the carousel). Phone photos are turned upright (EXIF) and anything over MAX_SIDE px is scaled down,
 * since the site never shows more than 2560 px.
 */
class WebpImage
{
    public const QUALITY = 90;

    public const MAX_SIDE = 4096;

    /** Formats converted on upload; GIF (maybe animated), SVG and WebP itself stay as they are. */
    public const CONVERTS = ['image/jpeg', 'image/png', 'image/bmp', 'image/x-ms-bmp'];

    public static function converts(?string $mime): bool
    {
        return in_array($mime, self::CONVERTS, true) && function_exists('imagewebp');
    }

    /**
     * Saves a photo on a disk (the page blocks, outside the media library) as WebP when it converts, or as sent
     * otherwise. `$path` is the target with the original extension; the returned path may end in `.webp`.
     */
    public static function store(string $disk, string $path, string $contents, ?string $mime): string
    {
        $webp = self::converts($mime) ? self::fromString($contents, $mime) : null;
        if ($webp !== null) {
            $path = preg_replace('/\.[^.\/]+$/', '', $path).'.webp';
            $contents = $webp;
        }
        Storage::disk($disk)->put($path, $contents, array_filter([
            'visibility' => 'public',
            'ContentType' => $webp !== null ? 'image/webp' : $mime,
        ]));

        return $path;
    }

    /** The WebP bytes, or null when the image cannot be read. */
    public static function fromString(string $contents, ?string $mime = null): ?string
    {
        $image = @imagecreatefromstring($contents);
        if ($image === false) {
            return null;
        }

        if (! imageistruecolor($image)) {
            imagepalettetotruecolor($image);
        }
        if ($mime === 'image/jpeg') {
            $image = self::upright($image, $contents);
        }
        $image = self::bounded($image);

        imagealphablending($image, false);
        imagesavealpha($image, true);

        ob_start();
        $written = imagewebp($image, null, self::QUALITY);
        $webp = (string) ob_get_clean();
        imagedestroy($image);

        return $written && $webp !== '' ? $webp : null;
    }

    private static function upright(\GdImage $image, string $contents): \GdImage
    {
        if (! function_exists('exif_read_data')) {
            return $image;
        }
        $exif = @exif_read_data('data://image/jpeg;base64,'.base64_encode($contents));
        $angle = match ((int) ($exif['Orientation'] ?? 1)) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };
        if ($angle === 0) {
            return $image;
        }
        $rotated = imagerotate($image, $angle, 0);

        return $rotated === false ? $image : $rotated;
    }

    private static function bounded(\GdImage $image): \GdImage
    {
        $width = imagesx($image);
        $height = imagesy($image);
        $side = max($width, $height);
        if ($side <= self::MAX_SIDE) {
            return $image;
        }
        $scale = self::MAX_SIDE / $side;
        $scaled = imagescale($image, (int) round($width * $scale), (int) round($height * $scale), IMG_BICUBIC);

        return $scaled === false ? $image : $scaled;
    }
}
