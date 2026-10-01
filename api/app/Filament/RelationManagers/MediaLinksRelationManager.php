<?php

namespace App\Filament\RelationManagers;

use App\Filament\Support\Translatable;
use App\Support\Locales;
use App\Support\VideoEmbed;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * Videos and external links (Anexo I) for products, designers and launches. YouTube and Vimeo videos play
 * inside the site; any other address opens in a new tab.
 */
class MediaLinksRelationManager extends RelationManager
{
    protected static string $relationship = 'mediaLinks';

    public static function getTitle(Model $ownerRecord, string $pageClass): string
    {
        return __('Videos and links');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('kind')
                    ->label(__('Type'))
                    ->options(['video' => __('Video'), 'link' => __('External link')])
                    ->default('video')
                    ->required(),
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("title.{$locale}")
                        ->label(__('Title'))
                        ->required($locale === Locales::default())
                        ->maxLength(160),
                ]),
                TextInput::make('url')
                    ->label(__('URL'))
                    ->url()
                    ->required()
                    ->maxLength(512)
                    ->helperText(__('YouTube and Vimeo videos play inside the site.')),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title')
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->columns([
                TextColumn::make('title')
                    ->label(__('Title')),
                TextColumn::make('kind')
                    ->label(__('Type'))
                    ->formatStateUsing(fn (string $state): string => $state === 'video' ? __('Video') : __('External link')),
                TextColumn::make('url')
                    ->label(__('URL'))
                    ->limit(48)
                    ->description(fn (Model $record): ?string => $record->getAttribute('kind') === 'video' && VideoEmbed::url((string) $record->getAttribute('url')) === null
                        ? __('Opens as a link (not YouTube or Vimeo)')
                        : null),
            ])
            ->headerActions([
                CreateAction::make(),
            ])
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
