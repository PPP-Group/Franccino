<?php

namespace App\Filament\Resources\Collections\Schemas;

use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use App\Support\Locales;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class CollectionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("name.{$locale}")
                        ->label(__('Name'))
                        ->required($locale === Locales::default())
                        ->maxLength(160)
                        ->live(onBlur: true)
                        ->afterStateUpdated(fn (Get $get, Set $set, ?string $state) => blank($get("slug.{$locale}"))
                            ? $set("slug.{$locale}", Str::slug((string) $state))
                            : null),
                    CommonFields::slug($locale, 'collections'),
                    Textarea::make("summary.{$locale}")
                        ->label(__('Summary')),
                    RichEditor::make("description.{$locale}")
                        ->label(__('Description')),
                ]),
                TextInput::make('year')
                    ->label(__('Year'))
                    ->numeric(),
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
                SpatieMediaLibraryFileUpload::make('video')
                    ->label(__('Video file (MP4)'))
                    ->collection('video')
                    ->acceptedFileTypes(['video/mp4'])
                    ->maxSize(config('franccino.uploads.video_max_kb')),
                SpatieMediaLibraryFileUpload::make('video_poster')
                    ->label(__('Video cover'))
                    ->collection('video_poster')
                    ->image(),
            ]);
    }
}
