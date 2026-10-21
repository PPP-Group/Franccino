<?php

namespace App\Filament\Resources\NewsletterSubscribers\Tables;

use App\Filament\Exports\NewsletterSubscriberExporter;
use App\Models\NewsletterSubscriber;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ExportAction;
use Filament\Actions\ExportBulkAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

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
            ->filters([
                TernaryFilter::make('subscribed')
                    ->label(__('Subscription'))
                    ->placeholder(__('All'))
                    ->trueLabel(__('Subscribed'))
                    ->falseLabel(__('Unsubscribed'))
                    ->queries(
                        true: fn (Builder $query) => $query->whereNull('unsubscribed_at'),
                        false: fn (Builder $query) => $query->whereNotNull('unsubscribed_at'),
                    ),
            ])
            ->recordActions([
                // LGPD: whoever asks to leave the list is unsubscribed here; the record stays as proof of the request.
                Action::make('unsubscribe')
                    ->label(__('Unsubscribe'))
                    ->icon(Heroicon::OutlinedNoSymbol)
                    ->requiresConfirmation()
                    ->visible(fn (NewsletterSubscriber $record): bool => $record->unsubscribed_at === null)
                    ->authorize('update')
                    ->action(fn (NewsletterSubscriber $record) => $record->update(['unsubscribed_at' => now()])),
            ])
            ->headerActions([
                ExportAction::make()
                    ->exporter(NewsletterSubscriberExporter::class),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('unsubscribe')
                        ->label(__('Unsubscribe'))
                        ->icon(Heroicon::OutlinedNoSymbol)
                        ->requiresConfirmation()
                        ->authorize('update')
                        ->action(fn (EloquentCollection $records) => $records->each->update(['unsubscribed_at' => now()]))
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                    ExportBulkAction::make()
                        ->exporter(NewsletterSubscriberExporter::class),
                ]),
            ]);
    }
}
