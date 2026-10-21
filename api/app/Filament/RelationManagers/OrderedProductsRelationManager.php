<?php

namespace App\Filament\RelationManagers;

use App\Filament\RelationManagers\Concerns\AttachesInOrder;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

/** Pieces of a collection or a launch, in the order the site shows them. */
class OrderedProductsRelationManager extends RelationManager
{
    use AttachesInOrder;

    protected static string $relationship = 'products';

    public static function getTitle(Model $ownerRecord, string $pageClass): string
    {
        return __('Products');
    }

    public function table(Table $table): Table
    {
        return $this->orderedTable($table, 'name')
            ->description(__('Drag the pieces into the order the site shows them.'))
            ->columns([
                SpatieMediaLibraryImageColumn::make('cover')
                    ->label(__('Cover'))
                    ->collection('cover')
                    ->conversion('w480'),
                TextColumn::make('name')
                    ->label(__('Name')),
                TextColumn::make('category.name')
                    ->label(__('Category')),
            ]);
    }
}
