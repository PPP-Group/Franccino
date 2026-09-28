<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | The public API is called directly from the browser (`docs/api.md`,
    | "Escrita") so that rate limiting and Turnstile see the visitor's real
    | IP. Only the front-end origin(s) may do that — `FRONTEND_URL`, comma
    | separated for multiple environments (e.g. production + staging).
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'POST', 'OPTIONS'],

    'allowed_origins' => array_values(array_filter(
        array_map('trim', explode(',', (string) env('FRONTEND_URL', 'http://localhost:3000')))
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Accept', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
