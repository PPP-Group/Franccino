<?php

it('allows a preflight request from the configured frontend origin', function () {
    $response = $this->withHeaders([
        'Origin' => 'http://localhost:3000',
        'Access-Control-Request-Method' => 'POST',
    ])->options('/api/v1/contact');

    $response->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
});

/**
 * With a single configured origin, the underlying CORS library echoes it
 * back unconditionally (safe: the browser itself rejects the response
 * because it won't match the requesting page's own origin — see
 * fruitcake/php-cors `configureAllowedOrigin()`'s "single origin" branch).
 * The "reject unknown origin" behavior only becomes observable in the header
 * once more than one origin is configured, i.e. `FRONTEND_URL` holding a
 * comma-separated list (`config/cors.php`) — so that's what this test sets up.
 */
it('does not send CORS headers for an unknown origin when multiple origins are configured', function () {
    config(['cors.allowed_origins' => ['http://localhost:3000', 'https://staging.franccino.com.br']]);

    $response = $this->withHeaders([
        'Origin' => 'https://evil.example.com',
        'Access-Control-Request-Method' => 'POST',
    ])->options('/api/v1/contact');

    $response->assertHeaderMissing('Access-Control-Allow-Origin');
});

it('reflects the matching origin when multiple origins are configured', function () {
    config(['cors.allowed_origins' => ['http://localhost:3000', 'https://staging.franccino.com.br']]);

    $response = $this->withHeaders([
        'Origin' => 'https://staging.franccino.com.br',
        'Access-Control-Request-Method' => 'POST',
    ])->options('/api/v1/contact');

    $response->assertHeader('Access-Control-Allow-Origin', 'https://staging.franccino.com.br');
});
