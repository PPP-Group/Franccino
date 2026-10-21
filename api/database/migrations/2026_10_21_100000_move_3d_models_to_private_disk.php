<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * 3D models move from the public `media` disk to the private `downloads` disk (contract 13.2). Only the file and the
 * `disk` columns change; the media record, its id and its path (`{id}/{file_name}`) stay the same.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->move(from: null, to: 'downloads');
    }

    public function down(): void
    {
        $this->move(from: 'downloads', to: config('media-library.disk_name'));
    }

    private function move(?string $from, string $to): void
    {
        DB::table('media')
            ->where('collection_name', 'model_3d')
            ->when($from === null, fn ($query) => $query->where('disk', '!=', $to), fn ($query) => $query->where('disk', $from))
            ->orderBy('id')
            ->get()
            ->each(function (object $media) use ($to) {
                $path = $media->id.'/'.$media->file_name;
                $source = Storage::disk($media->disk);

                if ($source->exists($path)) {
                    Storage::disk($to)->writeStream($path, $source->readStream($path));
                    $source->deleteDirectory((string) $media->id);
                }

                DB::table('media')->where('id', $media->id)->update(['disk' => $to, 'conversions_disk' => $to]);
            });
    }
};
