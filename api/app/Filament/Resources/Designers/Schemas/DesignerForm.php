<?php

namespace App\Filament\Resources\Designers\Schemas;

use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class DesignerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->label(__('Name'))
                    ->required()
                    ->maxLength(160)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (Get $get, Set $set, ?string $state) => blank($get('slug'))
                        ? $set('slug', Str::slug((string) $state))
                        : null),
                TextInput::make('slug')
                    ->label(__('Slug'))
                    ->required()
                    ->maxLength(160)
                    ->alphaDash()
                    ->unique(table: 'designers', ignoreRecord: true),
                Translatable::tabs(fn (string $locale): array => [
                    Textarea::make("short_bio.{$locale}")
                        ->label(__('Short bio'))
                        ->maxLength(280),
                    RichEditor::make("bio.{$locale}")
                        ->label(__('Bio')),
                ]),
                TextInput::make('location')
                    ->label(__('Location'))
                    ->maxLength(160),
                TextInput::make('website_url')
                    ->label(__('Website'))
                    ->url()
                    ->maxLength(255),
                TextInput::make('instagram_url')
                    ->label(__('Instagram'))
                    ->url()
                    ->maxLength(255),
                ...CommonFields::publication(),
                Translatable::tabs(fn (string $locale): array => CommonFields::seo($locale), key: 'seo'),
                SpatieMediaLibraryFileUpload::make('portrait')
                    ->label(__('Portrait'))
                    ->collection('portrait')
                    ->image(),
            ]);
    }
}
