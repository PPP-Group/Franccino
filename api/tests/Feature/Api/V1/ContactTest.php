<?php

use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use App\Models\Finish;
use App\Settings\GeneralSettings;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

function validContact(array $overrides = []): array
{
    return array_merge([
        'type' => 'quote',
        'name' => 'Ana Souza',
        'email' => 'ana@exemplo.com',
        'phone' => '+55 11 99999-0000',
        'profession' => 'architect',
        'city' => 'São Paulo',
        'state' => 'SP',
        'message' => 'Gostaria de um orçamento da Cadeira Aura.',
        'locale' => 'pt',
        'consent' => true,
    ], $overrides);
}

it('stores the message and emails the recipients', function () {
    Mail::fake();
    $settings = app(GeneralSettings::class);
    $settings->contact_recipients = ['vendas@franccino.com.br'];
    $settings->save();

    $this->postJson('/api/v1/contact', validContact())
        ->assertCreated()
        ->assertExactJson(['data' => ['received' => true]]);

    $message = ContactMessage::sole();
    expect($message->ip_hash)->toHaveLength(64)->and($message->consent_at)->not->toBeNull();
    Mail::assertQueued(ContactMessageReceived::class, fn ($mail) => $mail->hasTo('vendas@franccino.com.br'));
});

it('does not send an email when no recipients are configured', function () {
    Mail::fake();
    $settings = app(GeneralSettings::class);
    $settings->contact_recipients = [];
    $settings->save();

    $this->postJson('/api/v1/contact', validContact())->assertCreated();

    Mail::assertNothingQueued();
});

it('requires consent and valid fields', function () {
    $this->postJson('/api/v1/contact', validContact(['consent' => false, 'email' => 'x', 'type' => 'spam']))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['consent', 'email', 'type']);
});

it('validates turnstile when configured', function () {
    config(['franccino.turnstile.secret_key' => 'secret']);
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => false])]);

    $this->postJson('/api/v1/contact', validContact(['turnstile_token' => 'bad']))
        ->assertStatus(422)
        ->assertJsonValidationErrors('turnstile_token');
});

it('requires turnstile_token when turnstile is configured', function () {
    config(['franccino.turnstile.secret_key' => 'secret']);
    Http::fake();

    $this->postJson('/api/v1/contact', validContact())
        ->assertStatus(422)
        ->assertJsonValidationErrors('turnstile_token');

    Http::assertNothingSent();
});

it('rejects a non-string turnstile_token with a 422 instead of a server error', function () {
    config(['franccino.turnstile.secret_key' => 'secret']);
    Http::fake();

    $this->postJson('/api/v1/contact', validContact(['turnstile_token' => ['not', 'a', 'string']]))
        ->assertStatus(422)
        ->assertJsonValidationErrors('turnstile_token');

    Http::assertNothingSent();
});

it('answers validation errors in the locale sent in the body', function () {
    $this->postJson('/api/v1/contact', validContact(['locale' => 'en', 'name' => '']))
        ->assertStatus(422)
        ->assertJsonPath('errors.name.0', 'The name field is required.');

    $this->postJson('/api/v1/contact', validContact(['locale' => 'pt', 'name' => '']))
        ->assertStatus(422)
        ->assertJsonPath('errors.name.0', fn (string $message) => str_contains($message, 'obrigatória'));
});

it('accepts the message without turnstile_token when turnstile is not configured', function () {
    Mail::fake();

    $this->postJson('/api/v1/contact', validContact())->assertCreated();
});

it('limits submissions per ip', function () {
    Mail::fake();
    foreach (range(1, 5) as $i) {
        $this->postJson('/api/v1/contact', validContact())->assertCreated();
    }

    $this->postJson('/api/v1/contact', validContact())->assertStatus(429);
});

it('accepts and stores a quote list of items', function () {
    Mail::fake();
    $product = publishedProduct();
    $finish = Finish::factory()->create(['is_published' => true]);

    $payload = validContact([
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2, 'finish_ids' => [$finish->id], 'note' => 'Cor mais clara, por favor.'],
        ],
    ]);

    $this->postJson('/api/v1/contact', $payload)->assertCreated();

    $message = ContactMessage::sole();
    expect($message->items)->toEqual([
        ['product_id' => $product->id, 'quantity' => 2, 'finish_ids' => [$finish->id], 'note' => 'Cor mais clara, por favor.'],
    ]);
});

it('rejects items with too many entries, invalid quantity or unknown references', function () {
    $tooMany = array_fill(0, 51, ['product_id' => 999999, 'quantity' => 1]);

    $this->postJson('/api/v1/contact', validContact(['items' => $tooMany]))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['items']);

    $product = publishedProduct();

    $this->postJson('/api/v1/contact', validContact([
        'items' => [['product_id' => $product->id, 'quantity' => 100]],
    ]))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['items.0.quantity']);

    $this->postJson('/api/v1/contact', validContact([
        'items' => [['product_id' => 999999, 'quantity' => 1]],
    ]))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['items.0.product_id']);

    $this->postJson('/api/v1/contact', validContact([
        'items' => [['product_id' => $product->id, 'quantity' => 1, 'finish_ids' => [999999]]],
    ]))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['items.0.finish_ids.0']);

    $this->postJson('/api/v1/contact', validContact([
        'items' => [['product_id' => $product->id, 'quantity' => 1, 'note' => str_repeat('a', 501)]],
    ]))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['items.0.note']);
});
