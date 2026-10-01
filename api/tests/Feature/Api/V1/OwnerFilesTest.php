<?php

use App\Filament\RelationManagers\FilesRelationManager;
use App\Filament\Resources\Designers\Pages\EditDesigner;
use App\Models\Designer;
use App\Models\DownloadLog;
use App\Models\Launch;
use App\Models\ProductFile;
use App\Models\User;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

use function Pest\Livewire\livewire;

/** PPP-109: catalogs and presentations of a designer or a launch, with the same temporary link as products. */
beforeEach(function () {
    $root = storage_path('framework/testing/downloads');
    File::ensureDirectoryExists($root);
    config(['filesystems.disks.downloads.root' => $root]);
});

afterEach(function () {
    File::deleteDirectory(storage_path('framework/testing/downloads'));
});

function ownerFile(array $attributes): ProductFile
{
    return ProductFile::factory()->create($attributes + ['product_id' => null, 'type' => 'catalog', 'is_published' => true]);
}

it('lists only the published files of a designer and of a launch', function () {
    $designer = Designer::factory()->create(['slug' => 'daniela-ferro']);
    $catalog = ownerFile(['designer_id' => $designer->id, 'title' => ['pt' => 'Catálogo Daniela Ferro']]);
    ownerFile(['designer_id' => $designer->id, 'is_published' => false]);
    $launch = Launch::factory()->create(['slug' => ['pt' => 'lancamentos-2026']]);
    ownerFile(['launch_id' => $launch->id, 'type' => 'presentation', 'format' => 'PDF']);

    $this->getJson('/api/v1/designers/daniela-ferro')->assertOk()
        ->assertJsonCount(1, 'data.files')
        ->assertJsonPath('data.files.0.id', $catalog->id)
        ->assertJsonPath('data.files.0.type', 'catalog')
        ->assertJsonPath('data.files.0.title', 'Catálogo Daniela Ferro');

    $this->getJson('/api/v1/launches/lancamentos-2026')->assertOk()
        ->assertJsonCount(1, 'data.files')
        ->assertJsonPath('data.files.0.type', 'presentation');
});

it('links a designer file and logs the download without a product', function () {
    $file = ownerFile(['designer_id' => Designer::factory()->create()->id, 'path' => 'designers/catalogo.pdf']);
    Storage::disk('downloads')->put($file->path, 'pdf');

    $this->postJson("/api/v1/downloads/{$file->id}/link")->assertCreated()->assertJsonStructure(['data' => ['url', 'expires_at']]);

    expect(DownloadLog::sole())->product_file_id->toBe($file->id)->product_id->toBeNull();
});

it('does not link a file whose designer or launch is not published', function () {
    $designerFile = ownerFile(['designer_id' => Designer::factory()->create(['is_published' => false])->id]);
    $launchFile = ownerFile(['launch_id' => Launch::factory()->create(['is_published' => false])->id]);

    $this->postJson("/api/v1/downloads/{$designerFile->id}/link")->assertNotFound();
    $this->postJson("/api/v1/downloads/{$launchFile->id}/link")->assertNotFound();
});

it('reads the size of an uploaded file from the disk', function () {
    Storage::disk('downloads')->put('launches/apresentacao.pdf', str_repeat('x', 2048));

    $file = ownerFile(['launch_id' => Launch::factory()->create()->id, 'path' => 'launches/apresentacao.pdf', 'size' => null]);

    expect($file->size)->toBe(2048);
});

it('lists the designer files in the panel', function () {
    $this->actingAs(User::factory()->editor()->create());
    $designer = Designer::factory()->create();
    $file = ownerFile(['designer_id' => $designer->id]);
    $productFile = ProductFile::factory()->create();

    livewire(FilesRelationManager::class, ['ownerRecord' => $designer, 'pageClass' => EditDesigner::class])
        ->assertCanSeeTableRecords([$file])
        ->assertCanNotSeeTableRecords([$productFile]);
});
