<?php

namespace App\Filament\Resources\Finishes;

use App\Filament\Resources\Finishes\Pages\CreateFinish;
use App\Filament\Resources\Finishes\Pages\EditFinish;
use App\Filament\Resources\Finishes\Pages\ListFinishes;
use App\Filament\Resources\Finishes\Schemas\FinishForm;
use App\Filament\Resources\Finishes\Tables\FinishesTable;
use App\Models\Finish;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FinishResource extends Resource
{
    protected static ?string $model = Finish::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSwatch;

    public static function getNavigationGroup(): ?string
    {
        return __('Catalog');
    }

    public static function getNavigationSort(): ?int
    {
        return 4;
    }

    public static function form(Schema $schema): Schema
    {
        return FinishForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FinishesTable::configure($table);
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
            'index' => ListFinishes::route('/'),
            'create' => CreateFinish::route('/create'),
            'edit' => EditFinish::route('/{record}/edit'),
        ];
    }
}
