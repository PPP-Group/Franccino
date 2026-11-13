<?php

use App\Models\ContactMessage;
use App\Models\Finish;
use App\Models\Product;
use App\Models\QuoteList;

it('saves a wishlist and gives back a short code that opens it with the pieces (retorno de 12/11/2026)', function () {
    $product = publishedProduct();
    $finish = Finish::factory()->create(['code' => 'F12']);

    $code = $this->postJson('/api/v1/quote-lists', [
        'locale' => 'pt',
        'items' => [['product_id' => $product->id, 'quantity' => 3, 'finish_ids' => [$finish->id], 'note' => 'sala']],
    ])->assertCreated()->json('data.code');

    expect($code)->toMatch('/^[a-z2-9]{8}$/');

    $this->getJson("/api/v1/quote-lists/{$code}")
        ->assertOk()
        ->assertJsonPath('data.items.0.product.slug', 'cadeira-aura')
        ->assertJsonPath('data.items.0.quantity', 3)
        ->assertJsonPath('data.items.0.finishes.0.code', 'F12')
        ->assertJsonPath('data.items.0.note', 'sala');
});

it('rejects an empty list or an unpublished piece', function () {
    $draft = Product::factory()->for(area('indoor'))->create(['is_published' => false]);

    $this->postJson('/api/v1/quote-lists', ['locale' => 'pt', 'items' => []])->assertUnprocessable();
    $this->postJson('/api/v1/quote-lists', [
        'locale' => 'pt',
        'items' => [['product_id' => $draft->id, 'quantity' => 1]],
    ])->assertUnprocessable()->assertJsonValidationErrors('items.0.product_id');
});

it('answers 404 for an unknown or expired list', function () {
    $list = QuoteList::share([['product_id' => publishedProduct()->id, 'quantity' => 1]], 'pt');
    $list->update(['expires_at' => now()->subDay()]);

    $this->getJson("/api/v1/quote-lists/{$list->code}")->assertNotFound();
    $this->getJson('/api/v1/quote-lists/naoexiste')->assertNotFound();
});

it('keeps the list of a quote request, linked to the message and with its site address', function () {
    $product = publishedProduct();

    $this->postJson('/api/v1/contact', [
        'type' => 'quote',
        'name' => 'Ana',
        'email' => 'ana@example.com',
        'message' => 'Lista de desejos',
        'locale' => 'en',
        'consent' => true,
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
    ])->assertSuccessful();

    $list = QuoteList::firstOrFail();
    expect($list->contact_message_id)->toBe(ContactMessage::firstOrFail()->id)
        ->and($list->pieceCount())->toBe(2)
        ->and($list->siteUrl())->toEndWith("/en/list/{$list->code}");
});
