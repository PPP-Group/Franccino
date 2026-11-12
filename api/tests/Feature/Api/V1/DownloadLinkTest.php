<?php

use App\Models\DownloadLead;
use App\Models\DownloadLog;
use App\Models\Product;
use App\Models\ProductFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

afterEach(function () {
    File::deleteDirectory(storage_path('framework/testing/downloads'));
});

it('creates a temporary link and a download log for a published file of a published product', function () {
    useScratchDownloadsDisk();
    $product = publishedProduct();
    $file = ProductFile::factory()->for($product)->create([
        'path' => 'product-files/sample.pdf',
        'is_published' => true,
    ]);
    Storage::disk('downloads')->put($file->path, 'conteudo-do-arquivo');

    $response = $this->postJson("/api/v1/downloads/{$file->id}/link", ['lead_token' => downloadLeadToken()])->assertCreated();

    $response->assertJsonStructure(['data' => ['url', 'expires_at']]);

    $this->assertDatabaseHas('download_logs', [
        'product_file_id' => $file->id,
        'product_id' => $product->id,
        'download_lead_id' => DownloadLead::sole()->id,
    ]);
    expect(DownloadLog::sole()->ip_hash)->toHaveLength(64);

    // `Storage::serve()` returns a `BinaryFileResponse` that streams the file
    // straight to the output buffer on `send()` rather than filling
    // `getContent()`, so the fetch is checked by status/headers, not body.
    $url = $response->json('data.url');
    $this->get($url)->assertOk()->assertHeader('Content-Length', (string) strlen('conteudo-do-arquivo'));
});

it('returns 404 for an unpublished file', function () {
    useScratchDownloadsDisk();
    $product = publishedProduct();
    $file = ProductFile::factory()->for($product)->create(['is_published' => false]);

    $this->postJson("/api/v1/downloads/{$file->id}/link")->assertStatus(404);
});

it('returns 404 for a file of an unpublished product', function () {
    useScratchDownloadsDisk();
    $product = Product::factory()->for(area('indoor'))->create(['is_published' => false]);
    $file = ProductFile::factory()->for($product)->create(['is_published' => true]);

    $this->postJson("/api/v1/downloads/{$file->id}/link")->assertStatus(404);
});

it('returns 404 for a nonexistent file', function () {
    useScratchDownloadsDisk();

    $this->postJson('/api/v1/downloads/999999/link')->assertStatus(404);
});

it('limits requests per ip', function () {
    useScratchDownloadsDisk();
    $product = publishedProduct();
    $file = ProductFile::factory()->for($product)->create(['path' => 'product-files/sample.pdf']);
    Storage::disk('downloads')->put($file->path, 'conteudo');

    $token = downloadLeadToken();
    foreach (range(1, 30) as $i) {
        $this->postJson("/api/v1/downloads/{$file->id}/link", ['lead_token' => $token])->assertCreated();
    }

    $this->postJson("/api/v1/downloads/{$file->id}/link", ['lead_token' => $token])->assertStatus(429);
});

it('asks for the details before the link (no token or an unknown one)', function () {
    useScratchDownloadsDisk();
    $file = ProductFile::factory()->for(publishedProduct())->create(['path' => 'product-files/sample.pdf']);
    Storage::disk('downloads')->put($file->path, 'conteudo');

    $this->postJson("/api/v1/downloads/{$file->id}/link")->assertStatus(422)->assertJsonValidationErrors('lead_token');
    $this->postJson("/api/v1/downloads/{$file->id}/link", ['lead_token' => 'nao-existe'])->assertStatus(422);

    expect(DownloadLog::count())->toBe(0);
});
