<?php

use App\Actions\CreateDownloadLink;
use App\Filament\RelationManagers\FilesRelationManager;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Models\Product;
use App\Models\ProductFile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

use function Pest\Livewire\livewire;

beforeEach(fn () => useScratchDownloadsDisk());

afterEach(fn () => File::deleteDirectory(storage_path('framework/testing/downloads')));

function uploadTechnicalFile(Product $product, UploadedFile $file): mixed
{
    return livewire(FilesRelationManager::class, ['ownerRecord' => $product, 'pageClass' => EditProduct::class])
        ->callTableAction('create', data: [
            'type' => 'technical_sheet',
            'title' => ['pt' => 'Ficha técnica'],
            'path' => $file,
            'is_published' => true,
        ]);
}

it('accepts technical drawings and refuses html or scripts', function () {
    $this->actingAs(User::factory()->editor()->create());
    $product = Product::factory()->create();

    uploadTechnicalFile($product, UploadedFile::fake()->createWithContent('pagina.html', '<script>alert(1)</script>'))
        ->assertHasTableActionErrors(['path']);
    expect($product->files()->count())->toBe(0);

    uploadTechnicalFile($product, UploadedFile::fake()->createWithContent('ficha.pdf', "%PDF-1.4\n%%EOF"))
        ->assertHasNoTableActionErrors();

    $file = $product->files()->sole();
    expect($file->original_name)->toBe('ficha.pdf')
        ->and($file->mime_type)->toBe('application/pdf')
        ->and($file->size)->toBeGreaterThan(0);
});

it('removes the file from the private disk when it is replaced or deleted', function () {
    $file = ProductFile::factory()->create(['path' => 'products/a.pdf']);
    Storage::disk('downloads')->put('products/a.pdf', 'a');
    Storage::disk('downloads')->put('products/b.pdf', 'b');

    $file->update(['path' => 'products/b.pdf']);
    Storage::disk('downloads')->assertMissing('products/a.pdf');

    $file->delete();
    Storage::disk('downloads')->assertMissing('products/b.pdf');
});

it('asks the storage to download the file with its original name', function () {
    $file = ProductFile::factory()->create(['path' => 'products/x1y2.pdf', 'original_name' => 'Ficha "Aura".pdf']);
    $options = null;
    Storage::disk('downloads')->buildTemporaryUrlsUsing(function (string $path, $expiration, array $given) use (&$options) {
        $options = $given;

        return "https://r2.test/{$path}";
    });

    app(CreateDownloadLink::class)->handle($file, Request::create('/'));

    expect($options)->toBe(['ResponseContentDisposition' => 'attachment; filename="Ficha Aura.pdf"']);
});
