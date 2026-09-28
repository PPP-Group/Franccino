<?php

namespace App\Filament\Exports;

use App\Enums\ContactProfession;
use App\Enums\ContactType;
use App\Models\ContactMessage;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class ContactMessageExporter extends Exporter
{
    protected static ?string $model = ContactMessage::class;

    /**
     * @return array<ExportColumn>
     */
    public static function getColumns(): array
    {
        return [
            ExportColumn::make('created_at')
                ->label(__('Date')),
            ExportColumn::make('type')
                ->label(__('Type'))
                ->formatStateUsing(fn (ContactType $state): string => $state->label()),
            ExportColumn::make('name')
                ->label(__('Name')),
            ExportColumn::make('email')
                ->label(__('Email')),
            ExportColumn::make('phone')
                ->label(__('Phone')),
            ExportColumn::make('company')
                ->label(__('Company')),
            ExportColumn::make('profession')
                ->label(__('Profession'))
                ->formatStateUsing(fn (?ContactProfession $state): ?string => $state?->label()),
            ExportColumn::make('city')
                ->label(__('City')),
            ExportColumn::make('state')
                ->label(__('State')),
            ExportColumn::make('message')
                ->label(__('Message')),
            ExportColumn::make('product.name')
                ->label(__('Product')),
            ExportColumn::make('locale')
                ->label(__('Language')),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        $body = trans_choice(
            '1 contact message exported.|:count contact messages exported.',
            $export->successful_rows,
            ['count' => number_format($export->successful_rows)],
        );

        if ($failedRowsCount = $export->getFailedRowsCount()) {
            $body .= ' '.trans_choice(
                '1 row failed to export.|:count rows failed to export.',
                $failedRowsCount,
                ['count' => number_format($failedRowsCount)],
            );
        }

        return $body;
    }
}
