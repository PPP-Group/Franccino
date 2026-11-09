<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Turns a gallery photo into the product cover, from a list reviewed by the team (database/data/covers/*.json).
 * The standard cover is the piece in a three-quarter view, facing left, on a white background. The photo leaves the
 * gallery (it is the cover now) and the old cover is replaced. Runs once per list: the container entrypoint calls it
 * on every start, and the marker in storage/ makes the next starts skip it. A photo that is no longer in the gallery
 * (edited in the panel, other environment) is skipped: the panel always wins.
 */
class ApplyCovers extends Command
{
    protected $signature = 'franccino:covers:apply
        {file : JSON with {"version": "...", "covers": [{"product": "<slug pt>", "media": <id da foto da galeria>}]}}
        {--dry-run : only count, without writing}
        {--force : run again even if this list was already applied}';

    protected $description = 'Troca a capa das peças pela foto da galeria indicada na lista (padrão: diagonal para a esquerda)';

    public function handle(): int
    {
        $file = (string) $this->argument('file');
        if (! File::exists($file)) {
            $this->error("Arquivo não encontrado: {$file}");

            return self::FAILURE;
        }

        /** @var array{version?: string, covers?: list<array{product: string, media: int}>} $list */
        $list = json_decode(File::get($file), true, flags: JSON_THROW_ON_ERROR);
        $version = preg_replace('/[^A-Za-z0-9_-]/', '', (string) ($list['version'] ?? pathinfo($file, PATHINFO_FILENAME)));
        $marker = self::marker($version);
        $dryRun = (bool) $this->option('dry-run');

        if (File::exists($marker) && ! $this->option('force')) {
            $this->info("Lista {$version} já aplicada em ".trim(File::get($marker)).'.');

            return self::SUCCESS;
        }

        $applied = 0;
        $skipped = 0;
        foreach ($list['covers'] ?? [] as $item) {
            $product = Product::query()->where('slug->pt', $item['product'])->first();
            $media = Media::query()->find($item['media']);
            $belongs = $product !== null && $media !== null
                && $media->model_type === $product->getMorphClass()
                && (int) $media->model_id === $product->getKey()
                && $media->collection_name === 'gallery';

            if (! $belongs) {
                $skipped++;

                continue;
            }

            if (! $dryRun) {
                // The old cover stays as a gallery photo (09/11/2026), unless the gallery already has the same file.
                $old = $product->getFirstMedia('cover');
                if ($old !== null) {
                    $known = $product->getMedia('gallery')->contains(
                        fn (Media $photo) => $photo->size === $old->size && $photo->mime_type === $old->mime_type,
                    );
                    if (! $known) {
                        $old->copy($product, 'gallery');
                    }
                }
                // Copy into the single-file cover collection (the old cover goes) and remove it from the gallery.
                $media->move($product, 'cover');
            }
            $applied++;
        }

        $this->table(['Capas trocadas', 'Ignoradas (foto fora da galeria)'], [[$applied, $skipped]]);

        if ($dryRun) {
            $this->comment('Simulação: nada foi gravado.');
        } else {
            File::put($marker, now()->toIso8601String());
        }

        return self::SUCCESS;
    }

    public static function marker(string $version): string
    {
        return storage_path(".covers-{$version}");
    }
}
