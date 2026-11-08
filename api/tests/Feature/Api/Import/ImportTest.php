<?php

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('media');
    config(['media-library.queue_conversions_by_default' => false]);
});

it('does not exist without the token variable and refuses a wrong token', function () {
    config(['franccino.import.token' => null]);
    $this->postJson('/api/import/media')->assertNotFound();

    config(['franccino.import.token' => 'abc123']);
    $this->postJson('/api/import/media', [], ['Authorization' => 'Bearer errado'])->assertUnauthorized();
});

it('adds a photo to the listed collection of a product', function () {
    config(['franccino.import.token' => 'abc123']);
    $product = publishedProduct();
    $auth = ['Authorization' => 'Bearer abc123'];

    $this->post('/api/import/media', [
        'target' => 'product',
        'key' => 'cadeira-aura',
        'collection' => 'cutout',
        'file' => UploadedFile::fake()->image('aura.png', 400, 400),
    ], $auth)->assertCreated()->assertJsonPath('data.collection', 'cutout');

    $this->post('/api/import/media', [
        'target' => 'product',
        'key' => 'cadeira-aura',
        'collection' => 'model_3d',
        'file' => UploadedFile::fake()->image('x.png'),
    ], $auth)->assertStatus(422);

    $this->post('/api/import/media', [
        'target' => 'product',
        'key' => 'nao-existe',
        'collection' => 'gallery',
        'file' => UploadedFile::fake()->image('x.png'),
    ], $auth)->assertNotFound();

    expect($product->refresh()->getMedia('cutout'))->toHaveCount(1)
        ->and(Product::query()->count())->toBe(1);
});

it('queues a covers or content list', function () {
    config(['franccino.import.token' => 'abc123']);
    Artisan::partialMock()->shouldReceive('queue')->once()
        ->withArgs(fn (string $command, array $args) => $command === 'franccino:content:apply' && str_ends_with($args['file'], 'teste-lista.json'));

    $this->postJson('/api/import/content', ['version' => 'teste-lista', 'products' => []], ['Authorization' => 'Bearer abc123'])
        ->assertStatus(202)
        ->assertJsonPath('data.queued', 'franccino:content:apply');
});
