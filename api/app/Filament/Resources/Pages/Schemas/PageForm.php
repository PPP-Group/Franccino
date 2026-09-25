<?php

namespace App\Filament\Resources\Pages\Schemas;

use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use App\Support\Locales;
use Filament\Forms\Components\Builder;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class PageForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('key')
                    ->label(__('Key'))
                    ->disabled()
                    ->dehydrated(false),
                Tabs::make('sections')
                    ->tabs([
                        Tab::make(__('Content'))
                            ->schema([
                                Translatable::tabs(fn (string $locale): array => [
                                    TextInput::make("title.{$locale}")
                                        ->label(__('Title'))
                                        ->required($locale === Locales::default())
                                        ->maxLength(160),
                                    Textarea::make("intro.{$locale}")
                                        ->label(__('Introduction')),
                                ]),
                                Builder::make('content')
                                    ->label(__('Content'))
                                    ->blocks(PageBlocks::all())
                                    ->blockPickerColumns(3)
                                    ->collapsible()
                                    ->columnSpanFull(),
                            ]),
                        Tab::make(__('SEO'))
                            ->schema([
                                Translatable::tabs(fn (string $locale): array => CommonFields::seo($locale), key: 'seo'),
                            ]),
                        Tab::make(__('Media'))
                            ->schema([
                                SpatieMediaLibraryFileUpload::make('cover')
                                    ->label(__('Cover'))
                                    ->collection('cover')
                                    ->image(),
                                SpatieMediaLibraryFileUpload::make('og_image')
                                    ->label(__('OG image'))
                                    ->collection('og_image')
                                    ->image(),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
