<?php

namespace App\Support\WordPress;

/**
 * Turns the free-text measurements of the current site ("600L X 600P X 750A", "67L x 55,5P x 80A (cm)",
 * "110Ø x 74,5A (cm)") into one `dimensions` variant in millimetres. Ranges ("400 a 750") and text it
 * cannot read return `null`: nothing is guessed, the importer reports the original text instead.
 */
final class DimensionParser
{
    private const KEYS = [
        'l' => 'width',
        'p' => 'depth',
        'a' => 'height',
        'h' => 'height',
        'ø' => 'diameter',
        'd' => 'diameter',
        'ass' => 'seat_height',
    ];

    /** Unlabelled values ("80 x 50 x 50") follow the site's usual order: width, depth, height. */
    private const ORDER = ['width', 'depth', 'height'];

    /**
     * @return array{width: int|null, depth: int|null, height: int|null, seat_height: int|null, diameter: int|null}|null
     */
    public static function parse(string $text): ?array
    {
        $normalized = mb_strtolower(trim($text));
        $normalized = str_replace(['×', '⌀'], ['x', 'ø'], $normalized);

        if ($normalized === '' || preg_match('/\d\s*(a|até|-|–)\s*\d/u', $normalized)) {
            return null;
        }

        $unit = match (true) {
            str_contains($normalized, 'mm') => 'mm',
            str_contains($normalized, 'cm') => 'cm',
            default => null,
        };
        $normalized = (string) preg_replace('/\((?:mm|cm)\)|\b(?:mm|cm)\b/u', ' ', $normalized);

        preg_match_all('/(\d+(?:[.,]\d+)?)\s*(ass|ø|[lpahd])?/u', $normalized, $matches, PREG_SET_ORDER);
        if ($matches === []) {
            return null;
        }

        $values = ['width' => null, 'depth' => null, 'height' => null, 'seat_height' => null, 'diameter' => null];
        $unlabelled = 0;
        $numbers = [];
        foreach ($matches as $match) {
            $number = (float) str_replace(',', '.', $match[1]);
            $letter = $match[2] ?? '';
            $key = $letter !== '' ? self::KEYS[$letter] : (self::ORDER[$unlabelled++] ?? null);
            if ($key === null || $values[$key] !== null) {
                return null;
            }
            $values[$key] = $number;
            $numbers[] = $number;
        }

        $unit ??= max($numbers) >= 250 ? 'mm' : 'cm';
        $factor = $unit === 'cm' ? 10 : 1;

        return array_map(
            static fn (?float $value): ?int => $value === null ? null : (int) round($value * $factor),
            $values,
        );
    }
}
