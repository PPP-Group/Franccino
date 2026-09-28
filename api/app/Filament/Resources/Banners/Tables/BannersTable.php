<?php

namespace App\Filament\Resources\Banners\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class BannersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                SpatieMediaLibraryImageColumn::make('image')
                    ->label(__('Image'))
                    ->collection('image'),
                TextColumn::make('title')
                    ->label(__('Title'))
                    ->searchable(),
                TextColumn::make('starts_at')
                    ->label(__('Window'))
                    ->formatStateUsing(fn ($record): string => collect([
                        $record->starts_at?->toFormattedDateString(),
                        $record->ends_at?->toFormattedDateString(),
                    ])->filter()->implode(' – ')),
                IconColumn::make('is_published')
                    ->label(__('Published'))
                    ->boolean(),
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
