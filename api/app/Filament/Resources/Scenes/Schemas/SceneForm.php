<?php

namespace App\Filament\Resources\Scenes\Schemas;

use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use App\Support\Locales;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

/**
 * Scene with clickable points (banco de ideias, idea 7): the photo, then one point per piece, placed by its position
 * on the photo in percent, so it lands on the same spot at any screen size.
 */
class SceneForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("title.{$locale}")
                        ->label(__('Title'))
                        ->required($locale === Locales::default())
                        ->maxLength(160),
                ]),
                ...CommonFields::publication(),
                SpatieMediaLibraryFileUpload::make('image')
                    ->label(__('Image'))
                    ->collection('image')
                    ->image()
                    ->required(),
                Repeater::make('hotspots')
                    ->label(__('Points'))
                    ->relationship()
                    ->orderColumn('sort_order')
                    ->reorderable()
                    ->columns(3)
                    ->defaultItems(0)
                    ->addActionLabel(__('Add point'))
                    ->schema([
                        Select::make('product_id')
                            ->label(__('Product'))
                            ->relationship('product', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        TextInput::make('x')
                            ->label(__('Across (%)'))
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->step(0.5)
                            ->required(),
                        TextInput::make('y')
                            ->label(__('Down (%)'))
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->step(0.5)
                            ->required(),
                    ]),
            ]);
    }
}
