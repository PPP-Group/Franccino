<?php

namespace App\Filament\Resources\Lines\Schemas;

use App\Filament\Support\Translatable;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class LineForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->label(__('Name'))
                    ->required()
                    ->maxLength(160)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (Get $get, Set $set, ?string $state) => blank($get('slug'))
                        ? $set('slug', Str::slug((string) $state))
                        : null),
                TextInput::make('slug')
                    ->label(__('Slug'))
                    ->required()
                    ->maxLength(160)
                    ->alphaDash()
                    ->unique(table: 'lines', ignoreRecord: true),
                Select::make('designer_id')
                    ->label(__('Designer'))
                    ->relationship('designer', 'name')
                    ->searchable(),
                Translatable::tabs(fn (string $locale): array => [
                    Textarea::make("description.{$locale}")
                        ->label(__('Description')),
                ]),
            ]);
    }
}
