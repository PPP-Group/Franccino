<?php

namespace App\Filament\Resources\Pages\Tables;

use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

/**
 * Pages are a fixed, seeded set: no create or delete action (see Ruling R2), the
 * panel can only edit them.
 */
class PagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('key')
                    ->label(__('Key'))
                    ->searchable(),
                TextColumn::make('title')
                    ->label(__('Title')),
                TextColumn::make('updated_at')
                    ->label(__('Updated at'))
                    ->dateTime(),
            ])
            ->defaultSort('key')
            ->recordActions([
                EditAction::make(),
            ]);
    }
}
