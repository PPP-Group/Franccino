<?php

namespace App\Filament\Resources\Products\RelationManagers;

use App\Filament\RelationManagers\Concerns\AttachesInOrder;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

/** Finishes of a piece, in the order its finish picker shows them (grouped by finish group on the site). */
class FinishesRelationManager extends RelationManager
{
    use AttachesInOrder;

    protected static string $relationship = 'finishes';

    public static function getTitle(Model $ownerRecord, string $pageClass): string
    {
        return __('Finishes');
    }

    public function table(Table $table): Table
    {
        return $this->orderedTable($table, 'name')
            ->description(__('Drag the finishes into the order the site shows them.'))
            ->columns([
                SpatieMediaLibraryImageColumn::make('swatch')
                    ->label(__('Swatch'))
                    ->collection('swatch')
                    ->conversion('w480'),
                TextColumn::make('name')
                    ->label(__('Name')),
                TextColumn::make('group.name')
                    ->label(__('Group')),
                TextColumn::make('code')
                    ->label(__('Code')),
            ]);
    }
}
