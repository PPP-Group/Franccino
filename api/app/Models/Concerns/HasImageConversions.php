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
        // A page video (MP4) has no image sizes: generating them would need a frame grabber the server does not have,
        // and the small preview below runs during the upload, so the upload itself failed (500).
        if ($media !== null && str_starts_with((string) $media->mime_type, 'video/')) {
            return;
        }

        // Higher quality than the WebP default: the large sizes are the ones seen up close on retina screens.
        foreach (ImagePresenter::CONVERSIONS as $width => $name) {
            $this->addMediaConversion($name)
                ->fit(Fit::Max, $width, $width * 4)
                ->format('webp')
                ->quality($width >= 960 ? 90 : 85);
        }

        $this->addMediaConversion('lqip')
            ->nonQueued()
            ->fit(Fit::Max, 24, 96)
            ->format('webp')
            ->quality(40);
    }
}
