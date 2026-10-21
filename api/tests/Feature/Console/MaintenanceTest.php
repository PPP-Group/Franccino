<?php

use App\Models\ActivityLog;
use App\Models\ConsentRecord;
use App\Models\DownloadLog;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

/**
 * The backup reads the database file: a small one stands in for the preview's SQLite, also when the suite runs on MySQL
 * (CI). Only the default connection's name changes; the test data stays in the suite's connection.
 */
function useSqliteFileForBackup(): void
{
    $path = storage_path('framework/testing/backup-source.sqlite');
    File::ensureDirectoryExists(dirname($path));
    File::delete($path);
    (new PDO('sqlite:'.$path))->exec("create table produtos (nome text); insert into produtos values ('Cadeira Aura')");
    config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => $path]);
}

beforeEach(function () {
    $this->suiteConnection = config('database.default');
});

afterEach(function () {
    config(['database.default' => $this->suiteConnection]);
    File::deleteDirectory(storage_path('app/backups'));
    File::delete(storage_path('framework/testing/backup-source.sqlite'));
});

it('removes personal-data logs past their retention period and keeps the rest', function () {
    config(['franccino.retention.activity_logs' => 365, 'franccino.retention.download_logs' => null]);
    $old = ActivityLog::query()->create(['action' => 'login', 'created_at' => now()->subDays(400)]);
    $recent = ActivityLog::query()->create(['action' => 'login', 'created_at' => now()->subDays(10)]);
    $download = DownloadLog::factory()->create(['created_at' => now()->subYears(3)]);

    $this->artisan('model:prune', ['--model' => [ActivityLog::class, DownloadLog::class, ConsentRecord::class]])->assertSuccessful();

    expect(ActivityLog::query()->pluck('id')->all())->toBe([$recent->id])
        ->and(DownloadLog::query()->whereKey($download->id)->exists())->toBeTrue();
});

it('backs up the sqlite database every day and keeps only the newest copies', function () {
    useSqliteFileForBackup();
    config(['franccino.backups.keep_database' => 2]);
    File::ensureDirectoryExists(storage_path('app/backups'));
    File::put(storage_path('app/backups/database-2026-01-01-000000.sqlite'), 'velho');
    File::put(storage_path('app/backups/database-2026-01-02-000000.sqlite'), 'velho');

    $this->artisan('franccino:backup')->assertSuccessful();

    $copies = File::glob(storage_path('app/backups/database-*.sqlite'));
    expect($copies)->toHaveCount(2)
        ->and(collect($copies)->contains(fn (string $path) => str_contains($path, '2026-01-01')))->toBeFalse()
        ->and(file_get_contents(end($copies)))->toStartWith('SQLite format 3');
});

it('puts the database, the photos and the private files in the weekly backup', function () {
    useSqliteFileForBackup();
    $media = storage_path('app/public/media/backup-test');
    File::ensureDirectoryExists($media);
    File::put("{$media}/foto.webp", 'foto');

    $this->artisan('franccino:backup')->assertSuccessful();
    $this->artisan('franccino:backup', ['--with-files' => true])->assertSuccessful();

    $zip = new ZipArchive;
    $zip->open(File::glob(storage_path('app/backups/files-*.zip'))[0]);
    expect($zip->locateName('database.sqlite'))->not->toBeFalse()
        ->and($zip->locateName('media/backup-test/foto.webp'))->not->toBeFalse();
    $zip->close();
    File::deleteDirectory($media);
    expect(File::glob(storage_path('app/backups/database-*.sqlite')))->toHaveCount(1)
        ->and(File::glob(storage_path('app/backups/.tmp-*')))->toBeEmpty();
});

it('schedules the pruning, the failed jobs cleanup and the backups', function () {
    Artisan::call('schedule:list');
    $list = Artisan::output();

    expect($list)->toContain('model:prune')
        ->toContain('queue:prune-failed')
        ->toContain('franccino:backup')
        ->toContain('limpar-exportacoes');
});
