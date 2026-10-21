<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use PDO;
use Symfony\Component\Finder\SplFileInfo;
use ZipArchive;

/**
 * Backup of the preview (SQLite on the container volume, P5b without an account): a consistent copy of the database
 * every day and, with `--with-files`, a zip with the database, the photos and the private files. Copies stay in
 * `storage/app/backups`, the oldest removed past `franccino.backups`. They protect against a wrong edit or a broken
 * database, not against losing the server: an off-site copy needs the hosting or R2 account (docs/runbook-deploy.md).
 * With MySQL (staging and production) the database backup is the provider's.
 */
class Backup extends Command
{
    protected $signature = 'franccino:backup {--with-files : Também guarda as fotos e os arquivos técnicos}';

    protected $description = 'Faz o backup do banco SQLite (e, com --with-files, das fotos e arquivos) em storage/app/backups';

    public function handle(): int
    {
        if (DB::getDriverName() !== 'sqlite') {
            $this->warn('Banco '.DB::getDriverName().': o backup do banco é o do provedor. Nada foi feito.');

            return self::SUCCESS;
        }

        $dir = storage_path('app/backups');
        File::ensureDirectoryExists($dir);
        $stamp = now()->format('Y-m-d-His');
        // With files, the database copy is only a step towards the zip: a name of its own, so it never meets the daily
        // copy of the same second.
        $database = $this->option('with-files') ? "{$dir}/.tmp-".Str::uuid().'.sqlite' : "{$dir}/database-{$stamp}.sqlite";
        File::delete($database);

        // VACUUM INTO writes a consistent copy while the panel and the queue keep using the database. Its own connection
        // to the file: it can't run inside a transaction of the app's connection.
        $pdo = new PDO('sqlite:'.config('database.connections.'.DB::getDefaultConnection().'.database'));
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->prepare('VACUUM INTO ?')->execute([$database]);

        if (! $this->option('with-files')) {
            $this->prune($dir, 'database-*.sqlite', (int) config('franccino.backups.keep_database'));
            $this->info("Backup do banco: {$database}");

            return self::SUCCESS;
        }

        $zipPath = "{$dir}/files-{$stamp}.zip";
        $zip = new ZipArchive;
        $zip->open($zipPath, ZipArchive::CREATE);
        $zip->addFile($database, 'database.sqlite');
        foreach (['media' => storage_path('app/public/media'), 'downloads' => storage_path('app/private/downloads')] as $name => $root) {
            if (! File::isDirectory($root)) {
                continue;
            }
            foreach (File::allFiles($root) as $file) {
                /** @var SplFileInfo $file */
                $zip->addFile($file->getPathname(), $name.'/'.$file->getRelativePathname());
            }
        }
        $zip->close();
        File::delete($database);

        $this->prune($dir, 'files-*.zip', (int) config('franccino.backups.keep_files'));
        $this->info("Backup com arquivos: {$zipPath}");

        return self::SUCCESS;
    }

    private function prune(string $dir, string $pattern, int $keep): void
    {
        $copies = collect(File::glob("{$dir}/{$pattern}"))->sort()->values();

        $copies->slice(0, max(0, $copies->count() - $keep))->each(fn (string $path) => File::delete($path));
    }
}
