<?php

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

it('sends nothing to Mailchimp without the key', function () {
    Http::fake();
    config(['franccino.mailchimp.api_key' => null, 'franccino.mailchimp.audience_id' => null]);

    NewsletterSubscriber::factory()->create();

    Http::assertNothingSent();
});

it('subscribes and unsubscribes the contact in the audience', function () {
    Http::fake(['*.api.mailchimp.com/*' => Http::response(['id' => 'x'])]);
    config(['franccino.mailchimp.api_key' => 'chave-us21', 'franccino.mailchimp.audience_id' => 'lista1']);

    $subscriber = NewsletterSubscriber::factory()->create([
        'email' => 'Maria@Example.com',
        'name' => 'Maria',
        'locale' => 'pt',
        'unsubscribed_at' => null,
    ]);
    $subscriber->update(['unsubscribed_at' => now()]);

    $sent = collect(Http::recorded())->map(fn (array $pair) => $pair[0]);
    expect($sent)->toHaveCount(2);
    /** @var Request $first */
    $first = $sent[0];
    expect($first->url())->toBe('https://us21.api.mailchimp.com/3.0/lists/lista1/members/'.md5('maria@example.com'))
        ->and($first->method())->toBe('PUT')
        ->and($first['status'])->toBe('subscribed')
        ->and($first['merge_fields'])->toBe(['FNAME' => 'Maria'])
        ->and($sent[1]['status'])->toBe('unsubscribed');
});
