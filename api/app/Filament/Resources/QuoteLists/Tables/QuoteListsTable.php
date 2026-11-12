<?php

namespace App\Filament\Resources\QuoteLists\Tables;

use App\Models\QuoteList;
use Filament\Actions\Action;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/** Só consulta: a lista é criada pelo site; aqui a equipe vê quando chegou, quantas peças tem e abre no site. */
class QuoteListsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with('contactMessage'))
            ->columns([
                TextColumn::make('created_at')
                    ->label(__('Date'))
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('code')
                    ->label(__('Code'))
                    ->searchable()
                    ->copyable(),
                TextColumn::make('pieces')
                    ->label(__('Pieces'))
                    ->state(fn (QuoteList $list): int => $list->pieceCount()),
                TextColumn::make('contactMessage.name')
                    ->label(__('Contact'))
                    ->description(fn (QuoteList $list): ?string => $list->contactMessage?->email),
                TextColumn::make('locale')
                    ->label(__('Language')),
                TextColumn::make('expires_at')
                    ->label(__('Expires at'))
                    ->date()
                    ->color(fn (QuoteList $list): ?string => $list->expires_at->isPast() ? 'danger' : null)
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                Action::make('open')
                    ->label(__('Open on the site'))
                    ->icon(Heroicon::OutlinedArrowTopRightOnSquare)
                    ->url(fn (QuoteList $list): string => $list->siteUrl())
                    ->openUrlInNewTab()
                    ->visible(fn (QuoteList $list): bool => $list->expires_at->isFuture()),
            ]);
    }
}
