<?php

namespace App\Filament\Resources\Designers;

use App\Filament\RelationManagers\MediaLinksRelationManager;
use App\Filament\Resources\Designers\Pages\CreateDesigner;
use App\Filament\Resources\Designers\Pages\EditDesigner;
use App\Filament\Resources\Designers\Pages\ListDesigners;
use App\Filament\Resources\Designers\Schemas\DesignerForm;
use App\Filament\Resources\Designers\Tables\DesignersTable;
use App\Models\Designer;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class DesignerResource extends Resource
{
    protected static ?string $model = Designer::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedIdentification;

    public static function getNavigationGroup(): ?string
    {
        return __('Content');
    }

    public static function getNavigationSort(): ?int
    {
        return 4;
    }

    public static function form(Schema $schema): Schema
    {
        return DesignerForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DesignersTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            MediaLinksRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListDesigners::route('/'),
            'create' => CreateDesigner::route('/create'),
            'edit' => EditDesigner::route('/{record}/edit'),
        ];
    }
}
