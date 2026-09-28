<?php

namespace App\Filament\Resources\Launches;

use App\Filament\Resources\Launches\Pages\CreateLaunch;
use App\Filament\Resources\Launches\Pages\EditLaunch;
use App\Filament\Resources\Launches\Pages\ListLaunches;
use App\Filament\Resources\Launches\Schemas\LaunchForm;
use App\Filament\Resources\Launches\Tables\LaunchesTable;
use App\Models\Launch;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class LaunchResource extends Resource
{
    protected static ?string $model = Launch::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSparkles;

    public static function getNavigationGroup(): ?string
    {
        return __('Content');
    }

    public static function getNavigationSort(): ?int
    {
        return 2;
    }

    public static function form(Schema $schema): Schema
    {
        return LaunchForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return LaunchesTable::configure($table);
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
            'index' => ListLaunches::route('/'),
            'create' => CreateLaunch::route('/create'),
            'edit' => EditLaunch::route('/{record}/edit'),
        ];
    }
}
