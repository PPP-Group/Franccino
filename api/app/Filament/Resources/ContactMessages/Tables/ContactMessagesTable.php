<?php

namespace App\Filament\Resources\ContactMessages\Tables;

use App\Enums\ContactType;
use App\Filament\Exports\ContactMessageExporter;
use App\Models\ContactMessage;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ExportAction;
use Filament\Actions\ExportBulkAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\DatePicker;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ContactMessagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')
                    ->label(__('Date'))
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('type')
                    ->label(__('Type'))
                    ->badge()
                    ->formatStateUsing(fn (ContactType $state): string => $state->label()),
                TextColumn::make('name')
                    ->label(__('Name'))
                    ->searchable(),
                TextColumn::make('email')
                    ->label(__('Email'))
                    ->searchable(),
                TextColumn::make('product.name')
                    ->label(__('Product'))
                    ->placeholder('—'),
                IconColumn::make('read_at')
                    ->label(__('Read'))
                    ->boolean()
                    ->getStateUsing(fn (ContactMessage $record): bool => filled($record->read_at)),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('type')
                    ->label(__('Type'))
                    ->options(fn (): array => collect(ContactType::cases())
                        ->mapWithKeys(fn (ContactType $type) => [$type->value => $type->label()])
                        ->all()),
                TernaryFilter::make('read_at')
                    ->label(__('Read'))
                    ->queries(
                        true: fn (Builder $query): Builder => $query->whereNotNull('read_at'),
                        false: fn (Builder $query): Builder => $query->whereNull('read_at'),
                    ),
                Filter::make('created_at')
                    ->label(__('Period'))
                    ->schema([
                        DatePicker::make('from')
                            ->label(__('From')),
                        DatePicker::make('until')
                            ->label(__('Until')),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['from'] ?? null, fn (Builder $query, string $date): Builder => $query->whereDate('created_at', '>=', $date))
                            ->when($data['until'] ?? null, fn (Builder $query, string $date): Builder => $query->whereDate('created_at', '<=', $date));
                    }),
            ])
            ->recordActions([
                ViewAction::make(),
                Action::make('markAsRead')
                    ->label(__('Mark as read'))
                    ->icon(Heroicon::OutlinedEnvelopeOpen)
                    ->visible(fn (ContactMessage $record): bool => blank($record->read_at))
                    ->action(fn (ContactMessage $record) => $record->update(['read_at' => now()])),
                DeleteAction::make(),
            ])
            ->headerActions([
                ExportAction::make()
                    ->exporter(ContactMessageExporter::class),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                    ExportBulkAction::make()
                        ->exporter(ContactMessageExporter::class),
                ]),
            ]);
    }
}
