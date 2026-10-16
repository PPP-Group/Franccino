<?php

/*
 * Only the temporary upload settings differ from Livewire's defaults. Its default rule caps every panel upload at
 * 12 MB, below the 3D model (20 MB), technical file (50 MB) and page video limits each field sets with `maxSize`, so
 * the cap here follows the largest of them (`franccino.uploads.video_max_kb`). The PHP limits in `docker/php.ini`
 * must stay above it.
 */
return [
    'temporary_file_upload' => [
        'disk' => env('LIVEWIRE_TEMPORARY_FILE_UPLOAD_DISK'),
        'rules' => ['required', 'file', 'max:153600'],
        'directory' => null,
        'middleware' => null,
        'preview_mimes' => [
            'png', 'gif', 'bmp', 'svg', 'wav', 'mp4',
            'mov', 'avi', 'wmv', 'mp3', 'm4a',
            'jpg', 'jpeg', 'mpga', 'webp', 'wma',
        ],
        'max_upload_time' => 30,
        'cleanup' => true,
    ],
];
