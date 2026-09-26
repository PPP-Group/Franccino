<?php

namespace App\Filament\Support;

use App\Support\Locales;
use Closure;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;

/**
 * Builds the pt/en tab set shared by every translatable form section, so each
 * resource declares its fields once instead of repeating the tab wiring.
 */
final class Translatable
{
    /** @param  Closure(string): array<int, mixed>  $fields */
    public static function tabs(Closure $fields, string $key = 'translations'): Tabs
    {
        return Tabs::make($key)
            ->tabs(array_map(
                fn (string $locale): Tab => Tab::make(Locales::label($locale))
                    ->key("{$key}-{$locale}")
                    ->schema($fields($locale)),
                Locales::all(),
            ))
            ->columnSpanFull();
    }
}
