<?php

use App\Models\Banner;
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

it('replaces the photo of a home banner by its position in the carousel', function () {
    config(['franccino.import.token' => 'abc123']);
    $first = Banner::factory()->create(['sort_order' => 1]);
    $second = Banner::factory()->create(['sort_order' => 2]);
    $auth = ['Authorization' => 'Bearer abc123'];

    $this->post('/api/import/media', [
        'target' => 'banner',
        'key' => '2',
        'collection' => 'image',
        'file' => UploadedFile::fake()->image('projeto.jpg', 2560, 1440),
    ], $auth)->assertCreated();

    $this->post('/api/import/media', [
        'target' => 'banner',
        'key' => '9',
        'collection' => 'image',
        'file' => UploadedFile::fake()->image('x.jpg'),
    ], $auth)->assertNotFound();

    expect($second->refresh()->getMedia('image'))->toHaveCount(1)
        ->and($first->refresh()->getMedia('image'))->toHaveCount(0);
});

it('queues a covers or content list', function () {
    config(['franccino.import.token' => 'abc123']);
    Artisan::partialMock()->shouldReceive('queue')->once()
        ->withArgs(fn (string $command, array $args) => $command === 'franccino:content:apply' && str_ends_with($args['file'], 'teste-lista.json'));

    $this->postJson('/api/import/content', ['version' => 'teste-lista', 'products' => []], ['Authorization' => 'Bearer abc123'])
        ->assertStatus(202)
        ->assertJsonPath('data.queued', 'franccino:content:apply');
});

it('queues a translations list', function () {
    config(['franccino.import.token' => 'abc123']);
    Artisan::partialMock()->shouldReceive('queue')->once()
        ->withArgs(fn (string $command, array $args) => $command === 'franccino:translations:import' && str_ends_with($args['file'], 'en-teste.json'));

    $this->postJson('/api/import/translations', ['version' => 'en-teste', 'items' => [['model' => 'product', 'field' => 'tagline', 'pt' => 'Olá', 'en' => 'Hello']]], ['Authorization' => 'Bearer abc123'])
        ->assertStatus(202)
        ->assertJsonPath('data.queued', 'franccino:translations:import');
});
