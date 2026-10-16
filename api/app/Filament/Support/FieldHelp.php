<?php

namespace App\Filament\Support;

use App\Support\Locales;
use Filament\Forms\Components\Field;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Str;

/**
 * Short hint shown under a panel field, looked up in `lang/pt_BR/panel-help.php` by "<model>.<field>" and then by
 * "<field>" alone. Translatable fields ("name.pt", "name.en") only get it on the default-language tab, so the English
 * tab stays clean (it has its own note, see Translatable::tabs).
 */
final class FieldHelp
{
    public static function for(Field $field): ?string
    {
        $name = $field->getName();
        $locale = Str::contains($name, '.') ? Str::afterLast($name, '.') : null;

        if ($locale !== null && in_array($locale, Locales::all(), true) && $locale !== Locales::default()) {
            return null;
        }

        $base = Str::before($name, '.');

        foreach (self::keys($base, $field->getModel()) as $key) {
            if (Lang::has("panel-help.{$key}")) {
                return __("panel-help.{$key}");
            }
        }

        return null;
    }

    /** @return list<string> */
    private static function keys(string $field, ?string $model): array
    {
        $keys = [];

        if ($model !== null) {
            $keys[] = Str::snake(class_basename($model)).'.'.$field;
        }

        $keys[] = $field;

        return $keys;
    }
}
