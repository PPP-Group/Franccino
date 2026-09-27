<?php

use App\Services\Turnstile;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

it('returns true without any http call when no secret is configured', function () {
    config(['franccino.turnstile.secret_key' => null]);
    Http::fake();

    expect(app(Turnstile::class)->verify('some-token', '1.2.3.4'))->toBeTrue();

    Http::assertNothingSent();
});

it('calls the cloudflare siteverify endpoint with secret, response and remoteip when configured', function () {
    config(['franccino.turnstile.secret_key' => 'my-secret']);
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => true])]);

    $result = app(Turnstile::class)->verify('visitor-token', '9.8.7.6');

    expect($result)->toBeTrue();

    Http::assertSent(function ($request) {
        return $request->url() === 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
            && $request['secret'] === 'my-secret'
            && $request['response'] === 'visitor-token'
            && $request['remoteip'] === '9.8.7.6';
    });
});

it('returns false when cloudflare rejects the token', function () {
    config(['franccino.turnstile.secret_key' => 'my-secret']);
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => false])]);

    expect(app(Turnstile::class)->verify('bad-token', '1.1.1.1'))->toBeFalse();
});
