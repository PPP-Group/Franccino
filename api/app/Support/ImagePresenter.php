<?php

namespace App\Support;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

final class ImagePresenter
{
    public const CONVERSIONS = [480 => 'w480', 960 => 'w960', 1440 => 'w1440', 1920 => 'w1920', 2560 => 'w2560'];

    /** @return array{id:int,alt:string,width:?int,height:?int,src:string,srcset:list<array{width:int,url:string}>,blur_data_url:?string}|null */
    public static function present(?Media $media, string $alt): ?array
    {
        if ($media === null) {
            return null;
        }

        $width = $media->getCustomProperty('width');
        $srcset = [];

        foreach (self::CONVERSIONS as $conversionWidth => $name) {
            if ($width !== null && $conversionWidth > $width && $conversionWidth !== array_key_first(self::CONVERSIONS)) {
                continue;
            }

            if ($media->hasGeneratedConversion($name)) {
                $srcset[] = ['width' => min($conversionWidth, $width ?? $conversionWidth), 'url' => $media->getFullUrl($name)];
            }
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
