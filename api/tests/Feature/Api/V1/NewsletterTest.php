<?php

use App\Models\NewsletterSubscriber;

function validNewsletter(array $overrides = []): array
{
    return array_merge([
        'email' => 'assine@exemplo.com',
        'locale' => 'pt',
        'consent' => true,
    ], $overrides);
}

it('creates a new subscriber on first subscription', function () {
    $this->postJson('/api/v1/newsletter', validNewsletter())
        ->assertCreated()
        ->assertExactJson(['data' => ['subscribed' => true]]);

    $subscriber = NewsletterSubscriber::sole();
    expect($subscriber->email)->toBe('assine@exemplo.com')
        ->and($subscriber->unsubscribed_at)->toBeNull()
        ->and($subscriber->ip_hash)->toHaveLength(64);
});

it('reactivates an existing subscriber with the same response body, without duplicating', function () {
    $subscriber = NewsletterSubscriber::factory()->create([
        'email' => 'assine@exemplo.com',
        'unsubscribed_at' => now(),
    ]);

    $this->postJson('/api/v1/newsletter', validNewsletter())
        ->assertOk()
        ->assertExactJson(['data' => ['subscribed' => true]]);

    expect(NewsletterSubscriber::count())->toBe(1);
    expect($subscriber->refresh()->unsubscribed_at)->toBeNull();
});

it('requires consent and a valid email', function () {
    $this->postJson('/api/v1/newsletter', validNewsletter(['consent' => false, 'email' => 'not-an-email']))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['consent', 'email']);
});

it('answers validation errors in the locale sent in the body', function () {
    $this->postJson('/api/v1/newsletter', validNewsletter(['locale' => 'en', 'email' => '']))
        ->assertStatus(422)
        ->assertJsonPath('errors.email.0', 'The email field is required.');
});

it('rejects a non-string turnstile_token with a 422 instead of a server error', function () {
    config(['franccino.turnstile.secret_key' => 'secret']);

    $this->postJson('/api/v1/newsletter', validNewsletter(['turnstile_token' => ['x']]))
        ->assertStatus(422)
        ->assertJsonValidationErrors('turnstile_token');
});

it('limits submissions per ip', function () {
    foreach (range(1, 5) as $i) {
        $this->postJson('/api/v1/newsletter', validNewsletter(['email' => "assine{$i}@exemplo.com"]))->assertCreated();
    }

    $this->postJson('/api/v1/newsletter', validNewsletter(['email' => 'assine6@exemplo.com']))->assertStatus(429);
});
