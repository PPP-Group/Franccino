<?php

namespace App\Support;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

final class ImagePresenter
{
    public const CONVERSIONS = [480 => 'w480', 960 => 'w960', 1440 => 'w1440', 1920 => 'w1920', 2560 => 'w2560'];

    /** Formats already compressed for the web: at its own size, the original is served as is (no second compression). */
    private const WEB_READY = ['image/webp', 'image/avif'];

    /** @return array{id:int,alt:string,width:?int,height:?int,src:string,srcset:list<array{width:int,url:string}>,blur_data_url:?string}|null */
    public static function present(?Media $media, string $alt): ?array
    {
        if ($media === null) {
            return null;
        }

        $width = $media->getCustomProperty('width');
        $srcset = [];

        // Conversions never upscale (Fit::Max), so the first one at least as wide as the original already holds the
        // original's full resolution: it is kept, and only the ones after it (identical copies) are skipped.
        foreach (self::CONVERSIONS as $conversionWidth => $name) {
            if ($media->hasGeneratedConversion($name)) {
                $srcset[] = ['width' => min($conversionWidth, $width ?? $conversionWidth), 'url' => $media->getFullUrl($name)];
            }

            if ($width !== null && $conversionWidth >= $width) {
                break;
            }
        }

        // A web-ready original no larger than the biggest conversion replaces that conversion at full size: re-encoding
        // an already compressed WebP (the photos imported from the old site) only loses detail.
        $last = array_key_last($srcset);
        if ($last !== null && $width !== null && $srcset[$last]['width'] === $width
            && in_array($media->mime_type, self::WEB_READY, true)) {
            $srcset[$last]['url'] = $media->getFullUrl();
        }

        return [
            'id' => $media->id,
            'alt' => $alt,
            'width' => $width,
            'height' => $media->getCustomProperty('height'),
            'src' => $srcset === [] ? $media->getFullUrl() : $srcset[array_key_last($srcset)]['url'],
            'srcset' => $srcset,
            'blur_data_url' => $media->getCustomProperty('blur_data_url'),
        ];
    }

    /** @param iterable<Media> $media */
    public static function presentMany(iterable $media, string $alt): array
    {
        $images = [];
        $index = 1;

        foreach ($media as $item) {
            $images[] = self::present($item, $alt.' — '.$index++);
        }

        return $images;
    }
}
