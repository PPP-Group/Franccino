<?php

use App\Models\Page;

it('returns a page with resolved blocks in the requested locale', function () {
    Page::factory()->create([
        'key' => 'factory',
        'title' => ['pt' => 'A fábrica', 'en' => 'The factory'],
        'intro' => ['pt' => 'Introdução', 'en' => 'Introduction'],
        'content' => [
            ['type' => 'rich_text', 'data' => ['body' => ['pt' => '<p>Texto <script>x</script></p>', 'en' => '<p>Text</p>']]],
        ],
    ]);

    $response = $this->getJson('/api/v1/pages/factory?locale=en')->assertOk();

    $response->assertJsonStructure(['data' => ['key', 'title', 'intro', 'content', 'cover', 'seo']])
        ->assertJsonPath('data.key', 'factory')
        ->assertJsonPath('data.title', 'The factory')
        ->assertJsonPath('data.intro', 'Introduction')
        ->assertJsonPath('data.content.0.data.body', '<p>Text</p>');
});

it('returns 404 for an unknown page key', function () {
    $this->getJson('/api/v1/pages/unknown')->assertNotFound();
});

it('returns 404 for an unpublished page', function () {
    Page::factory()->create(['key' => 'oculta', 'is_published' => false]);

    $this->getJson('/api/v1/pages/oculta')->assertNotFound();
});
