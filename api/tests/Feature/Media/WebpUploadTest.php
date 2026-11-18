<?php

use App\Support\WebpImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('stores every photo added to the media library as webp, keeping what was sent', function () {
    $product = publishedProduct();

    $media = $product->addMedia(UploadedFile::fake()->image('Cadeira Aura.jpg', 1200, 900))->toMediaCollection('cover');
    $media->refresh();

    expect($media->mime_type)->toBe('image/webp')
        ->and($media->file_name)->toEndWith('.webp')
        ->and($media->getCustomProperty('uploaded.mime'))->toBe('image/jpeg')
        ->and($media->getCustomProperty('width'))->toBe(1200)
        ->and(Storage::disk($media->disk)->exists($media->getPathRelativeToRoot()))->toBeTrue()
        ->and(getimagesizefromstring(Storage::disk($media->disk)->get($media->getPathRelativeToRoot()))['mime'])->toBe('image/webp');
});

it('keeps the transparency of a png cutout', function () {
    $image = imagecreatetruecolor(40, 30);
    imagealphablending($image, false);
    imagesavealpha($image, true);
    imagefill($image, 0, 0, imagecolorallocatealpha($image, 0, 0, 0, 127));
    ob_start();
    imagepng($image);
    $webp = WebpImage::fromString((string) ob_get_clean(), 'image/png');

    $decoded = imagecreatefromstring((string) $webp);
    expect((imagecolorat($decoded, 5, 5) >> 24) & 0x7F)->toBe(127);
});

it('scales down photos larger than the site ever shows', function () {
    $big = UploadedFile::fake()->image('enorme.jpg', 6000, 3000);
    $size = getimagesizefromstring((string) WebpImage::fromString($big->get(), 'image/jpeg'));

    expect([$size[0], $size[1]])->toBe([WebpImage::MAX_SIDE, 2048]);
});

it('leaves svg, gif and webp as they are', function () {
    expect(WebpImage::converts('image/svg+xml'))->toBeFalse()
        ->and(WebpImage::converts('image/gif'))->toBeFalse()
        ->and(WebpImage::converts('image/webp'))->toBeFalse();
});
