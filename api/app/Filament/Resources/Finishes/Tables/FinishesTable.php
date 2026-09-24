<?php

namespace App\Filament\Resources\Finishes\Tables;

use App\Models\FinishGroup;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class FinishesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                SpatieMediaLibraryImageColumn::make('swatch')
                    ->label(__('Swatch'))
                    ->collection('swatch'),
                TextColumn::make('name')
                    ->label(__('Name'))
                    ->searchable(),
                TextColumn::make('group.name')
                    ->label(__('Finish group')),
                TextColumn::make('code')
                    ->label(__('Code')),
            ])
            ->filters([
                SelectFilter::make('finish_group_id')
                    ->label(__('Finish group'))
                    ->options(fn (): array => FinishGroup::query()->pluck('name', 'id')->all()),
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
