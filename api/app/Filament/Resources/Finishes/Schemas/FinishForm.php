<?php

namespace App\Filament\Resources\Finishes\Schemas;

use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use App\Support\Locales;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class FinishForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('finish_group_id')
                    ->label(__('Finish group'))
                    ->relationship('group', 'name')
                    ->required(),
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("name.{$locale}")
                        ->label(__('Name'))
                        ->required($locale === Locales::default())
                        ->maxLength(160),
                    Textarea::make("description.{$locale}")
                        ->label(__('Description')),
                ]),
                TextInput::make('code')
                    ->label(__('Code'))
                    ->maxLength(255),
                SpatieMediaLibraryFileUpload::make('swatch')
                    ->label(__('Swatch'))
                    ->collection('swatch')
                    ->image(),
                ...CommonFields::publication(),
            ]);
    }
}
