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

it('limits submissions per ip', function () {
    foreach (range(1, 5) as $i) {
        $this->postJson('/api/v1/newsletter', validNewsletter(['email' => "assine{$i}@exemplo.com"]))->assertCreated();
    }

    $this->postJson('/api/v1/newsletter', validNewsletter(['email' => 'assine6@exemplo.com']))->assertStatus(429);
});
