<?php

namespace App\Filament\Resources\Stores\Tables;

use App\Enums\StoreType;
use App\Support\BrazilianStates;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class StoresTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label(__('Name'))
                    ->searchable(),
                TextColumn::make('type')
                    ->label(__('Type'))
                    ->badge()
                    ->formatStateUsing(fn (StoreType $state): string => $state->label()),
                TextColumn::make('city')
                    ->label(__('City'))
                    ->formatStateUsing(fn (string $state, $record): string => "{$state}/{$record->state}")
                    ->searchable(),
                TextColumn::make('phone')
                    ->label(__('Phone')),
                IconColumn::make('is_published')
                    ->label(__('Published'))
                    ->boolean(),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->label(__('Type'))
                    ->options(fn (): array => collect(StoreType::cases())
                        ->mapWithKeys(fn (StoreType $type) => [$type->value => $type->label()])
                        ->all()),
                SelectFilter::make('state')
                    ->label(__('State'))
                    ->options(BrazilianStates::options()),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
