<?php

namespace App\Filament\Resources\Products\Tables;

use App\Models\Area;
use App\Models\Category;
use App\Models\Collection as CollectionModel;
use App\Models\Designer;
use App\Models\Line;
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
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

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
                    ->description(fn (Model $record): ?string => $record->getAttribute('sku'))
                    ->searchable(),
                TextColumn::make('category.name')
                    ->label(__('Category')),
                TextColumn::make('area.name')
                    ->label(__('Area'))
                    ->badge(),
                TextColumn::make('designer.name')
                    ->label(__('Designer'))
                    ->toggleable(),
                TextColumn::make('line.name')
                    ->label(__('Line'))
                    ->toggleable(isToggledHiddenByDefault: true),
                ToggleColumn::make('is_published')
                    ->label(__('Published')),
                IconColumn::make('is_featured')
                    ->label(__('Featured'))
                    ->boolean()
                    ->trueIcon(Heroicon::OutlinedStar),
                IconColumn::make('is_3d_enabled')
                    ->label(__('3D enabled'))
                    ->boolean()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->label(__('Last updated'))
                    ->since()
                    ->sortable()
                    ->toggleable(),
            ])
            ->searchable(['sku'])
            ->filters([
                SelectFilter::make('area_id')
                    ->label(__('Area'))
                    ->options(fn (): array => self::options(Area::query()->get())),
                SelectFilter::make('category_id')
                    ->label(__('Category'))
                    ->options(fn (): array => self::options(Category::query()->get()))
                    ->searchable(),
                SelectFilter::make('designer_id')
                    ->label(__('Designer'))
                    ->options(fn (): array => self::options(Designer::query()->get()))
                    ->searchable(),
                SelectFilter::make('collection')
                    ->label(__('Collection'))
                    ->options(fn (): array => self::options(CollectionModel::query()->get()))
                    ->query(fn (Builder $query, array $data): Builder => blank($data['value'] ?? null)
                        ? $query
                        : $query->whereHas('collections', fn (Builder $query) => $query->whereKey($data['value'])))
                    ->searchable(),
                SelectFilter::make('line_id')
                    ->label(__('Line'))
                    ->options(fn (): array => self::options(Line::query()->get()))
                    ->searchable(),
                TernaryFilter::make('is_published')
                    ->label(__('Published')),
                TernaryFilter::make('cover')
                    ->label(__('Cover'))
                    ->trueLabel(__('With cover'))
                    ->falseLabel(__('Without cover'))
                    ->queries(
                        true: fn (Builder $query) => $query->whereHas('media', fn (Builder $query) => $query->where('collection_name', 'cover')),
                        false: fn (Builder $query) => $query->whereDoesntHave('media', fn (Builder $query) => $query->where('collection_name', 'cover')),
                    ),
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

    /**
     * Filter options by name, in alphabetical order (names come in the panel's language).
     *
     * @param  iterable<Model>  $records
     * @return array<int|string, string>
     */
    private static function options(iterable $records): array
    {
        return collect($records)
            ->mapWithKeys(fn (Model $record): array => [$record->getKey() => (string) $record->getAttribute('name')])
            ->sort(SORT_NATURAL | SORT_FLAG_CASE)
            ->all();
    }
}
