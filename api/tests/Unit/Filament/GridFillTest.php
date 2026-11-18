<?php

use App\Filament\Support\GridFill;

it('spreads the cards so the last row has no empty slot', function (int $count, int $columns, int $lastSpan) {
    expect(GridFill::for($count))->toBe(['columns' => $columns, 'last_span' => $lastSpan]);
})->with([
    'three fit in one row' => [3, 3, 1],
    'eight in two rows of four' => [8, 4, 1],
    'six in two rows of three' => [6, 3, 1],
    'seven: the last one fills the row' => [7, 4, 2],
]);
