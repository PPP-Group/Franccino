<?php

namespace App\Support;

use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductFile;
use Illuminate\Support\Collection as LaravelCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Todos os arquivos técnicos de uma coleção num zip só (revisão da Franccino, 18/11/2026: "baixar tudo de uma vez no
 * final da coleção"). O zip fica no disco privado `downloads`, com o nome tirado dos arquivos que entram nele: enquanto
 * nenhum arquivo muda, o mesmo zip serve todo mundo; mudou, sai um zip novo e o antigo é apagado.
 */
class CollectionZip
{
    public const DIRECTORY = 'zips';

    /** @return LaravelCollection<int, ProductFile> */
    public static function files(Collection $collection): LaravelCollection
    {
        return $collection->products()
            ->published()
            ->with(['files' => fn ($query) => $query->published()->orderBy('sort_order')->orderBy('id')])
            ->get()
            ->flatMap(fn (Product $product) => $product->files->each(fn (ProductFile $file) => $file->setRelation('product', $product)))
            ->values();
    }

    /** @param  LaravelCollection<int, ProductFile>  $files */
    public static function path(Collection $collection, LaravelCollection $files): string
    {
        $key = sha1($files->map(fn (ProductFile $file) => $file->id.':'.$file->path.':'.$file->size)->implode('|'));

        return sprintf('%s/colecao-%d-%s.zip', self::DIRECTORY, $collection->id, substr($key, 0, 16));
    }

    /** Nome do arquivo que a pessoa recebe: "Colecao TEMPO.zip". */
    public static function downloadName(Collection $collection): string
    {
        $name = (string) Localized::value($collection, 'name');

        return Str::of($name)->ascii()->replaceMatches('/[^A-Za-z0-9 ._-]+/', '')->trim()->append('.zip')->toString();
    }

    /**
     * Monta o zip: uma pasta por peça, com os arquivos dela pelo nome original. Os arquivos vêm do disco de cada um (no
     * R2, baixados para uma pasta temporária); o zip pronto vai para o disco `downloads`.
     *
     * @param  LaravelCollection<int, ProductFile>  $files
     */
    public static function build(Collection $collection, LaravelCollection $files): string
    {
        $target = self::path($collection, $files);
        $disk = Storage::disk('downloads');
        if ($disk->exists($target)) {
            return $target;
        }

        $workdir = storage_path('app/tmp/zip-'.Str::random(12));
        @mkdir($workdir, 0775, true);
        $zipPath = $workdir.'/colecao.zip';
        $zip = new \ZipArchive;
        $zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);
        $used = [];

        try {
            foreach ($files as $index => $file) {
                $source = Storage::disk($file->disk);
                if (! $source->exists($file->path)) {
                    continue;
                }
                $local = $workdir.'/'.$index;
                $stream = $source->readStream($file->path);
                file_put_contents($local, $stream);
                if (is_resource($stream)) {
                    fclose($stream);
                }

                $folder = Str::of((string) Localized::value($file->product, 'name'))->ascii()->replaceMatches('/[\\/\\\\:*?"<>|]+/', '')->trim();
                $base = basename(str_replace('\\', '/', (string) ($file->original_name ?: $file->path)));
                $entry = $folder.'/'.$base;
                for ($copy = 2; isset($used[$entry]); $copy++) {
                    $entry = $folder.'/'.pathinfo($base, PATHINFO_FILENAME).' ('.$copy.').'.pathinfo($base, PATHINFO_EXTENSION);
                }
                $used[$entry] = true;
                $zip->addFile($local, $entry);
                // Blocos já são comprimidos (SKP, GLB): guardar sem recomprimir é muito mais rápido.
                $zip->setCompressionName($entry, \ZipArchive::CM_STORE);
            }
            $zip->close();

            $handle = fopen($zipPath, 'rb');
            $disk->put($target, $handle);
            if (is_resource($handle)) {
                fclose($handle);
            }
        } finally {
            foreach (glob($workdir.'/*') ?: [] as $leftover) {
                @unlink($leftover);
            }
            @rmdir($workdir);
        }

        // Zips antigos da mesma coleção (os arquivos mudaram desde então).
        foreach ($disk->files(self::DIRECTORY) as $old) {
            if ($old !== $target && str_starts_with(basename($old), 'colecao-'.$collection->id.'-')) {
                $disk->delete($old);
            }
        }

        return $target;
    }
}
