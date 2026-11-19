<?php

namespace App\Jobs;

use App\Models\Collection;
use App\Support\CollectionZip;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/** Monta o zip com todos os arquivos de uma coleção fora da resposta (blocos grandes levam alguns minutos). */
class BuildCollectionZip implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $timeout = 1800;

    public int $tries = 2;

    public function __construct(public int $collectionId) {}

    public function uniqueId(): string
    {
        return (string) $this->collectionId;
    }

    public function handle(): void
    {
        $collection = Collection::find($this->collectionId);
        if ($collection === null) {
            return;
        }

        $files = CollectionZip::files($collection);
        if ($files->isNotEmpty()) {
            CollectionZip::build($collection, $files);
        }
    }
}
