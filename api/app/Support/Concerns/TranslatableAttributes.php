<?php

namespace App\Support\Concerns;

/**
 * Minimal contract describing the subset of Spatie\Translatable\HasTranslations
 * used by App\Support\Localized, so static analysis can type-check calls to it
 * on a generic Eloquent model without relying on a trait as a type (traits are
 * not valid PHPDoc types for PHPStan).
 */
interface TranslatableAttributes
{
    public function getTranslation(string $key, string $locale, bool $useFallbackLocale = true): mixed;
}
