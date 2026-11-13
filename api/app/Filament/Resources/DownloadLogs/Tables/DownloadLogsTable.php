<?php

namespace App\Filament\Resources\DownloadLogs\Tables;

use App\Models\DownloadLog;
use App\Models\Launch;
use App\Models\Product;
use Filament\Forms\Components\DatePicker;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/**
 * Download logs are read-only in the panel (Ruling from the task brief): no create,
 * edit or delete affordances, only listing and filtering what the API already recorded.
 */
class DownloadLogsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['productFile.product', 'productFile.designer', 'productFile.launch', 'downloadLead']))
            ->columns([
                TextColumn::make('created_at')
                    ->label(__('Date'))
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('owner')
                    ->label(__('Product, designer or launch'))
                    ->state(fn (DownloadLog $log): ?string => self::ownerName($log)),
                TextColumn::make('productFile.title')
                    ->label(__('File')),
                // Cadastro antes do download (item 22 da revisão de 12/11/2026): nome, e-mail e perfil de quem baixou.
                TextColumn::make('downloadLead.first_name')
                    ->label(__('Who downloaded'))
                    ->state(fn (DownloadLog $log): ?string => $log->downloadLead
                        ? trim($log->downloadLead->first_name.' '.$log->downloadLead->last_name)
                        : null)
                    ->description(fn (DownloadLog $log): ?string => $log->downloadLead?->email)
                    ->searchable(['first_name', 'last_name', 'email']),
                TextColumn::make('downloadLead.profile')
                    ->label(__('Profile'))
                    ->formatStateUsing(fn (?string $state): ?string => match ($state) {
                        'professional' => __('Professional'),
                        'client' => __('Private client'),
                        default => $state,
                    }),
                TextColumn::make('locale')
                    ->label(__('Language')),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('product_id')
                    ->label(__('Product'))
                    ->options(fn (): array => Product::query()->pluck('name', 'id')->all()),
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
            ]);
    }

    /** The product, designer or launch whose file was downloaded (PPP-109). */
    private static function ownerName(DownloadLog $log): ?string
    {
        $owner = $log->productFile?->owner();

        return $owner instanceof Launch ? $owner->title : $owner?->name;
    }
}
