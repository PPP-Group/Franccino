<?php

namespace App\Filament\Resources\ConsentRecords;

use App\Filament\Resources\ConsentRecords\Pages\ListConsentRecords;
use App\Filament\Resources\ConsentRecords\Tables\ConsentRecordsTable;
use App\Models\ConsentRecord;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ConsentRecordResource extends Resource
{
    protected static ?string $model = ConsentRecord::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShieldCheck;

    public static function getModelLabel(): string
    {
        return __('Cookie consent');
    }

    public static function getPluralModelLabel(): string
    {
        return __('Cookie consents');
    }

    public static function getNavigationGroup(): ?string
    {
        return __('Relationship');
    }

    public static function table(Table $table): Table
    {
        return ConsentRecordsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListConsentRecords::route('/'),
        ];
    }
}
