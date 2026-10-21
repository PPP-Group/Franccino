<?php

/*
 * Every panel upload goes through Livewire's temporary upload first, so its rule and the PHP limits of the image must
 * stay above the largest `maxSize` a field sets (page video, 3D model and technical files).
 */

function kilobytes(string $iniValue): int
{
    $number = (int) $iniValue;

    return match (strtoupper(substr(trim($iniValue), -1))) {
        'G' => $number * 1024 * 1024,
        'M' => $number * 1024,
        'K' => $number,
        default => intdiv($number, 1024),
    };
}

it('lets the temporary upload and the PHP image take the largest panel file', function () {
    $largest = max((int) config('franccino.uploads.video_max_kb'), (int) config('franccino.uploads.model_3d_max_kb'), (int) config('franccino.uploads.downloads_max_kb'));

    $rule = collect(config('livewire.temporary_file_upload.rules'))->first(fn (string $rule) => str_starts_with($rule, 'max:'));
    $ini = parse_ini_file(base_path('docker/php.ini'));

    expect((int) substr((string) $rule, 4))->toBeGreaterThanOrEqual($largest)
        ->and(kilobytes($ini['upload_max_filesize']))->toBeGreaterThan($largest)
        ->and(kilobytes($ini['post_max_size']))->toBeGreaterThan($largest);
});
