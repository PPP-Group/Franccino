<?php

namespace App\Filament\Resources\DownloadLogs;

use App\Filament\Resources\DownloadLogs\Pages\ListDownloadLogs;
use App\Filament\Resources\DownloadLogs\Tables\DownloadLogsTable;
use App\Models\DownloadLog;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class DownloadLogResource extends Resource
{
    protected static ?string $model = DownloadLog::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowDownTray;

    public static function getNavigationGroup(): ?string
    {
        return __('Relationship');
    }

    public static function table(Table $table): Table
    {
        return DownloadLogsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListDownloadLogs::route('/'),
        ];
    }
}
