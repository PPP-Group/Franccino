<?php

namespace App\Filament\Resources\Projects\Schemas;

use App\Enums\ProjectType;
use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use App\Support\Locales;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class ProjectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('type')
                    ->label(__('Type'))
                    ->options(fn (): array => collect(ProjectType::cases())
                        ->mapWithKeys(fn (ProjectType $type) => [$type->value => $type->label()])
                        ->all())
                    ->required(),
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("title.{$locale}")
                        ->label(__('Title'))
                        ->required($locale === Locales::default())
                        ->maxLength(160)
                        ->live(onBlur: true)
                        ->afterStateUpdated(fn (Get $get, Set $set, ?string $state) => blank($get("slug.{$locale}"))
                            ? $set("slug.{$locale}", Str::slug((string) $state))
                            : null),
                    CommonFields::slug($locale, 'projects'),
                    Textarea::make("summary.{$locale}")
                        ->label(__('Summary')),
                    RichEditor::make("description.{$locale}")
                        ->label(__('Description')),
                ]),
                TextInput::make('client_name')
                    ->label(__('Client name'))
                    ->maxLength(160),
                TextInput::make('location')
                    ->label(__('Location'))
                    ->maxLength(160),
                TextInput::make('architect')
                    ->label(__('Architect'))
                    ->maxLength(160),
                TextInput::make('year')
                    ->label(__('Year'))
                    ->numeric(),
                Select::make('products')
                    ->label(__('Products'))
                    ->relationship('products', 'name')
                    ->multiple()
                    ->searchable()
                    ->preload(),
                Toggle::make('is_featured')
                    ->label(__('Featured')),
                ...CommonFields::publication(),
                Translatable::tabs(fn (string $locale): array => CommonFields::seo($locale), key: 'seo'),
                SpatieMediaLibraryFileUpload::make('cover')
                    ->label(__('Cover'))
                    ->collection('cover')
                    ->image(),
                SpatieMediaLibraryFileUpload::make('gallery')
                    ->label(__('Gallery'))
                    ->collection('gallery')
                    ->image()
                    ->multiple()
                    ->reorderable(),
            ]);
    }
}
