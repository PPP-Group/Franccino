<?php

namespace App\Filament\Resources\Products\Schemas;

use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use App\Models\Line;
use App\Support\Locales;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('sections')
                    ->tabs([
                        Tab::make(__('General'))
                            ->schema(self::generalFields()),
                        Tab::make(__('Content'))
                            ->schema(self::contentFields()),
                        Tab::make(__('Dimensions'))
                            ->schema(self::dimensionsFields()),
                        Tab::make(__('Finishes'))
                            ->schema(self::finishesFields()),
                        Tab::make(__('Media and 3D'))
                            ->schema(self::mediaFields()),
                        Tab::make(__('SEO'))
                            ->schema([
                                Translatable::tabs(fn (string $locale): array => CommonFields::seo($locale), key: 'seo'),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }

    /** @return array<int, mixed> */
    private static function generalFields(): array
    {
        return [
            Translatable::tabs(fn (string $locale): array => [
                TextInput::make("name.{$locale}")
                    ->label(__('Name'))
                    ->required($locale === Locales::default())
                    ->maxLength(160)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (Get $get, Set $set, ?string $state) => blank($get("slug.{$locale}"))
                        ? $set("slug.{$locale}", Str::slug((string) $state))
                        : null),
                CommonFields::slug($locale, 'products'),
                TextInput::make("tagline.{$locale}")
                    ->label(__('Tagline'))
                    ->maxLength(255),
            ]),
            TextInput::make('sku')
                ->label(__('SKU'))
                ->maxLength(255),
            Select::make('area_id')
                ->label(__('Area'))
                ->relationship('area', 'name')
                ->required(),
            Select::make('category_id')
                ->label(__('Category'))
                ->relationship('category', 'name')
                ->searchable()
                ->required(),
            Select::make('line_id')
                ->label(__('Line'))
                ->relationship('line', 'name')
                ->searchable()
                ->createOptionForm([
                    TextInput::make('name')
                        ->label(__('Name'))
                        ->required()
                        ->maxLength(160),
                    TextInput::make('slug')
                        ->label(__('Slug'))
                        ->required()
                        ->maxLength(160)
                        ->alphaDash()
                        ->unique(table: (new Line)->getTable()),
                ]),
            Select::make('designer_id')
                ->label(__('Designer'))
                ->relationship('designer', 'name')
                ->searchable(),
            Toggle::make('is_featured')
                ->label(__('Featured')),
            ...CommonFields::publication(),
        ];
    }

    /** @return array<int, mixed> */
    private static function contentFields(): array
    {
        return [
            Translatable::tabs(fn (string $locale): array => [
                RichEditor::make("description.{$locale}")
                    ->label(__('Description'))
                    ->toolbarButtons([
                        ['h2', 'h3'],
                        ['bold', 'italic', 'link'],
                        ['bulletList', 'orderedList'],
                    ]),
                Textarea::make("materials.{$locale}")
                    ->label(__('Materials')),
                Textarea::make("finishes_note.{$locale}")
                    ->label(__('Finishes note')),
            ]),
        ];
    }

    /** @return array<int, mixed> */
    private static function dimensionsFields(): array
    {
        return [
            Repeater::make('dimensions')
                ->label(__('Dimensions'))
                ->schema([
                    TextInput::make('label.pt')
                        ->label(__('Label (Portuguese)')),
                    TextInput::make('label.en')
                        ->label(__('Label (English)')),
                    TextInput::make('width')
                        ->label(__('Width (mm)'))
                        ->numeric(),
                    TextInput::make('depth')
                        ->label(__('Depth (mm)'))
                        ->numeric(),
                    TextInput::make('height')
                        ->label(__('Height (mm)'))
                        ->numeric(),
                    TextInput::make('seat_height')
                        ->label(__('Seat height (mm)'))
                        ->numeric(),
                    TextInput::make('diameter')
                        ->label(__('Diameter (mm)'))
                        ->numeric(),
                ])
                ->reorderable()
                ->collapsible()
                ->columnSpanFull(),
        ];
    }

    /** @return array<int, mixed> */
    private static function finishesFields(): array
    {
        return [
            Select::make('finishes')
                ->label(__('Finishes'))
                ->relationship('finishes', 'name')
                ->multiple()
                ->searchable()
                ->preload(),
        ];
    }

    /** @return array<int, mixed> */
    private static function mediaFields(): array
    {
        return [
            SpatieMediaLibraryFileUpload::make('cover')
                ->label(__('Cover'))
                ->collection('cover')
                ->image()
                ->helperText(__('Required before the product can be published.')),
            SpatieMediaLibraryFileUpload::make('gallery')
                ->label(__('Gallery'))
                ->collection('gallery')
                ->image()
                ->multiple()
                ->reorderable(),
            SpatieMediaLibraryFileUpload::make('model_3d')
                ->label(__('3D model'))
                ->collection('model_3d')
                ->acceptedFileTypes(['model/gltf-binary', 'application/octet-stream'])
                ->maxSize(config('franccino.uploads.model_3d_max_kb')),
            Toggle::make('is_3d_enabled')
                ->label(__('3D enabled'))
                ->helperText(__('Turn off to hide the 3D viewer for this product.')),
        ];
    }
}
