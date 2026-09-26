<?php

namespace App\Filament\Resources\Categories\Schemas;

use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use App\Support\Locales;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("name.{$locale}")
                        ->label(__('Name'))
                        ->required($locale === Locales::default())
                        ->maxLength(160)
                        ->live(onBlur: true)
                        ->afterStateUpdated(fn (Get $get, Set $set, ?string $state) => blank($get("slug.{$locale}"))
                            ? $set("slug.{$locale}", Str::slug((string) $state))
                            : null),
                    TextInput::make("singular_name.{$locale}")
                        ->label(__('Singular name'))
                        ->required($locale === Locales::default())
                        ->maxLength(160),
                    CommonFields::slug($locale, 'categories'),
                    Textarea::make("description.{$locale}")
                        ->label(__('Description')),
                ]),
                ...CommonFields::publication(),
                Translatable::tabs(fn (string $locale): array => CommonFields::seo($locale), key: 'seo'),
                SpatieMediaLibraryFileUpload::make('cover')
                    ->label(__('Cover'))
                    ->collection('cover')
                    ->image(),
            ]);
    }
}
