<?php

namespace App\Listeners;

use Spatie\MediaLibrary\MediaCollections\Events\MediaHasBeenAddedEvent;

class StoreImageMetadata
{
    public function handle(MediaHasBeenAddedEvent $event): void
    {
        $media = $event->media;

        if (! str_starts_with($media->mime_type ?? '', 'image/') || $media->mime_type === 'image/svg+xml') {
            return;
        }

        $contents = stream_get_contents($media->stream());
        $size = getimagesizefromstring($contents);

        if ($size === false) {
            return;
        }

        $media->setCustomProperty('width', $size[0]);
        $media->setCustomProperty('height', $size[1]);
        $media->saveQuietly();
    }
}
