<?php

namespace App\Filament\Resources\Lines;

use App\Filament\Resources\Lines\Pages\CreateLine;
use App\Filament\Resources\Lines\Pages\EditLine;
use App\Filament\Resources\Lines\Pages\ListLines;
use App\Filament\Resources\Lines\Schemas\LineForm;
use App\Filament\Resources\Lines\Tables\LinesTable;
use App\Models\Line;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class LineResource extends Resource
{
    protected static ?string $model = Line::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleGroup;

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
        return LineForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return LinesTable::configure($table);
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
            'index' => ListLines::route('/'),
            'create' => CreateLine::route('/create'),
            'edit' => EditLine::route('/{record}/edit'),
        ];
    }
}
