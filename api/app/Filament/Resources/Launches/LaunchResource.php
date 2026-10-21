<?php

namespace App\Filament\Resources\Launches;

use App\Filament\RelationManagers\FilesRelationManager;
use App\Filament\RelationManagers\MediaLinksRelationManager;
use App\Filament\RelationManagers\OrderedProductsRelationManager;
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

    protected static bool $hasTitleCaseModelLabel = false;

    public static function getModelLabel(): string
    {
        return __('Launch');
    }

    public static function getPluralModelLabel(): string
    {
        return __('Launches');
    }

    public static function getNavigationGroup(): ?string
    {
        return __('Catalog');
    }

    public static function getNavigationSort(): ?int
    {
        return 3;
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
            OrderedProductsRelationManager::class,
            MediaLinksRelationManager::class,
            FilesRelationManager::class,
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
