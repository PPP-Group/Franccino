<?php

namespace App\Actions;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Temporary, signed URL for a product's 3D model (contract 13.2). The GLB lives on the private `downloads` disk, so
 * the static product page only says that a model exists; the viewer asks for this link when the visitor opens the 3D
 * (`POST /products/{slug}/model-3d/link`, `docs/api.md`).
 */
class CreateModelLink
{
    /** @return array{url: string, expires_at: string} */
    public function handle(Media $media): array
    {
        $expiresAt = now()->addMinutes((int) config('franccino.downloads.link_ttl_minutes'));

        return [
            'url' => $media->getTemporaryUrl($expiresAt),
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }
}
