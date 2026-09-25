<?php

use App\Enums\ProjectType;
use App\Filament\Resources\Banners\Pages\CreateBanner;
use App\Filament\Resources\Banners\Pages\ListBanners;
use App\Filament\Resources\Clients\Pages\CreateClient;
use App\Filament\Resources\Clients\Pages\ListClients;
use App\Filament\Resources\Collections\Pages\CreateCollection;
use App\Filament\Resources\Collections\Pages\ListCollections;
use App\Filament\Resources\Designers\Pages\CreateDesigner;
use App\Filament\Resources\Designers\Pages\ListDesigners;
use App\Filament\Resources\Launches\Pages\CreateLaunch;
use App\Filament\Resources\Launches\Pages\ListLaunches;
use App\Filament\Resources\Projects\Pages\CreateProject;
use App\Filament\Resources\Projects\Pages\ListProjects;
use App\Filament\Resources\Stores\Pages\CreateStore;
use App\Filament\Resources\Stores\Pages\ListStores;
use App\Models\Banner;
use App\Models\Client;
use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Launch;
use App\Models\Project;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Storage::fake('media');
    $this->actingAs(User::factory()->editor()->create());
});

// Collections

it('lists collections', function () {
    $collections = CollectionModel::factory()->count(3)->create();

    livewire(ListCollections::class)->assertCanSeeTableRecords($collections);
});

it('creates a collection in both languages', function () {
    livewire(CreateCollection::class)
        ->fillForm([
            'name' => ['pt' => 'Coleção Aurora', 'en' => 'Aurora Collection'],
            'slug' => ['pt' => 'colecao-aurora', 'en' => 'aurora-collection'],
            'summary' => ['pt' => 'Resumo', 'en' => 'Summary'],
            'description' => ['pt' => 'Descrição', 'en' => 'Description'],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $collection = CollectionModel::sole();

    expect($collection->getTranslation('name', 'en'))->toBe('Aurora Collection')
        ->and($collection->getTranslation('slug', 'pt'))->toBe('colecao-aurora');
});

// Designers

it('lists designers', function () {
    $designers = Designer::factory()->count(3)->create();

    livewire(ListDesigners::class)->assertCanSeeTableRecords($designers);
});

it('creates a designer in both languages', function () {
    livewire(CreateDesigner::class)
        ->fillForm([
            'name' => 'Ana Lima',
            'slug' => 'ana-lima',
            'short_bio' => ['pt' => 'Bio curta', 'en' => 'Short bio'],
            'bio' => ['pt' => 'Bio completa', 'en' => 'Full bio'],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $designer = Designer::sole();

    expect($designer->name)->toBe('Ana Lima')
        ->and($designer->getTranslation('short_bio', 'en'))->toBe('Short bio');
});

// Launches

it('lists launches', function () {
    $launches = Launch::factory()->count(3)->create();

    livewire(ListLaunches::class)->assertCanSeeTableRecords($launches);
});

it('creates a launch in both languages', function () {
    livewire(CreateLaunch::class)
        ->fillForm([
            'title' => ['pt' => 'Lançamento Aura', 'en' => 'Aura Launch'],
            'slug' => ['pt' => 'lancamento-aura', 'en' => 'aura-launch'],
            'summary' => ['pt' => 'Resumo', 'en' => 'Summary'],
            'description' => ['pt' => 'Descrição', 'en' => 'Description'],
            'year' => 2026,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $launch = Launch::sole();

    expect($launch->getTranslation('title', 'en'))->toBe('Aura Launch')
        ->and($launch->year)->toBe(2026);
});

// Projects

it('lists projects', function () {
    $projects = Project::factory()->count(3)->create();

    livewire(ListProjects::class)->assertCanSeeTableRecords($projects);
});

it('creates a project in both languages', function () {
    livewire(CreateProject::class)
        ->fillForm([
            'type' => 'residential',
            'title' => ['pt' => 'Projeto Aurora', 'en' => 'Aurora Project'],
            'slug' => ['pt' => 'projeto-aurora', 'en' => 'aurora-project'],
            'summary' => ['pt' => 'Resumo', 'en' => 'Summary'],
            'description' => ['pt' => 'Descrição', 'en' => 'Description'],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $project = Project::sole();

    expect($project->getTranslation('title', 'en'))->toBe('Aurora Project')
        ->and($project->type)->toBe(ProjectType::Residential);
});

// Clients

it('lists clients', function () {
    $clients = Client::factory()->count(3)->create();

    livewire(ListClients::class)->assertCanSeeTableRecords($clients);
});

it('creates a client', function () {
    livewire(CreateClient::class)
        ->fillForm([
            'name' => 'Studio Aurora',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Client::sole())->name->toBe('Studio Aurora');
});

// Stores

it('lists stores', function () {
    $stores = Store::factory()->count(3)->create();

    livewire(ListStores::class)->assertCanSeeTableRecords($stores);
});

it('creates a store', function () {
    livewire(CreateStore::class)
        ->fillForm([
            'name' => 'Loja Aurora',
            'type' => 'exclusive',
            'address' => 'Rua das Flores, 100',
            'city' => 'Belo Horizonte',
            'state' => 'MG',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $store = Store::sole();

    expect($store->name)->toBe('Loja Aurora')
        ->and($store->state)->toBe('MG');
});

it('requires the store state to be a 2-letter code', function () {
    livewire(CreateStore::class)
        ->fillForm([
            'name' => 'Loja Aurora',
            'type' => 'exclusive',
            'address' => 'Rua das Flores, 100',
            'city' => 'Belo Horizonte',
            'state' => 'Minas Gerais',
        ])
        ->call('create')
        ->assertHasFormErrors(['state']);
});

// Banners

it('lists banners', function () {
    $banners = Banner::factory()->count(3)->create();

    livewire(ListBanners::class)->assertCanSeeTableRecords($banners);
});

it('creates a banner in both languages', function () {
    livewire(CreateBanner::class)
        ->fillForm([
            'placement' => 'home_hero',
            'title' => ['pt' => 'Novidades', 'en' => 'What is new'],
            'image' => UploadedFile::fake()->image('banner.jpg', 1600, 900),
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $banner = Banner::sole();

    expect($banner->getTranslation('title', 'en'))->toBe('What is new');
});
