<?php

use App\Models\Collection;
use App\Models\Designer;
use App\Models\Launch;
use App\Models\Product;
use App\Models\Store;
use Database\Seeders\DemoContentSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    config(['franccino.demo.image_cache' => storage_path('framework/testing/demo-cache')]);
});

afterEach(function () {
    File::deleteDirectory(storage_path('framework/testing/demo-cache'));
});

it('seeds real demo content idempotently with cached images', function () {
    Storage::fake('media');
    // Conversions stay queued (not run): generating every WebP width for ~80 images took over two minutes.
    Queue::fake();
    $jpeg = UploadedFile::fake()->image('x.jpg', 800, 600)->getContent();
    Http::fake(['franccino.com.br/*' => Http::response($jpeg, 200, ['Content-Type' => 'image/jpeg'])]);

    $this->seed(DemoContentSeeder::class);
    $this->seed(DemoContentSeeder::class);

    expect(Designer::count())->toBe(16)
        ->and(Store::count())->toBe(12)
        ->and(Product::count())->toBeGreaterThanOrEqual(40)
        ->and(Product::first()->getFirstMedia('cover'))->not->toBeNull();
});

it('links the current launch, collections and designers, and keeps products searchable', function () {
    Http::fake(['franccino.com.br/*' => Http::response('', 404)]);

    $this->seed(DemoContentSeeder::class);

    $launch = Launch::sole();
    expect($launch->year)->toBe((int) now()->year)
        ->and($launch->products()->count())->toBe(15)
        ->and(Collection::where('slug->pt', 'colecao-tempo')->sole()->products()->count())->toBe(15)
        ->and(Product::whereNotNull('designer_id')->count())->toBe(Product::count())
        ->and(Product::whereNull('search_text')->count())->toBe(0);
});

it('carries on without images when a download fails', function () {
    Http::fake(['franccino.com.br/*' => Http::response('', 500)]);

    $this->seed(DemoContentSeeder::class);

    expect(Product::count())->toBeGreaterThanOrEqual(40)
        ->and(Product::first()->getFirstMedia('cover'))->toBeNull();
});
