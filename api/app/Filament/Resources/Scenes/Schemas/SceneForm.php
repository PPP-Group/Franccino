<?php

namespace App\Filament\Resources\Scenes\Schemas;

use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use App\Models\Product;
use App\Models\Scene;
use App\Support\Locales;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\ViewField;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

/**
 * Scene with clickable points (banco de ideias, idea 7): the photo, then one point per piece, placed by its position
 * on the photo in percent, so it lands on the same spot at any screen size.
 */
class SceneForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("title.{$locale}")
                        ->label(__('Title'))
                        ->required($locale === Locales::default())
                        ->maxLength(160),
                ]),
                ...CommonFields::publication(),
                SpatieMediaLibraryFileUpload::make('image')
                    ->label(__('Image'))
                    ->collection('image')
                    ->image()
                    ->required(),
                // Click on the photo and choose the piece right there: needs the saved photo, so edit page only.
                ViewField::make('point_picker')
                    ->view('filament.scenes.point-picker')
                    ->viewData(fn (?Scene $record): array => [
                        'imageUrl' => $record?->getFirstMediaUrl('image'),
                        'products' => self::pickerProducts(),
                    ])
                    ->visible(fn (?Scene $record): bool => (bool) $record?->hasMedia('image'))
                    ->dehydrated(false)
                    ->columnSpanFull(),
                Repeater::make('hotspots')
                    ->label(__('Points'))
                    ->relationship()
                    ->orderColumn('sort_order')
                    ->reorderable()
                    ->columns(3)
                    ->defaultItems(0)
                    ->addActionLabel(__('Add point'))
                    ->schema([
                        Select::make('product_id')
                            ->label(__('Product'))
                            ->relationship('product', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        TextInput::make('x')
                            ->label(__('Across (%)'))
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->step(0.1)
                            ->required(),
                        TextInput::make('y')
                            ->label(__('Down (%)'))
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->step(0.1)
                            ->required(),
                    ]),
            ]);
    }

    /**
     * Every piece for the search on the photo: id, Portuguese name, a small cover and the text to match without
     * accents (as the panel shows them, drafts included).
     *
     * @return list<array{id: int, name: string, thumb: string, search: string}>
     */
    private static function pickerProducts(): array
    {
        return Product::query()
            ->with('media')
            ->get()
            ->map(function (Product $product): array {
                $name = (string) $product->getTranslation('name', Locales::default());
                $cover = $product->getFirstMedia('cover');

                return [
                    'id' => $product->getKey(),
                    'name' => $name,
                    'thumb' => $cover === null ? '' : ($cover->hasGeneratedConversion('w480') ? $cover->getUrl('w480') : $cover->getUrl()),
                    'search' => Str::of($name.' '.$product->sku)->ascii()->lower()->squish()->toString(),
                ];
            })
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->all();
    }
}
