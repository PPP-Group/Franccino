<?php

use App\Console\Commands\ApplyLegacyContent;
use App\Models\Client;
use App\Models\Page;
use App\Models\Product;
use App\Models\Project;
use App\Models\Scene;
use App\Models\Store;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('media');
    config([
        'media-library.queue_conversions_by_default' => false,
        'franccino.wordpress.cache' => storage_path('framework/testing/wordpress-cache'),
    ]);
    $this->list = storage_path('framework/testing/conteudo.json');
    File::ensureDirectoryExists(dirname($this->list));
    $photo = UploadedFile::fake()->image('foto.jpg', 400, 300)->getContent();
    Http::fake(['franccino.com.br/*' => Http::response($photo, 200, ['Content-Type' => 'image/jpeg'])]);
});

afterEach(function () {
    File::delete([$this->list, ApplyLegacyContent::marker('teste')]);
    File::deleteDirectory(storage_path('framework/testing/wordpress-cache'));
});

it('fills only what is empty with the old site content, once', function () {
    $empty = Product::factory()->create(['slug' => ['pt' => 'mesa-joey'], 'description' => ['pt' => ''], 'legacy_wp_id' => 77]);
    $edited = publishedProduct(['tagline' => ['pt' => 'Já tem']]);
    $store = Store::factory()->create(['name' => 'Franccino Brasília']);
    $logo = Client::factory()->create(['name' => 'Clara Resorts']);
    $project = Project::factory()->create(['slug' => ['pt' => 'fazenda-boa-vista-jhsf', 'en' => 'fazenda-boa-vista']]);
    $factory = Page::factory()->create(['key' => 'factory', 'content' => [['type' => 'rich_text', 'data' => ['body' => ['pt' => '<p>Quem somos</p>']]]]]);
    $chaise = Product::factory()->create(['slug' => ['pt' => 'chaise-madri']]);
    $url = 'https://franccino.com.br/wp-content/uploads/2025/03/';

    File::put($this->list, json_encode([
        'version' => 'teste',
        'products' => [
            ['wp_id' => 77, 'slug' => 'outro-slug', 'tagline' => 'Entre peso e leveza', 'description' => '<p>A Mesa Joey nasce...</p>'],
            ['slug' => 'cadeira-aura', 'tagline' => 'Não entra', 'description' => '<p>Não entra</p>'],
        ],
        'stores' => [['name' => 'FRANCCINO BRASÍLIA', 'image' => $url.'loja.webp'], ['name' => 'Sem loja', 'image' => $url.'x.webp']],
        'projects' => [['slug' => 'fazenda-boa-vista-jhsf', 'gallery' => [$url.'Boa-Vista-3.webp']]],
        'clients' => [['name' => 'Clara Resorts', 'logo' => $url.'Clara-Resorts.webp']],
        'pages' => [['key' => 'factory', 'blocks' => [
            ['type' => 'rich_text', 'data' => ['body' => ['pt' => '<p>Duplicado</p>']]],
            ['type' => 'gallery', 'data' => ['images' => [$url.'institucional.png'], 'caption' => null]],
        ]]],
        'scenes' => [[
            'title' => ['pt' => 'Piscina'],
            'project' => 'fazenda-boa-vista-jhsf',
            'image' => $url.'Boa-Vista-2.webp',
            'hotspots' => [['product' => 'chaise-madri', 'x' => 38, 'y' => 56], ['product' => 'nao-existe', 'x' => 1, 'y' => 1]],
        ]],
    ]));

    $this->artisan('franccino:content:apply', ['file' => $this->list, '--dry-run' => true])->assertSuccessful();
    expect($empty->refresh()->getTranslation('description', 'pt', false))->toBe('')
        ->and(File::exists(ApplyLegacyContent::marker('teste')))->toBeFalse();

    $this->artisan('franccino:content:apply', ['file' => $this->list])->assertSuccessful();

    $empty->refresh();
    expect($empty->getTranslation('tagline', 'pt', false))->toBe('Entre peso e leveza')
        ->and($empty->getTranslation('description', 'pt', false))->toBe('<p>A Mesa Joey nasce...</p>')
        ->and($edited->refresh()->getTranslation('tagline', 'pt', false))->toBe('Já tem')
        ->and($edited->getTranslation('description', 'pt', false))->not->toContain('Não entra')
        ->and($store->refresh()->getMedia('image'))->toHaveCount(1)
        ->and($logo->refresh()->getMedia('logo'))->toHaveCount(1)
        ->and($project->refresh()->getMedia('gallery'))->toHaveCount(1);

    $content = $factory->refresh()->content;
    expect(array_column($content, 'type'))->toBe(['rich_text', 'gallery'])
        ->and($content[1]['data']['images'])->toHaveCount(1);
    Storage::disk('media')->assertExists($content[1]['data']['images'][0]);

    $scene = Scene::query()->where('project_id', $project->id)->sole();
    expect($scene->is_published)->toBeTrue()
        ->and($scene->getMedia('image'))->toHaveCount(1)
        ->and($scene->hotspots->pluck('product_id')->all())->toBe([$chaise->id]);

    // Second start of the container: the marker skips the list.
    $this->artisan('franccino:content:apply', ['file' => $this->list])->assertSuccessful();
    expect($project->refresh()->getMedia('gallery'))->toHaveCount(1)
        ->and(Scene::query()->count())->toBe(1);
});

it('creates the stores the database does not have and adds photos to an existing gallery', function () {
    Store::factory()->create(['name' => 'Franccino Curitiba']);
    $factory = Page::factory()->create(['key' => 'factory', 'content' => [['type' => 'gallery', 'data' => ['images' => ['pages/abc-ja-tem.webp'], 'caption' => null]]]]);
    $url = 'https://franccino.com.br/wp-content/uploads/2026/03/';

    File::put($this->list, json_encode([
        'version' => 'teste',
        'new_stores' => [
            ['name' => 'FRANCCINO CURITIBA', 'type' => 'exclusive', 'address' => 'Rua A, 1', 'city' => 'Curitiba', 'state' => 'PR'],
            ['legacy_wp_id' => 9166, 'name' => 'Franttone', 'type' => 'reseller', 'address' => 'Av. Princesa do Sul, 494', 'city' => 'Varginha', 'state' => 'MG', 'latitude' => -21.57, 'longitude' => -45.44, 'image' => $url.'fachada.webp'],
        ],
        'pages' => [['key' => 'factory', 'blocks' => [
            ['type' => 'gallery', 'merge' => true, 'data' => ['images' => [$url.'ja-tem.webp', $url.'nova.webp'], 'caption' => null]],
        ]]],
    ]));

    $this->artisan('franccino:content:apply', ['file' => $this->list])->assertSuccessful();

    $new = Store::query()->where('name', 'Franttone')->sole();
    expect(Store::query()->count())->toBe(2)
        ->and($new->is_published)->toBeTrue()
        ->and($new->getMedia('image'))->toHaveCount(1);

    $images = $factory->refresh()->content[0]['data']['images'];
    expect($images)->toHaveCount(2)
        ->and($images[0])->toBe('pages/abc-ja-tem.webp')
        ->and($images[1])->toEndWith('-nova.webp');
});
