<?php

use App\Models\Collection;
use App\Models\Designer;
use App\Models\Launch;
use App\Models\Page;
use App\Models\Project;

it('flags the english detail pages whose texts came back in portuguese', function (string $model, string $path, array $translated, array $portugueseOnly) {
    $record = $model::factory()->create(['is_published' => true, ...$translated]);

    $this->getJson($path.'?locale=en')->assertOk()->assertJsonPath('data.locale_fallback', false);
    $this->getJson($path)->assertJsonPath('data.locale_fallback', false);

    $record->update($portugueseOnly);
    $this->getJson($path.'?locale=en')->assertJsonPath('data.locale_fallback', true);
    $this->getJson($path)->assertJsonPath('data.locale_fallback', false);
})->with([
    'collection' => [Collection::class, '/api/v1/collections/tempo', ['slug' => ['pt' => 'tempo', 'en' => 'tempo'], 'name' => ['pt' => 'Tempo', 'en' => 'Time'], 'summary' => null, 'description' => null], ['description' => ['pt' => '<p>Peças para durar.</p>']]],
    'designer' => [Designer::class, '/api/v1/designers/daniela-ferro', ['slug' => 'daniela-ferro', 'short_bio' => ['pt' => 'Designer', 'en' => 'Designer'], 'bio' => null], ['bio' => ['pt' => '<p>Mineira.</p>']]],
    'launch' => [Launch::class, '/api/v1/launches/salao-2026', ['slug' => ['pt' => 'salao-2026', 'en' => 'salao-2026'], 'title' => ['pt' => 'Salão', 'en' => 'Fair'], 'summary' => null, 'description' => null], ['summary' => ['pt' => 'Novas peças.']]],
    'project' => [Project::class, '/api/v1/projects/clara-arte', ['slug' => ['pt' => 'clara-arte', 'en' => 'clara-arte'], 'title' => ['pt' => 'Clara Arte', 'en' => 'Clara Arte'], 'summary' => null, 'description' => null], ['description' => ['pt' => '<p>Resort.</p>']]],
]);

it('flags a page whose introduction has no english version', function () {
    Page::factory()->create(['key' => 'factory', 'title' => ['pt' => 'Fábrica', 'en' => 'Factory'], 'intro' => ['pt' => 'Desde 1990.']]);

    $this->getJson('/api/v1/pages/factory?locale=en')->assertJsonPath('data.locale_fallback', true);
    $this->getJson('/api/v1/pages/factory')->assertJsonPath('data.locale_fallback', false);
});
