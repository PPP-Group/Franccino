<?php

namespace App\Filament\Resources\NewsletterSubscribers\Tables;

use App\Filament\Exports\NewsletterSubscriberExporter;
use App\Models\NewsletterSubscriber;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ExportAction;
use Filament\Actions\ExportBulkAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class NewsletterSubscribersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('email')
                    ->label(__('Email'))
                    ->searchable(),
                TextColumn::make('name')
                    ->label(__('Name'))
                    ->searchable()
                    ->placeholder('—'),
                TextColumn::make('locale')
                    ->label(__('Language')),
                TextColumn::make('source')
                    ->label(__('Source'))
                    ->placeholder('—'),
                IconColumn::make('consent_at')
                    ->label(__('Consented'))
                    ->boolean()
                    ->getStateUsing(fn (NewsletterSubscriber $record): bool => filled($record->consent_at)),
                TextColumn::make('unsubscribed_at')
                    ->label(__('Unsubscribed at'))
                    ->dateTime()
                    ->placeholder('—'),
            ])
            ->defaultSort('created_at', 'desc')
            ->headerActions([
                ExportAction::make()
                    ->exporter(NewsletterSubscriberExporter::class),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                    ExportBulkAction::make()
                        ->exporter(NewsletterSubscriberExporter::class),
                ]),
            ]);
    }
}
