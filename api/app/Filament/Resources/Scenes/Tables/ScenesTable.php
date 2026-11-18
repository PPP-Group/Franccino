<?php

namespace App\Filament\Resources\Scenes\Tables;

use App\Filament\Support\PhotoPlaces;
use App\Models\Scene;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ScenesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                // The scene's own photo or the site photo the points are on (before, those showed no image).
                ImageColumn::make('thumb')
                    ->label(__('Image'))
                    ->state(function (Scene $record): ?string {
                        $media = $record->photo ?? $record->getFirstMedia('image');

                        return $media === null ? null : ($media->hasGeneratedConversion('w480') ? $media->getUrl('w480') : $media->getUrl());
                    })
                    ->imageHeight(56),
                TextColumn::make('title')
                    ->label(__('Title'))
                    ->searchable()
                    ->description(fn (Scene $record): string => PhotoPlaces::forScene($record)),
                TextColumn::make('hotspots_count')
                    ->label(__('Points'))
                    ->counts('hotspots'),
                IconColumn::make('is_published')
                    ->label(__('Published'))
                    ->boolean(),
            ])
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['photo.model', 'project', 'media']))
            ->filters([
                SelectFilter::make('place')
                    ->label(__('Where it shows'))
                    ->options([
                        'home' => __('Home page'),
                        'project' => __('Project'),
                        'photo' => __('Photo of a page, project or collection'),
                    ])
                    ->query(fn (Builder $query, array $data): Builder => match ($data['value'] ?? null) {
                        'home' => $query->whereNull('photo_media_id')->whereNull('project_id'),
                        'project' => $query->whereNull('photo_media_id')->whereNotNull('project_id'),
                        'photo' => $query->whereNotNull('photo_media_id'),
                        default => $query,
                    }),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
