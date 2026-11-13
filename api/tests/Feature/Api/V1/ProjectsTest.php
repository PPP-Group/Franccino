<?php

use App\Models\Product;
use App\Models\Project;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('lists published projects paginated with the contract shape', function () {
    Project::factory()->create(['type' => 'residential']);
    Project::factory()->create(['is_published' => false]);

    $response = $this->getJson('/api/v1/projects')->assertOk();

    $response->assertJsonStructure([
        'data' => ['*' => ['id', 'slug', 'type', 'title', 'client_name', 'location', 'year', 'summary', 'cover']],
        'links' => ['first', 'last', 'prev', 'next'],
        'meta' => ['current_page', 'last_page', 'per_page', 'total'],
    ]);
});

it('filters projects by type', function () {
    Project::factory()->create(['type' => 'residential']);
    Project::factory()->count(2)->create(['type' => 'corporate']);

    $response = $this->getJson('/api/v1/projects?type=corporate')->assertOk();

    expect($response->json('meta.total'))->toBe(2);
});

it('shows a project by its localized slug with architect, description, gallery, products, seo and slugs', function () {
    $indoor = area('indoor');
    $project = Project::factory()->create([
        'title' => ['pt' => 'Casa Inhotim', 'en' => 'Inhotim House'],
        'slug' => ['pt' => 'casa-inhotim', 'en' => 'inhotim-house'],
        'architect' => 'Estúdio X',
        'description' => ['pt' => '<p>Texto <script>x</script></p>', 'en' => '<p>Text</p>'],
    ]);

    $product = Product::factory()->for($indoor)->create(['is_published' => true]);
    $project->products()->attach($product);

    $response = $this->getJson('/api/v1/projects/inhotim-house?locale=en')->assertOk();

    $response->assertJsonPath('data.title', 'Inhotim House')
        ->assertJsonPath('data.architect', 'Estúdio X')
        ->assertJsonPath('data.description', '<p>Text</p>')
        ->assertJsonPath('data.slugs', ['pt' => 'casa-inhotim', 'en' => 'inhotim-house'])
        ->assertJsonPath('data.video', null)
        ->assertJsonCount(1, 'data.products');
});

it('shows the page video of a project with its cover', function () {
    Storage::fake('media');
    config(['media-library.queue_conversions_by_default' => false]);
    $project = Project::factory()->create(['slug' => ['pt' => 'clara-arte', 'en' => 'clara-arte']]);
    $project->addMedia(UploadedFile::fake()->createWithContent('clara.mp4', "\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom".str_repeat("\x00", 2048)))->toMediaCollection('video');
    $project->addMedia(UploadedFile::fake()->image('capa.jpg', 1080, 1920))->toMediaCollection('video_poster');

    $video = $this->getJson('/api/v1/projects/clara-arte')->assertOk()->json('data.video');

    // No image sizes for a video: the server cannot grab frames, and the small preview ran during the upload (500).
    $media = $project->getFirstMedia('video');
    $project->mediaConversions = [];
    $project->registerMediaConversions($media);
    expect($project->mediaConversions)->toBe([]);

    expect($video['url'])->toEndWith('clara.mp4')
        ->and($video['poster']['width'])->toBe(1080)
        ->and($video['poster']['height'])->toBe(1920);
});

it('returns 404 for an unpublished project', function () {
    Project::factory()->create(['slug' => ['pt' => 'oculto', 'en' => 'hidden'], 'is_published' => false]);

    $this->getJson('/api/v1/projects/oculto')->assertNotFound();
});

it('shows the featured piece chosen in the panel, only when published (retorno de 12/11/2026)', function () {
    $indoor = area('indoor');
    $piece = Product::factory()->for($indoor)->create(['slug' => ['pt' => 'poltrona-derby', 'en' => 'derby-armchair']]);
    $project = Project::factory()->create([
        'slug' => ['pt' => 'boa-vista', 'en' => 'boa-vista'],
        'featured_product_id' => $piece->id,
    ]);

    $this->getJson('/api/v1/projects/boa-vista')->assertOk()->assertJsonPath('data.featured_product.slug', 'poltrona-derby');

    $piece->update(['is_published' => false]);
    $this->getJson('/api/v1/projects/boa-vista')->assertOk()->assertJsonPath('data.featured_product', null);
    expect($project->refresh()->featured_product_id)->toBe($piece->id);
});
