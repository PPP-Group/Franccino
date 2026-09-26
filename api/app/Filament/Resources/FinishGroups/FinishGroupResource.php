<?php

namespace App\Filament\Resources\FinishGroups;

use App\Filament\Resources\FinishGroups\Pages\CreateFinishGroup;
use App\Filament\Resources\FinishGroups\Pages\EditFinishGroup;
use App\Filament\Resources\FinishGroups\Pages\ListFinishGroups;
use App\Filament\Resources\FinishGroups\Schemas\FinishGroupForm;
use App\Filament\Resources\FinishGroups\Tables\FinishGroupsTable;
use App\Models\FinishGroup;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FinishGroupResource extends Resource
{
    protected static ?string $model = FinishGroup::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSquares2x2;

    public static function getNavigationGroup(): ?string
    {
        return __('Catalog');
    }

    public static function getNavigationSort(): ?int
    {
        return 5;
    }

    public static function form(Schema $schema): Schema
    {
        return FinishGroupForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FinishGroupsTable::configure($table);
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
            'index' => ListFinishGroups::route('/'),
            'create' => CreateFinishGroup::route('/create'),
            'edit' => EditFinishGroup::route('/{record}/edit'),
        ];
    }
}
