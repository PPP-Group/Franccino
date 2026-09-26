<?php

namespace App\Models\Concerns;

use App\Support\ImagePresenter;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

trait HasImageConversions
{
    use InteractsWithMedia;

    public function registerMediaConversions(?Media $media = null): void
    {
        foreach (ImagePresenter::CONVERSIONS as $width => $name) {
            $this->addMediaConversion($name)
                ->fit(Fit::Max, $width, $width * 4)
                ->format('webp')
                ->quality(82);
        }

        $this->addMediaConversion('lqip')
            ->nonQueued()
            ->fit(Fit::Max, 24, 96)
            ->format('webp')
            ->quality(40);
    }
}
