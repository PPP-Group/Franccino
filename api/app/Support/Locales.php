<?php

namespace App\Support;

final class Locales
{
    private const LABELS = ['pt' => 'Português', 'en' => 'English'];

    /** @return list<string> */
    public static function all(): array
    {
        return config('franccino.locales') ?: ['pt'];
    }

    public static function default(): string
    {
        return self::all()[0];
    }

    public static function isSupported(?string $locale): bool
    {
        return $locale !== null && in_array($locale, self::all(), true);
    }

    public static function label(string $locale): string
    {
        return self::LABELS[$locale] ?? strtoupper($locale);
    }
}
