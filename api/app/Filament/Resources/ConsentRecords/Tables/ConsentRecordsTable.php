<?php

namespace App\Filament\Resources\ConsentRecords\Tables;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

/**
 * Cookie consents are read-only in the panel: the site records them, the panel only lists and filters
 * (proof of what each visitor accepted and when, LGPD).
 */
class ConsentRecordsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')
                    ->label(__('Date'))
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('choice')
                    ->label(__('Choice'))
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => $state === 'granted' ? __('Accepted') : __('Declined')),
                TextColumn::make('policy_version')
                    ->label(__('Policy version')),
                TextColumn::make('locale')
                    ->label(__('Language')),
                TextColumn::make('visitor_id')
                    ->label(__('Visitor'))
                    ->limit(8)
                    ->searchable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('choice')
                    ->label(__('Choice'))
                    ->options(['granted' => __('Accepted'), 'denied' => __('Declined')]),
            ]);
    }
}
