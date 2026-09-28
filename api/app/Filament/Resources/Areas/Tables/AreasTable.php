<?php

namespace App\Filament\Resources\Areas\Tables;

use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AreasTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('key')
                    ->label(__('Key')),
                TextColumn::make('name')
                    ->label(__('Name'))
                    ->searchable(),
                TextColumn::make('brand_name')
                    ->label(__('Brand name')),
            ])
            ->recordActions([
                EditAction::make(),
            ]);
    }
}
