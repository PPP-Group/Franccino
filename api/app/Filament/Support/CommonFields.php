<?php

namespace App\Filament\Support;

use App\Support\Locales;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;

/**
 * Form fields repeated across catalog and editorial resources, so the
 * publication toggle, SEO fields and slug behaviour stay consistent everywhere.
 */
final class CommonFields
{
    /** @return array<int, mixed> */
    public static function publication(): array
    {
        return [
            Toggle::make('is_published')
                ->label(__('Published')),
        ];
    }

    /** @return array<int, mixed> */
    public static function seo(string $locale): array
    {
        return [
            TextInput::make("seo_title.{$locale}")
                ->label(__('SEO title'))
                ->maxLength(70),
            Textarea::make("seo_description.{$locale}")
                ->label(__('SEO description'))
                ->maxLength(160),
        ];
    }

    /**
     * A slug input, unique per locale and required only for the default locale.
     * `$source` names the field it is generated from (wired by the caller via
     * `->live(onBlur: true)->afterStateUpdated(...)` on that field).
     */
    public static function slug(string $locale, string $table, string $source = 'name'): TextInput
    {
        return TextInput::make("slug.{$locale}")
            ->label(__('Slug'))
            ->required($locale === Locales::default())
            ->maxLength(160)
            ->alphaDash()
            ->unique(table: $table, column: "slug->{$locale}", ignoreRecord: true);
    }
}
