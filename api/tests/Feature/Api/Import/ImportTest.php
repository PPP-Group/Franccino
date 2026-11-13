<?php

use App\Enums\ProductFileType;
use App\Models\Banner;
use App\Models\Designer;
use App\Models\Page;
use App\Models\Product;
use App\Models\Project;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('media');
    Storage::fake('downloads');
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

it('does not add the same source twice to a gallery', function () {
    config(['franccino.import.token' => 'abc123']);
    $product = publishedProduct();
    $send = fn () => $this->post('/api/import/media', [
        'target' => 'product',
        'key' => 'cadeira-aura',
        'collection' => 'gallery',
        'source' => 'drive:abc',
        'file' => UploadedFile::fake()->image('aura.jpg', 800, 600),
    ], ['Authorization' => 'Bearer abc123']);

    $send()->assertCreated();
    $send()->assertOk()->assertJsonPath('data.skipped', true);

    expect($product->refresh()->getMedia('gallery'))->toHaveCount(1);
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

it('adds a technical file to a product and replaces it when the same file comes again', function () {
    config(['franccino.import.token' => 'abc123']);
    $product = publishedProduct();
    $auth = ['Authorization' => 'Bearer abc123'];

    $this->post('/api/import/files', [
        'target' => 'product',
        'key' => 'cadeira-aura',
        'type' => 'block_3d',
        'title' => 'Bloco 3D (SketchUp)',
        'title_en' => '3D block (SketchUp)',
        'file' => UploadedFile::fake()->create('CADEIRA AURA.skp', 2048, 'application/octet-stream'),
    ], $auth)->assertCreated()->assertJsonPath('data.replaced', false);

    $file = $product->files()->sole();
    $first = $file->path;
    expect($file->type)->toBe(ProductFileType::Block3d)
        ->and($file->format)->toBe('SKP')
        ->and($file->is_published)->toBeTrue()
        ->and($file->getTranslation('title', 'en'))->toBe('3D block (SketchUp)')
        ->and($first)->toEndWith('.skp');
    Storage::disk('downloads')->assertExists($first);

    $this->post('/api/import/files', [
        'target' => 'product',
        'key' => 'cadeira-aura',
        'type' => 'block_3d',
        'title' => 'Bloco 3D (SketchUp)',
        'file' => UploadedFile::fake()->create('CADEIRA AURA.skp', 1024, 'application/octet-stream'),
    ], $auth)->assertOk()->assertJsonPath('data.replaced', true);

    expect($product->files()->count())->toBe(1);
    Storage::disk('downloads')->assertMissing($first);
});

it('refuses a technical file of a type, extension or owner it does not know', function () {
    config(['franccino.import.token' => 'abc123']);
    publishedProduct();
    $auth = ['Authorization' => 'Bearer abc123'];
    $send = fn (array $data) => $this->post('/api/import/files', $data + [
        'target' => 'product',
        'key' => 'cadeira-aura',
        'type' => 'block_2d',
        'title' => 'Bloco 2D',
        'file' => UploadedFile::fake()->create('aura.dwg', 100, 'application/octet-stream'),
    ], $auth);

    $send(['type' => 'video'])->assertStatus(422);
    $send(['file' => UploadedFile::fake()->create('aura.html', 1, 'text/html')])->assertStatus(422);
    $send(['target' => 'store'])->assertStatus(422);
    $send(['key' => 'nao-existe'])->assertNotFound();
    $send([])->assertCreated();
});

it('adds a designer portrait and a photo to the gallery of a page', function () {
    config(['franccino.import.token' => 'abc123']);
    $designer = Designer::factory()->create(['slug' => 'andrea-zanocchi']);
    $page = Page::factory()->create(['key' => 'factory', 'content' => [['type' => 'rich_text', 'data' => ['body' => ['pt' => '<p>Oi</p>']]]]]);
    $auth = ['Authorization' => 'Bearer abc123'];

    $this->post('/api/import/media', [
        'target' => 'designer',
        'key' => 'andrea-zanocchi',
        'collection' => 'portrait',
        'file' => UploadedFile::fake()->image('andrea.jpg', 640, 960),
    ], $auth)->assertCreated();
    expect($designer->refresh()->getMedia('portrait'))->toHaveCount(1);

    $this->post('/api/import/media', [
        'target' => 'designer',
        'key' => 'andrea-zanocchi',
        'collection' => 'signature',
        'file' => UploadedFile::fake()->image('assinatura.png', 600, 160),
    ], $auth)->assertCreated();
    expect($designer->refresh()->getMedia('signature'))->toHaveCount(1);

    $photo = fn () => UploadedFile::fake()->image('Fábrica Metal 01.jpg', 1600, 1200);
    $this->post('/api/import/media', ['target' => 'page', 'key' => 'factory', 'collection' => 'gallery', 'file' => $photo()], $auth)
        ->assertCreated();
    $this->post('/api/import/media', ['target' => 'page', 'key' => 'factory', 'collection' => 'gallery', 'file' => $photo()], $auth)
        ->assertOk()->assertJsonPath('data.skipped', true);

    $content = $page->refresh()->content;
    expect($content)->toHaveCount(2)
        ->and($content[1]['type'])->toBe('gallery')
        ->and($content[1]['data']['images'])->toHaveCount(1)
        ->and($content[1]['data']['images'][0])->toStartWith('pages/')->toEndWith('-fabrica-metal-01.jpg');
    Storage::disk('media')->assertExists($content[1]['data']['images'][0]);
});

it('takes the page video of a project and photos for a named gallery of a page', function () {
    config(['franccino.import.token' => 'abc123']);
    $project = Project::factory()->create(['slug' => ['pt' => 'clara-arte']]);
    $page = Page::factory()->create(['key' => 'factory', 'content' => [['type' => 'gallery', 'data' => ['images' => ['pages/a-x.jpg'], 'caption' => []]]]]);
    $auth = ['Authorization' => 'Bearer abc123'];

    $this->post('/api/import/media', [
        'target' => 'project',
        'key' => 'clara-arte',
        'collection' => 'video',
        'file' => UploadedFile::fake()->createWithContent('clara.mp4', "\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom".str_repeat("\x00", 2048))->mimeType('video/mp4'),
    ], $auth)->assertCreated();
    $this->post('/api/import/media', [
        'target' => 'project',
        'key' => 'clara-arte',
        'collection' => 'video',
        'file' => UploadedFile::fake()->image('nao-e-video.jpg'),
    ], $auth)->assertStatus(422);
    expect($project->refresh()->getMedia('video'))->toHaveCount(1);

    $this->post('/api/import/media', [
        'target' => 'page',
        'key' => 'factory',
        'collection' => 'gallery',
        'caption' => 'Peças em produção',
        'caption_en' => 'Pieces being made',
        'file' => UploadedFile::fake()->image('sopro.jpg', 1600, 1200),
    ], $auth)->assertCreated();

    $content = $page->refresh()->content;
    expect($content)->toHaveCount(2)
        ->and($content[0]['data']['images'])->toHaveCount(1)
        ->and($content[1]['data']['caption'])->toEqual(['pt' => 'Peças em produção', 'en' => 'Pieces being made'])
        ->and($content[1]['data']['images'])->toHaveCount(1);
});

it('swaps a gallery photo for another version in the same place', function () {
    config(['franccino.import.token' => 'abc123']);
    $product = publishedProduct();
    $send = fn (string $name, array $extra = []) => $this->post('/api/import/media', $extra + [
        'target' => 'product',
        'key' => 'cadeira-aura',
        'collection' => 'gallery',
        'source' => "drive:{$name}",
        'file' => UploadedFile::fake()->image("{$name}.jpg", 800, 600),
    ], ['Authorization' => 'Bearer abc123']);

    $send('original')->assertCreated();
    $send('outra')->assertCreated();
    $send('editada', ['replaces' => 'drive:original'])->assertCreated();

    expect($product->refresh()->getMedia('gallery')->map(fn ($media) => $media->getCustomProperty('legacy_url'))->all())
        ->toBe(['drive:editada', 'drive:outra']);
});

it('adds a film to a page as a video block, keeping the YouTube one', function () {
    config(['franccino.import.token' => 'abc123']);
    $page = Page::factory()->create(['key' => 'factory', 'content' => [['type' => 'video', 'data' => ['url' => 'https://youtu.be/x', 'title' => ['pt' => 'Conheça']]]]]);
    $send = fn () => $this->post('/api/import/media', [
        'target' => 'page',
        'key' => 'factory',
        'collection' => 'video',
        'title' => 'Marcenaria',
        'file' => UploadedFile::fake()->createWithContent('fabrica.mp4', "\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom".str_repeat("\x00", 2048))->mimeType('video/mp4'),
        'poster' => UploadedFile::fake()->image('capa.jpg', 1920, 1080),
    ], ['Authorization' => 'Bearer abc123']);

    $send()->assertCreated()->assertJsonPath('data.replaced', false);
    $send()->assertCreated()->assertJsonPath('data.replaced', true);

    $content = $page->refresh()->content;
    expect($content)->toHaveCount(2)
        ->and($content[0]['data']['url'])->toBe('https://youtu.be/x')
        ->and($content[1]['data']['file'])->toStartWith('videos/')
        ->and($content[1]['data']['poster'])->toStartWith('pages/');
});

it('removes only the listed photos of that record and collection', function () {
    config(['franccino.import.token' => 'abc123']);
    $product = publishedProduct();
    $auth = ['Authorization' => 'Bearer abc123'];
    $keep = $product->addMedia(UploadedFile::fake()->image('a.jpg'))->toMediaCollection('gallery');
    $copy = $product->addMedia(UploadedFile::fake()->image('b.jpg'))->toMediaCollection('gallery');
    $foreign = $product->addMedia(UploadedFile::fake()->image('c.jpg'))->toMediaCollection('cover');

    $this->postJson('/api/import/media/remove', [
        'target' => 'product',
        'key' => 'cadeira-aura',
        'collection' => 'gallery',
        'ids' => [$copy->id, $foreign->id],
    ], $auth)->assertOk()
        ->assertJsonPath('data.removed', [$copy->id])
        ->assertJsonPath('data.not_found', [$foreign->id]);

    expect($product->refresh()->getMedia('gallery')->pluck('id')->all())->toBe([$keep->id])
        ->and($product->getMedia('cover'))->toHaveCount(1);

    $this->postJson('/api/import/media/remove', [
        'target' => 'product',
        'key' => 'cadeira-aura',
        'collection' => 'model_3d',
        'ids' => [$keep->id],
    ], $auth)->assertStatus(422);
});

it('takes the 3D model of a product as a GLB on the private disk', function () {
    config(['franccino.import.token' => 'abc123']);
    $product = publishedProduct();
    $auth = ['Authorization' => 'Bearer abc123'];
    $glb = UploadedFile::fake()->createWithContent('aura.glb', "glTF\x02\x00\x00\x00".str_repeat("\x00", 64));

    $this->post('/api/import/media', [
        'target' => 'product',
        'key' => 'cadeira-aura',
        'collection' => 'model_3d',
        'file' => $glb,
    ], $auth)->assertCreated()->assertJsonPath('data.collection', 'model_3d');

    $media = $product->refresh()->getFirstMedia('model_3d');
    expect($media)->not->toBeNull()
        ->and($media->disk)->toBe('downloads');
    Storage::disk('downloads')->assertExists($media->getPathRelativeToRoot());
});
