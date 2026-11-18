<?php

namespace App\Filament\Support;

/**
 * Cards in a grid with no empty slot at the end (revisão de 17/11/2026: "8 atalhos em 6 + 2 deixa 4 buracos"). Picks
 * the column count that divides the number of cards and, when none does, makes the last card span what is left.
 */
class GridFill
{
    /** @return array{columns: int, last_span: int} */
    public static function for(int $count, int $max = 4): array
    {
        if ($count <= $max) {
            return ['columns' => max($count, 1), 'last_span' => 1];
        }
        foreach ([$max, $max - 1, $max + 1] as $columns) {
            if ($columns >= 2 && $count % $columns === 0) {
                return ['columns' => $columns, 'last_span' => 1];
            }
        }

        return ['columns' => $max, 'last_span' => $max - ($count % $max) + 1];
    }
}
