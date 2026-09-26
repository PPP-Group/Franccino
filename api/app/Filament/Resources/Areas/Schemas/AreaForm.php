<?php

namespace App\Filament\Resources\Areas\Schemas;

use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use App\Support\Locales;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class AreaForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('brand_name')
                    ->label(__('Brand name'))
                    ->required()
                    ->maxLength(255),
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("name.{$locale}")
                        ->label(__('Name'))
                        ->required($locale === Locales::default())
                        ->maxLength(160),
                    Textarea::make("description.{$locale}")
                        ->label(__('Description')),
                ]),
                Translatable::tabs(fn (string $locale): array => CommonFields::seo($locale), key: 'seo'),
                SpatieMediaLibraryFileUpload::make('cover')
                    ->label(__('Cover'))
                    ->collection('cover')
                    ->image(),
            ]);
    }
}
