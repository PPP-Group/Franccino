<?php

use App\Console\Commands\Snapshot;
use App\Models\ContactMessage;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Tests\TestCase;

// A real SQLite file instead of RefreshDatabase: `VACUUM INTO` cannot run inside the test transaction.
uses(TestCase::class);

beforeEach(function () {
    $this->dir = storage_path('framework/testing/snapshot-'.uniqid());
    File::ensureDirectoryExists($this->dir);
    $this->zip = "{$this->dir}/snapshot.zip";
    $this->useDatabase = function (string $name): void {
        $path = "{$this->dir}/{$name}.sqlite";
        File::put($path, '');
        DB::purge('sqlite');
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => $path]);
        Artisan::call('migrate', ['--force' => true]);
    };
    // Never touch the real photo folders: the import replaces the disks' contents.
    config([
        'filesystems.disks.media' => ['driver' => 'local', 'root' => "{$this->dir}/media"],
        'filesystems.disks.downloads' => ['driver' => 'local', 'root' => "{$this->dir}/downloads"],
        'franccino.admin.email' => null,
    ]);
    File::put("{$this->dir}/canary", '');
});

afterEach(function () {
    DB::purge('sqlite');
    File::deleteDirectory($this->dir);
    File::delete(Snapshot::importedMarker());
});

it('exports the content without people\'s data and imports it into another database', function () {
    ($this->useDatabase)('source');
    $product = Product::factory()->create();
    User::factory()->admin()->create();
    ContactMessage::factory()->create();

    $this->artisan('franccino:snapshot', ['action' => 'export', 'file' => $this->zip])->assertSuccessful();

    ($this->useDatabase)('target');
    expect(Product::count())->toBe(0);

    $this->artisan('franccino:snapshot', ['action' => 'import', 'file' => $this->zip, '--force' => true])->assertSuccessful();

    DB::purge('sqlite');
    expect(Product::sole()->id)->toBe($product->id)
        ->and(User::count())->toBe(0)
        ->and(ContactMessage::count())->toBe(0)
        ->and(Snapshot::PRIVATE_TABLES)->toContain('activity_logs', 'consent_records', 'newsletter_subscribers')
        ->and(File::exists(Snapshot::importedMarker()))->toBeTrue();
});

it('imports into a database in use, keeping its private data and pointing photos to the originals', function () {
    ($this->useDatabase)('source');
    $product = Product::factory()->create();
    // A photo whose resized versions exist where the snapshot was made but do not travel in a light snapshot.
    DB::table('media')->insert([
        'model_type' => 'App\\Models\\Gone', 'model_id' => 1, 'uuid' => (string) Str::uuid(),
        'collection_name' => 'gallery', 'name' => 'photo', 'file_name' => 'photo.jpg', 'mime_type' => 'image/jpeg',
        'disk' => 'media', 'conversions_disk' => 'media', 'size' => 1, 'manipulations' => '[]',
        'custom_properties' => '[]', 'generated_conversions' => '{"w480":true}', 'responsive_images' => '[]',
    ]);
    $this->artisan('franccino:snapshot', ['action' => 'export', 'file' => $this->zip])->assertSuccessful();

    ($this->useDatabase)('target');
    $admin = User::factory()->admin()->create();
    // Another process (queue worker, web server) holding the database open during the import.
    $worker = new PDO('sqlite:'.config('database.connections.sqlite.database'));

    $this->artisan('franccino:snapshot', ['action' => 'import', 'file' => $this->zip, '--force' => true])->assertSuccessful();

    DB::purge('sqlite');
    expect(Product::sole()->id)->toBe($product->id)
        ->and(User::sole()->id)->toBe($admin->id)
        ->and(DB::table('media')->value('generated_conversions'))->toBe('[]')
        ->and($worker->query('SELECT COUNT(*) FROM products')->fetchColumn())->toBe(1)
        ->and(DB::selectOne('PRAGMA foreign_keys')->foreign_keys)->toBe(1);
});

it('only replaces the folders of the configured disks', function () {
    ($this->useDatabase)('source');
    File::ensureDirectoryExists("{$this->dir}/media/1");
    File::put("{$this->dir}/media/1/photo.jpg", 'x');
    $this->artisan('franccino:snapshot', ['action' => 'export', 'file' => $this->zip])->assertSuccessful();
    ($this->useDatabase)('target');

    $this->artisan('franccino:snapshot', ['action' => 'import', 'file' => $this->zip, '--force' => true])->assertSuccessful();

    expect(File::exists("{$this->dir}/media/1/photo.jpg"))->toBeTrue()
        ->and(File::exists("{$this->dir}/canary"))->toBeTrue();
});

it('refuses to import in production or from a file that is not a snapshot', function () {
    ($this->useDatabase)('target');
    File::put($this->zip, 'not a zip');
    $this->artisan('franccino:snapshot', ['action' => 'import', 'file' => $this->zip, '--force' => true])->assertFailed();

    app()->detectEnvironment(fn () => 'production');
    $this->artisan('franccino:snapshot', ['action' => 'import', 'file' => $this->zip, '--force' => true])->assertFailed();
});
