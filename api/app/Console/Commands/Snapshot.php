<?php

namespace App\Console\Commands;

use Database\Seeders\AdminUserSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use PDO;
use RuntimeException;
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

        $database = (string) config('database.connections.sqlite.database');
        DB::disconnect();
        File::put($database, (string) $zip->getFromName('database.sqlite'));

        foreach ($this->roots() as $root) {
            File::deleteDirectory($root);
            File::ensureDirectoryExists($root);
        }
        $tmp = storage_path('app/snapshot-'.uniqid());
        $zip->extractTo($tmp);
        $zip->close();
        foreach ($this->roots() as $prefix => $root) {
            if (is_dir("{$tmp}/{$prefix}")) {
                File::copyDirectory("{$tmp}/{$prefix}", $root);
            }
        }
        File::deleteDirectory($tmp);

        $this->call('migrate', ['--force' => true]);
        $this->call('db:seed', ['--class' => AdminUserSeeder::class, '--force' => true]);
        $this->call('storage:link', ['--force' => true]);

        if (! ($manifest['with_conversions'] ?? false)) {
            // With a queue worker the resized photos are made in the background while the site is already up;
            // with QUEUE_CONNECTION=sync they are made here (about 20 minutes for the full catalog).
            $this->info(config('queue.default') === 'sync'
                ? 'Gerando as fotos redimensionadas (cerca de 20 minutos)...'
                : 'Fotos redimensionadas na fila: o worker gera em segundo plano.');
            $this->call('media-library:regenerate', ['--only-missing' => true, '--force' => true]);
        }

        $this->info('Snapshot importado. Entre no painel com ADMIN_EMAIL e ADMIN_PASSWORD do .env.');

        return self::SUCCESS;
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
