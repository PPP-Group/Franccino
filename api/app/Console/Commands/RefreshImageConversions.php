<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Spatie\MediaLibrary\Conversions\FileManipulator;

/**
 * Puts every photo's resized versions back in the queue, after a change in how they are made (size, quality). Runs
 * once per version: the container entrypoint calls it on every start, and the marker in storage/ makes the next
 * starts skip it. Not `media-library:regenerate`: it walks the media with an open read cursor, and with a worker
 * writing to SQLite at the same time part of the photos fail with "database is locked" and are never queued. Until
 * a photo's new versions are ready, the site keeps showing the old ones.
 */
class RefreshImageConversions extends Command
{
    protected $signature = 'franccino:media:refresh
        {version : name of the change (e.g. 2026-11-06-qualidade-90); each version runs once}
        {--force : run again even if this version was already queued}';

    protected $description = 'Refaz as fotos redimensionadas de todas as imagens (uma vez por versão), pela fila';

    public function handle(FileManipulator $manipulator): int
    {
        $version = preg_replace('/[^A-Za-z0-9_-]/', '', (string) $this->argument('version'));
        $marker = self::marker($version);
        if (File::exists($marker) && ! $this->option('force')) {
            $this->info("Versão {$version} já enfileirada em ".trim(File::get($marker)).'.');

            return self::SUCCESS;
        }

        $model = config('media-library.media_model');
        $ids = $model::query()->orderBy('id')->pluck('id');
        $queued = 0;
        foreach ($ids as $id) {
            $media = $model::query()->find($id);
            if ($media === null || ! str_starts_with((string) $media->mime_type, 'image/')) {
                continue;
            }
            $manipulator->createDerivedFiles($media, onlyMissing: false, queueAll: true);
            $queued++;
        }

        File::put($marker, now()->toIso8601String());
        $this->info("{$queued} fotos na fila para refazer as versões redimensionadas.");

        return self::SUCCESS;
    }

    public static function marker(string $version): string
    {
        return storage_path(".media-refresh-{$version}");
    }
}
