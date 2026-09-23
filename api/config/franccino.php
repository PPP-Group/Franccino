<?php

return [
    'locales' => array_values(array_filter(array_map('trim', explode(',', (string) env('APP_LOCALES', 'pt,en'))))),

    'frontend' => [
        'url' => env('FRONTEND_URL', 'http://localhost:3000'),
        'api_key' => env('FRONTEND_API_KEY'),
        'revalidate_url' => env('FRONTEND_REVALIDATE_URL'),
        'revalidate_secret' => env('FRONTEND_REVALIDATE_SECRET'),
    ],

    'turnstile' => [
        'secret_key' => env('TURNSTILE_SECRET_KEY'),
    ],

    'admin' => [
        'name' => env('ADMIN_NAME', 'Administrador'),
        'email' => env('ADMIN_EMAIL'),
        'password' => env('ADMIN_PASSWORD'),
    ],

    'downloads' => [
        'link_ttl_minutes' => 10,
    ],

    'uploads' => [
        'model_3d_max_kb' => 20480,
    ],
];
