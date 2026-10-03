<?php

namespace App\Console\Commands;

use Database\Seeders\AdminUserSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use PDO;
use RuntimeException;
use Spatie\MediaLibrary\Conversions\FileManipulator;
use ZipArchive;

/**
 * Copies the content of one environment (SQLite database + photos + private files) to another, for local
 * reviews and preview servers: the catalog import takes hours, a snapshot takes minutes. People's data never
 * travels: panel users, visitor messages, newsletter, consents, logs and sessions are emptied in the copy.
 */
class Snapshot extends Command
{
    /** Tables emptied in the exported copy: personal data, credentials and transient state. */
    public const PRIVATE_TABLES = [
        'users', 'password_reset_tokens', 'sessions', 'cache', 'cache_locks', 'jobs', 'job_batches',
        'failed_jobs', 'contact_messages', 'newsletter_subscribers', 'consent_records', 'download_logs',
        'activity_logs',
    ];

    protected $signature = 'franccino:snapshot
        {action : export ou import}
        {file : arquivo .zip}
        {--with-conversions : inclui as fotos redimensionadas (arquivo maior; o import não reprocessa)}
        {--force : no import, substitui o conteúdo atual sem perguntar}';

    protected $description = 'Exporta ou importa o conteúdo (banco SQLite + fotos) para preview local ou de staging';

    public function handle(): int
    {
        if (config('database.default') !== 'sqlite') {
            $this->error('O snapshot funciona só com DB_CONNECTION=sqlite.');

            return self::FAILURE;
        }

        return match ($this->argument('action')) {
            'export' => $this->export((string) $this->argument('file')),
            'import' => $this->import((string) $this->argument('file')),
            default => $this->invalidAction(),
        };
    }

    private function export(string $file): int
    {
        $copy = storage_path('app/snapshot-'.uniqid().'.sqlite');
        DB::statement('VACUUM INTO ?', [$copy]);
        $pdo = new PDO('sqlite:'.$copy);
        $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type = 'table'")->fetchAll(PDO::FETCH_COLUMN);
        foreach (array_intersect(self::PRIVATE_TABLES, $tables) as $table) {
            $pdo->exec("DELETE FROM \"{$table}\"");
        }
        $pdo->exec('VACUUM');
        $pdo = null;

        $zip = new ZipArchive;
        if ($zip->open($file, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException("Não foi possível criar {$file}.");
        }
        $zip->addFile($copy, 'database.sqlite');
        $withConversions = (bool) $this->option('with-conversions');
        $count = 0;
        foreach ($this->roots() as $prefix => $root) {
            if (! is_dir($root)) {
                continue;
            }
            foreach (File::allFiles($root) as $item) {
                $relative = str_replace('\\', '/', $item->getRelativePathname());
                if (! $withConversions && str_contains($relative, '/conversions/')) {
                    continue;
                }
                $name = "{$prefix}/{$relative}";
                $zip->addFile($item->getPathname(), $name);
                $zip->setCompressionName($name, ZipArchive::CM_STORE);
                $count++;
            }
        }
        $zip->addFromString('manifest.json', (string) json_encode([
            'created_at' => now()->toIso8601String(),
            'with_conversions' => $withConversions,
            'files' => $count,
        ], JSON_PRETTY_PRINT));
        $zip->close();
        File::delete($copy);

        $this->info(sprintf('Snapshot salvo em %s (%d arquivos, %s MB).', $file, $count, number_format(filesize($file) / 1048576, 1)));

        return self::SUCCESS;
    }

    private function import(string $file): int
    {
        if (app()->isProduction()) {
            $this->error('O import de snapshot não roda em produção.');

            return self::FAILURE;
        }
        $zip = new ZipArchive;
        if (! is_file($file) || $zip->open($file) !== true || $zip->locateName('database.sqlite') === false) {
            $this->error("{$file} não é um snapshot válido.");

            return self::FAILURE;
        }
        if (! $this->option('force') && ! $this->confirm('O banco e as fotos atuais serão substituídos. Continuar?')) {
            return self::FAILURE;
        }
        $manifest = json_decode((string) $zip->getFromName('manifest.json'), true) ?: [];
        $withConversions = (bool) ($manifest['with_conversions'] ?? false);

        $tmp = storage_path('app/snapshot-'.uniqid());
        File::ensureDirectoryExists($tmp);
        $zip->extractTo($tmp);
        $zip->close();

        $this->call('migrate', ['--force' => true]);
        $this->copyContent("{$tmp}/database.sqlite", $withConversions);

        foreach ($this->roots() as $prefix => $root) {
            File::deleteDirectory($root);
            File::ensureDirectoryExists($root);
            if (is_dir("{$tmp}/{$prefix}")) {
                File::copyDirectory("{$tmp}/{$prefix}", $root);
            }
        }
        File::deleteDirectory($tmp);

        $this->call('db:seed', ['--class' => AdminUserSeeder::class, '--force' => true]);
        $this->call('storage:link', ['--force' => true]);

        if (! $withConversions) {
            // With a queue worker the resized photos are made in the background while the site is already up
            // (meanwhile the API serves the original photo); with QUEUE_CONNECTION=sync they are made here.
            $this->info(config('queue.default') === 'sync'
                ? 'Gerando as fotos redimensionadas (cerca de 20 minutos)...'
                : 'Fotos redimensionadas na fila: o worker gera em segundo plano.');
            $this->queueMissingConversions();
        }

        // The container entrypoint skips SNAPSHOT_URL once this exists, so a redeploy never re-imports.
        File::put(self::importedMarker(), now()->toIso8601String());

        $this->info('Snapshot importado. Entre no painel com ADMIN_EMAIL e ADMIN_PASSWORD do .env.');

        return self::SUCCESS;
    }

    /**
     * Queues every photo's missing resized versions. Not `media-library:regenerate`: it walks the media with an
     * open read cursor, and with a worker writing to SQLite at the same time part of the photos fail with
     * "database is locked" and are never queued.
     */
    private function queueMissingConversions(): void
    {
        $model = config('media-library.media_model');
        $manipulator = app(FileManipulator::class);
        $ids = $model::query()->orderBy('id')->pluck('id');
        $bar = $this->output->createProgressBar($ids->count());
        foreach ($ids as $id) {
            $media = $model::find($id);
            if ($media !== null) {
                $manipulator->createDerivedFiles($media, onlyMissing: true, queueAll: true);
            }
            $bar->advance();
        }
        $bar->finish();
        $this->newLine();
    }

    public static function importedMarker(): string
    {
        return storage_path('.snapshot-imported');
    }

    /**
     * Copies the content tables of the snapshot into the current database inside one transaction, through
     * SQLite itself: the queue worker and the web server may keep their connections open during the import
     * (overwriting the file under them corrupts their view of it). Private tables (users, jobs, sessions...)
     * and the migrations table stay as they are.
     */
    private function copyContent(string $source, bool $withConversions): void
    {
        $db = DB::connection();
        $skip = [...self::PRIVATE_TABLES, 'migrations'];
        $tablesOf = fn (string $schema): array => array_column(
            $db->select("SELECT name FROM {$schema}.sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"),
            'name'
        );
        $columnsOf = fn (string $schema, string $table): array => array_column(
            $db->select("PRAGMA {$schema}.table_info(\"{$table}\")"),
            'name'
        );

        // Off for the copy: tables are refilled one by one, and cascades would empty the ones already copied.
        $foreignKeys = (int) $db->selectOne('PRAGMA foreign_keys')->foreign_keys;
        $db->statement('PRAGMA foreign_keys = OFF');
        $db->statement('ATTACH DATABASE ? AS snapshot', [$source]);

        try {
            $snapshotTables = $tablesOf('snapshot');
            $db->transaction(function () use ($db, $tablesOf, $columnsOf, $skip, $snapshotTables, $withConversions): void {
                foreach (array_diff($tablesOf('main'), $skip) as $table) {
                    $db->statement("DELETE FROM main.\"{$table}\"");
                    if (! in_array($table, $snapshotTables, true)) {
                        continue;
                    }
                    $columns = array_intersect($columnsOf('main', $table), $columnsOf('snapshot', $table));
                    $list = implode(', ', array_map(fn (string $column): string => "\"{$column}\"", $columns));
                    $db->statement("INSERT INTO main.\"{$table}\" ({$list}) SELECT {$list} FROM snapshot.\"{$table}\"");
                }

                if (! $withConversions) {
                    // The light snapshot has no resized files: until the worker makes them, the API must point
                    // to the original photo, not to conversions that do not exist yet.
                    $db->table('media')->update(['generated_conversions' => '[]']);
                }
            });
        } finally {
            $db->statement('DETACH DATABASE snapshot');
            $db->statement('PRAGMA foreign_keys = '.($foreignKeys ? 'ON' : 'OFF'));
        }
    }

    /**
     * Local folders of the `media` and `downloads` disks. On R2 (staging/production) the files live in the
     * bucket and the snapshot carries only the database.
     *
     * @return array<string, string>
     */
    private function roots(): array
    {
        $roots = [];
        foreach (['media', 'downloads'] as $disk) {
            if (config("filesystems.disks.{$disk}.driver") === 'local') {
                $roots[$disk] = (string) config("filesystems.disks.{$disk}.root");
            }
        }

        return $roots;
    }

    private function invalidAction(): int
    {
        $this->error('Use export ou import.');

        return self::FAILURE;
    }
}
