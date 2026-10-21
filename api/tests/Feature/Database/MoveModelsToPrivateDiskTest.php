<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

it('moves 3d models uploaded before contract 13.2 to the private disk, keeping the record', function () {
    Storage::fake('media');
    Storage::fake('downloads');
    $product = publishedProduct(['is_3d_enabled' => true]);
    $media = $product->addMediaFromString(minimalGlb())->usingFileName('aura.glb')->toMediaCollection('model_3d');
    // As it was before the move: the model on the public media disk.
    Storage::disk('downloads')->move($media->getPathRelativeToRoot(), 'tmp.glb');
    Storage::disk('media')->put($media->getPathRelativeToRoot(), Storage::disk('downloads')->get('tmp.glb'));
    Storage::disk('downloads')->delete('tmp.glb');
    DB::table('media')->where('id', $media->id)->update(['disk' => 'media', 'conversions_disk' => 'media']);

    $migration = require database_path('migrations/2026_10_21_100000_move_3d_models_to_private_disk.php');
    $migration->up();

    expect($media->refresh()->disk)->toBe('downloads')->and($media->conversions_disk)->toBe('downloads');
    Storage::disk('downloads')->assertExists($media->getPathRelativeToRoot());
    Storage::disk('media')->assertMissing($media->getPathRelativeToRoot());

    $migration->down();
    expect($media->refresh()->disk)->toBe('media');
    Storage::disk('media')->assertExists($media->getPathRelativeToRoot());
});
