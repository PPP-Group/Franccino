<?php

namespace App\Support;

use App\Support\Concerns\TranslatableAttributes;
use Illuminate\Database\Eloquent\Model;

final class Localized
{
    public static function value(Model $model, string $attribute, ?string $locale = null): ?string
    {
        $locale ??= app(ContentLocale::class)->current();
        $value = self::raw($model, $attribute, $locale);

        if ($value === null && $locale !== Locales::default()) {
            $value = self::raw($model, $attribute, Locales::default());
        }

        return $value;
    }

    /** @param list<string> $attributes */
    public static function missing(Model $model, array $attributes, ?string $locale = null): bool
    {
        $locale ??= app(ContentLocale::class)->current();

        foreach ($attributes as $attribute) {
            if (self::raw($model, $attribute, $locale) === null) {
                return true;
            }
        }

        return false;
    }

    /** @param array<string, mixed>|null $value */
    public static function array(?array $value, ?string $locale = null): ?string
    {
        if ($value === null) {
            return null;
        }

        $locale ??= app(ContentLocale::class)->current();
        $text = $value[$locale] ?? null;

        if (blank($text)) {
            $text = $value[Locales::default()] ?? null;
        }

        return blank($text) ? null : (string) $text;
    }

    private static function raw(Model $model, string $attribute, string $locale): ?string
    {
        /** @var Model&TranslatableAttributes $model */
        $value = $model->getTranslation($attribute, $locale, false);

        return blank($value) ? null : (string) $value;
    }
}
