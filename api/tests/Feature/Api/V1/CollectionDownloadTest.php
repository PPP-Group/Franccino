<?php

use App\Models\Collection;
use App\Models\DownloadLog;
use App\Models\Product;
use App\Models\ProductFile;
use App\Support\CollectionZip;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

afterEach(function () {
    File::deleteDirectory(storage_path('framework/testing/downloads'));
});

it('zips every published file of the collection pieces, one folder per piece, with the download sign-up', function () {
    useScratchDownloadsDisk();
    $collection = Collection::factory()->create(['is_published' => true]);
    $chair = publishedProduct(['name' => ['pt' => 'Cadeira Toé']]);
    $table = Product::factory()->for(area('indoor'))->create(['is_published' => true, 'name' => ['pt' => 'Mesa Rito']]);
    $collection->products()->attach([$chair->id, $table->id]);
    $files = [
        ProductFile::factory()->for($chair)->create(['path' => 'product-files/a.skp', 'original_name' => 'TOE.skp', 'is_published' => true]),
        ProductFile::factory()->for($table)->create(['path' => 'product-files/b.dwg', 'original_name' => 'RITO.dwg', 'is_published' => true]),
        ProductFile::factory()->for($table)->create(['path' => 'product-files/c.pdf', 'is_published' => false]),
    ];
    foreach ($files as $file) {
        Storage::disk('downloads')->put($file->path, 'conteudo '.$file->id);
    }
    $slug = $collection->getTranslation('slug', 'pt');

    $this->postJson("/api/v1/collections/{$slug}/download")->assertStatus(422);

    $token = downloadLeadToken();
    // A primeira chamada põe o zip na fila (síncrona nos testes) e responde que está preparando.
    $this->postJson("/api/v1/collections/{$slug}/download", ['lead_token' => $token])
        ->assertStatus(202)
        ->assertJsonPath('data.status', 'preparing');

    $response = $this->postJson("/api/v1/collections/{$slug}/download", ['lead_token' => $token])->assertCreated();
    expect($response->json('data.status'))->toBe('ready')
        ->and($response->json('data.url'))->toBeString();

    $path = CollectionZip::path($collection, CollectionZip::files($collection));
    $zip = new ZipArchive;
    $zip->open(Storage::disk('downloads')->path($path));
    $entries = collect(range(0, $zip->numFiles - 1))->map(fn ($index) => $zip->getNameIndex($index))->sort()->values()->all();
    $zip->close();

    expect($entries)->toBe(['Cadeira Toe/TOE.skp', 'Mesa Rito/RITO.dwg'])
        ->and(DownloadLog::count())->toBe(2);
});

it('answers 404 for a collection without files', function () {
    $collection = Collection::factory()->create(['is_published' => true]);
    $collection->products()->attach(publishedProduct());

    $this->postJson('/api/v1/collections/'.$collection->getTranslation('slug', 'pt').'/download', ['lead_token' => downloadLeadToken()])
        ->assertNotFound();
});
