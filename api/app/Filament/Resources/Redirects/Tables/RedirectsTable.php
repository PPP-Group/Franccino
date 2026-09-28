<?php

namespace App\Filament\Resources\Redirects\Tables;

use App\Enums\RedirectStatus;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class RedirectsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('from_path')
                    ->label(__('From path'))
                    ->searchable(),
                TextColumn::make('to_path')
                    ->label(__('To path'))
                    ->searchable()
                    ->placeholder('—'),
                TextColumn::make('status_code')
                    ->label(__('Status code'))
                    ->badge()
                    ->formatStateUsing(fn (RedirectStatus $state): string => $state->label()),
                IconColumn::make('is_active')
                    ->label(__('Active'))
                    ->boolean(),
            ])
            ->searchable(['from_path', 'to_path'])
            ->filters([
                SelectFilter::make('status_code')
                    ->label(__('Status code'))
                    ->options(fn (): array => collect(RedirectStatus::cases())
                        ->mapWithKeys(fn (RedirectStatus $status) => [$status->value => $status->label()])
                        ->all()),
                TernaryFilter::make('is_active')
                    ->label(__('Active')),
            ])
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
