<?php

use App\Console\Commands\ApplyCovers;
use App\Console\Commands\RefreshImageConversions;
use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\Conversions\Jobs\PerformConversionsJob;

beforeEach(function () {
    Storage::fake('media');
    config(['media-library.queue_conversions_by_default' => false]);
    $this->list = storage_path('framework/testing/covers.json');
    File::ensureDirectoryExists(dirname($this->list));
});

afterEach(function () {
    File::delete([$this->list, ApplyCovers::marker('teste'), RefreshImageConversions::marker('teste')]);
});

function writeCoverList(string $path, array $covers): void
{
    File::put($path, json_encode(['version' => 'teste', 'covers' => $covers]));
}

it('turns the listed gallery photo into the cover, once', function () {
    $product = publishedProduct(['slug' => ['pt' => 'cadeira-aura']]);
    $product->addMedia(UploadedFile::fake()->image('frente.jpg', 800, 600))->toMediaCollection('cover');
    $product->addMedia(UploadedFile::fake()->image('frente-copia.jpg', 800, 600))->toMediaCollection('gallery');
    $diagonal = $product->addMedia(UploadedFile::fake()->image('diagonal.jpg', 800, 600))->toMediaCollection('gallery');
    writeCoverList($this->list, [['product' => 'cadeira-aura', 'media' => $diagonal->id]]);

    $this->artisan('franccino:covers:apply', ['file' => $this->list])->assertSuccessful();

    $product->refresh();
    expect($product->getFirstMedia('cover')->file_name)->toBe('diagonal.jpg')
        ->and($product->getMedia('cover'))->toHaveCount(1)
        ->and($product->getMedia('gallery')->pluck('file_name')->all())->toBe(['frente-copia.jpg'])
        ->and(File::exists(ApplyCovers::marker('teste')))->toBeTrue();

    // Second start of the container: the marker skips the list, nothing changes.
    $this->artisan('franccino:covers:apply', ['file' => $this->list])->assertSuccessful();
    expect($product->refresh()->getMedia('gallery'))->toHaveCount(1);
});

it('keeps the old cover as a gallery photo', function () {
    $product = publishedProduct(['slug' => ['pt' => 'cadeira-aura']]);
    $product->addMedia(UploadedFile::fake()->image('frente.jpg', 800, 600))->toMediaCollection('cover');
    $diagonal = $product->addMedia(UploadedFile::fake()->image('diagonal.jpg', 640, 480))->toMediaCollection('gallery');
    writeCoverList($this->list, [['product' => 'cadeira-aura', 'media' => $diagonal->id]]);

    $this->artisan('franccino:covers:apply', ['file' => $this->list])->assertSuccessful();

    $product->refresh();
    expect($product->getFirstMedia('cover')->file_name)->toBe('diagonal.jpg')
        ->and($product->getMedia('gallery')->pluck('file_name')->all())->toBe(['frente.jpg']);
});

it('skips a photo that is not in that product gallery and changes nothing on a dry run', function () {
    $product = publishedProduct(['slug' => ['pt' => 'cadeira-aura']]);
    $other = Product::factory()->create(['slug' => ['pt' => 'poltrona-maria', 'en' => 'maria-armchair']]);
    $cover = $product->addMedia(UploadedFile::fake()->image('frente.jpg', 800, 600))->toMediaCollection('cover');
    $foreign = $other->addMedia(UploadedFile::fake()->image('outra.jpg', 800, 600))->toMediaCollection('gallery');
    $own = $product->addMedia(UploadedFile::fake()->image('diagonal.jpg', 800, 600))->toMediaCollection('gallery');
    writeCoverList($this->list, [
        ['product' => 'cadeira-aura', 'media' => $foreign->id],
        ['product' => 'cadeira-aura', 'media' => $own->id],
        ['product' => 'nao-existe', 'media' => $own->id],
    ]);

    $this->artisan('franccino:covers:apply', ['file' => $this->list, '--dry-run' => true])->assertSuccessful();

    expect($product->refresh()->getFirstMedia('cover')->id)->toBe($cover->id)
        ->and(File::exists(ApplyCovers::marker('teste')))->toBeFalse();

    $this->artisan('franccino:covers:apply', ['file' => $this->list])->assertSuccessful();

    expect($product->refresh()->getFirstMedia('cover')->file_name)->toBe('diagonal.jpg')
        ->and($other->refresh()->getMedia('gallery'))->toHaveCount(1);
});

it('queues new resized versions of every photo once per version', function () {
    $product = publishedProduct();
    $product->addMedia(UploadedFile::fake()->image('capa.jpg', 800, 600))->toMediaCollection('cover');
    $product->addMedia(UploadedFile::fake()->image('galeria.jpg', 800, 600))->toMediaCollection('gallery');
    Queue::fake();

    $this->artisan('franccino:media:refresh', ['version' => 'teste'])->assertSuccessful();
    Queue::assertPushed(PerformConversionsJob::class, 2);

    $this->artisan('franccino:media:refresh', ['version' => 'teste'])->assertSuccessful();
    Queue::assertPushed(PerformConversionsJob::class, 2);
});
