<?php

use App\Models\Product;

it('links the Pitá chairs that only change colour, and leaves a group made in the panel alone', function () {
    $piece = fn (string $slug) => Product::factory()->create(['slug' => ['pt' => $slug]]);
    $grey = $piece('cadeira-pita-com-braco');
    $green = $piece('cadeira-pita-com-braco-2');
    $blue = $piece('cadeira-pita-sem-braco');
    $orange = $piece('cadeira-pita-sem-braco-2');
    $other = $piece('cadeira-aura');
    $blue->syncColors([$other->id]);

    (require database_path('migrations/2026_11_16_110000_link_pita_colors.php'))->up();

    expect($grey->fresh()->color_group)->not->toBeNull()
        ->and($green->fresh()->color_group)->toBe($grey->fresh()->color_group)
        ->and($orange->fresh()->color_group)->toBeNull()
        ->and($blue->fresh()->color_group)->toBe($other->fresh()->color_group);
});
