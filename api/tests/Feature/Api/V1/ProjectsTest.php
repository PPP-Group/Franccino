<?php

use App\Models\Product;
use App\Models\Project;

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
        ->assertJsonCount(1, 'data.products');
});

it('returns 404 for an unpublished project', function () {
    Project::factory()->create(['slug' => ['pt' => 'oculto', 'en' => 'hidden'], 'is_published' => false]);

    $this->getJson('/api/v1/projects/oculto')->assertNotFound();
});
