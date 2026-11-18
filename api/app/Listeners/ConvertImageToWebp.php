<?php

namespace App\Listeners;

use App\Support\WebpImage;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Events\MediaHasBeenAddedEvent;

/**
 * Every photo that enters the media library (panel, management API, connector, bulk import) is stored as WebP. It runs
 * right after the file is copied and before the sizes are made, so the sizes come from the WebP. The original name and
 * size stay in the custom properties, for whoever wants to know what was sent.
 */
class ConvertImageToWebp
{
    public function handle(MediaHasBeenAddedEvent $event): void
    {
        $media = $event->media;
        if (! WebpImage::converts($media->mime_type)) {
            return;
        }

        $disk = Storage::disk($media->disk);
        $path = $media->getPathRelativeToRoot();
        $contents = $disk->get($path);
        $webp = $contents === null ? null : WebpImage::fromString($contents, $media->mime_type);
        if ($webp === null) {
            return;
        }

        // The bytes go to the same path first; renaming `file_name` then moves the file (MediaObserver::updating).
        $disk->put($path, $webp, ['ContentType' => 'image/webp']);

        $media->setCustomProperty('uploaded', ['name' => $media->file_name, 'mime' => $media->mime_type, 'size' => $media->size]);
        $media->file_name = pathinfo($media->file_name, PATHINFO_FILENAME).'.webp';
        $media->mime_type = 'image/webp';
        $media->size = strlen($webp);
        $media->save();
    }
}
