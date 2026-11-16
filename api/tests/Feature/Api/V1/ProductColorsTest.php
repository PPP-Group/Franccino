<?php

use App\Models\Product;

/** A mesma peça em outras cores (retorno de 16/11/2026). */
function colorPiece(string $slug, array $attributes = []): Product
{
    return Product::factory()->for(area('indoor'))->create([
        'name' => ['pt' => str($slug)->replace('-', ' ')->title()->toString()],
        'slug' => ['pt' => $slug],
        ...$attributes,
    ]);
}

it('links every piece of the group to the others, in both directions', function () {
    $orange = colorPiece('cadeira-pita-laranja', ['color_name' => ['pt' => 'Laranja', 'en' => 'Orange']]);
    $green = colorPiece('cadeira-pita-verde');
    $grey = colorPiece('cadeira-pita-cinza');
    $draft = colorPiece('cadeira-pita-azul', ['is_published' => false]);

    $orange->syncColors([$green->id, $grey->id, $draft->id]);

    $response = $this->getJson('/api/v1/products/cadeira-pita-verde')->assertOk();
    expect($response->json('data.color'))->toBeNull()
        ->and(collect($response->json('data.colors'))->pluck('slug')->all())
        ->toBe(['cadeira-pita-laranja', 'cadeira-pita-cinza'])
        ->and($response->json('data.colors.0.color'))->toBe('Laranja');

    $this->getJson('/api/v1/products/cadeira-pita-laranja')
        ->assertJsonPath('data.color', 'Laranja')
        ->assertJsonCount(2, 'data.colors');

    $listed = collect($this->getJson('/api/v1/products?q=pita')->json('data'))->keyBy('slug');
    expect($listed->keys()->sort()->values()->all())
        ->toBe(['cadeira-pita-cinza', 'cadeira-pita-laranja', 'cadeira-pita-verde']);
    expect(collect($listed['cadeira-pita-cinza']['colors'])->pluck('slug')->all())
        ->toBe(['cadeira-pita-laranja', 'cadeira-pita-verde']);
});

it('keeps the group to exactly the chosen pieces and dissolves a group left with one piece', function () {
    $a = colorPiece('mesa-a');
    $b = colorPiece('mesa-b');
    $c = colorPiece('mesa-c');

    $a->syncColors([$b->id, $c->id]);
    $a->syncColors([$b->id]);

    expect($c->fresh()->color_group)->toBeNull()
        ->and($b->fresh()->color_group)->toBe($a->fresh()->color_group)
        ->and($a->fresh()->color_group)->not->toBeNull();

    $b->syncColors([]);

    expect($a->fresh()->color_group)->toBeNull()
        ->and($b->fresh()->color_group)->toBeNull();
});

it('sends no colors for a piece outside a group', function () {
    colorPiece('sofa-unico');

    $this->getJson('/api/v1/products/sofa-unico')
        ->assertJsonPath('data.color', null)
        ->assertJsonPath('data.colors', []);
});
