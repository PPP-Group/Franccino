<?php

namespace App\Listeners;

use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\Conversions\Events\ConversionHasBeenCompletedEvent;

class StoreBlurPlaceholder
{
    public function handle(ConversionHasBeenCompletedEvent $event): void
    {
        if ($event->conversion->getName() !== 'lqip') {
            return;
        }

        $media = $event->media;

        $contents = Storage::disk($media->conversions_disk)->get($media->getPathRelativeToRoot('lqip'));

        $media->setCustomProperty('blur_data_url', 'data:image/webp;base64,'.base64_encode($contents));
        $media->saveQuietly();
    }
}
