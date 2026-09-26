<?php

namespace App\Filament\Exports;

use App\Models\NewsletterSubscriber;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class NewsletterSubscriberExporter extends Exporter
{
    protected static ?string $model = NewsletterSubscriber::class;

    /**
     * @return array<ExportColumn>
     */
    public static function getColumns(): array
    {
        return [
            ExportColumn::make('email')
                ->label(__('Email')),
            ExportColumn::make('name')
                ->label(__('Name')),
            ExportColumn::make('locale')
                ->label(__('Language')),
            ExportColumn::make('source')
                ->label(__('Source')),
            ExportColumn::make('consent_at')
                ->label(__('Consented at')),
            ExportColumn::make('unsubscribed_at')
                ->label(__('Unsubscribed at')),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        $body = trans_choice(
            '1 subscriber exported.|:count subscribers exported.',
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
