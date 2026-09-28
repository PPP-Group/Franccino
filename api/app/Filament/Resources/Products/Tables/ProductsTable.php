<?php

namespace App\Filament\Resources\Products\Tables;

use App\Models\Area;
use App\Models\Category;
use App\Models\Designer;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ForceDeleteBulkAction;
use Filament\Actions\RestoreBulkAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                SpatieMediaLibraryImageColumn::make('cover')
                    ->label(__('Cover'))
                    ->collection('cover'),
                TextColumn::make('name')
                    ->label(__('Name'))
                    ->searchable(),
                TextColumn::make('category.name')
                    ->label(__('Category')),
                TextColumn::make('area.name')
                    ->label(__('Area'))
                    ->badge(),
                TextColumn::make('designer.name')
                    ->label(__('Designer')),
                ToggleColumn::make('is_published')
                    ->label(__('Published')),
                IconColumn::make('is_featured')
                    ->label(__('Featured'))
                    ->boolean()
                    ->trueIcon(Heroicon::OutlinedStar),
            ])
            ->searchable(['sku'])
            ->filters([
                SelectFilter::make('area_id')
                    ->label(__('Area'))
                    ->options(fn (): array => Area::query()->pluck('name', 'id')->all()),
                SelectFilter::make('category_id')
                    ->label(__('Category'))
                    ->options(fn (): array => Category::query()->pluck('name', 'id')->all()),
                SelectFilter::make('designer_id')
                    ->label(__('Designer'))
                    ->options(fn (): array => Designer::query()->pluck('name', 'id')->all()),
                TernaryFilter::make('is_published')
                    ->label(__('Published')),
                TrashedFilter::make(),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkAction::make('publish')
                    ->label(__('Publish'))
                    ->icon(Heroicon::OutlinedEye)
                    ->action(fn (Collection $records) => $records->each->update(['is_published' => true]))
                    ->deselectRecordsAfterCompletion(),
                BulkAction::make('unpublish')
                    ->label(__('Unpublish'))
                    ->icon(Heroicon::OutlinedEyeSlash)
                    ->action(fn (Collection $records) => $records->each->update(['is_published' => false]))
                    ->deselectRecordsAfterCompletion(),
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                    ForceDeleteBulkAction::make(),
                    RestoreBulkAction::make(),
                ]),
            ]);
    }
}
