<?php

namespace App\Filament\Resources\Launches\Schemas;

use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use App\Support\Locales;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class LaunchForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("title.{$locale}")
                        ->label(__('Title'))
                        ->required($locale === Locales::default())
                        ->maxLength(160)
                        ->live(onBlur: true)
                        ->afterStateUpdated(fn (Get $get, Set $set, ?string $state) => blank($get("slug.{$locale}"))
                            ? $set("slug.{$locale}", Str::slug((string) $state))
                            : null),
                    CommonFields::slug($locale, 'launches'),
                    Textarea::make("summary.{$locale}")
                        ->label(__('Summary')),
                    RichEditor::make("description.{$locale}")
                        ->label(__('Description')),
                ]),
                TextInput::make('year')
                    ->label(__('Year'))
                    ->required()
                    ->numeric(),
                Select::make('products')
                    ->label(__('Products'))
                    ->relationship('products', 'name')
                    ->multiple()
                    ->searchable()
                    ->preload(),
                ...CommonFields::publication(),
                Translatable::tabs(fn (string $locale): array => CommonFields::seo($locale), key: 'seo'),
                SpatieMediaLibraryFileUpload::make('cover')
                    ->label(__('Cover'))
                    ->collection('cover')
                    ->image(),
                SpatieMediaLibraryFileUpload::make('gallery')
                    ->label(__('Gallery'))
                    ->collection('gallery')
                    ->image()
                    ->multiple()
                    ->reorderable(),
            ]);
    }
}
