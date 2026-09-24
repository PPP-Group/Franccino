<?php

use App\Models\Concerns\HasImageConversions;
use App\Support\ImagePresenter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\HasMedia;

class MediaStub extends Model implements HasMedia
{
    use HasImageConversions;

    protected $table = 'media_stubs';

    protected $guarded = [];

    public $timestamps = false;
}

beforeEach(function () {
    Storage::fake('media');
    config(['media-library.queue_conversions_by_default' => false]);
    Schema::create('media_stubs', fn (Blueprint $table) => $table->id());
});

it('stores dimensions, conversions and a blur placeholder', function () {
    $stub = MediaStub::create();
    $media = $stub->addMedia(UploadedFile::fake()->image('peca.jpg', 3000, 2000))->toMediaCollection('cover');

    $media->refresh();

    expect($media->getCustomProperty('width'))->toBe(3000)
        ->and($media->getCustomProperty('height'))->toBe(2000)
        ->and($media->getCustomProperty('blur_data_url'))->toStartWith('data:image/webp;base64,')
        ->and($media->hasGeneratedConversion('w960'))->toBeTrue()
        ->and($media->hasGeneratedConversion('w2560'))->toBeTrue();
});

it('presents an image in the api format', function () {
    $stub = MediaStub::create();
    $media = $stub->addMedia(UploadedFile::fake()->image('peca.jpg', 1200, 800))->toMediaCollection('cover');

    $image = ImagePresenter::present($media->refresh(), 'Cadeira Aura');

    expect($image)->toMatchArray(['id' => $media->id, 'alt' => 'Cadeira Aura', 'width' => 1200, 'height' => 800])
        ->and(collect($image['srcset'])->pluck('width')->all())->toBe([480, 960])
        ->and($image['src'])->toBe($image['srcset'][1]['url'])
        ->and($image['blur_data_url'])->toStartWith('data:image/webp;base64,');
});

it('returns null without media', function () {
    expect(ImagePresenter::present(null, 'x'))->toBeNull();
});
