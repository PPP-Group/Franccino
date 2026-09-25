<?php

namespace App\Filament\Resources\Banners\Schemas;

use App\Enums\BannerPlacement;
use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class BannerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('placement')
                    ->label(__('Placement'))
                    ->options(fn (): array => collect(BannerPlacement::cases())
                        ->mapWithKeys(fn (BannerPlacement $placement) => [$placement->value => $placement->label()])
                        ->all())
                    ->default(BannerPlacement::HomeHero->value)
                    ->required(),
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("title.{$locale}")
                        ->label(__('Title'))
                        ->maxLength(160),
                    TextInput::make("subtitle.{$locale}")
                        ->label(__('Subtitle'))
                        ->maxLength(255),
                    TextInput::make("cta_label.{$locale}")
                        ->label(__('CTA label'))
                        ->maxLength(160),
                    TextInput::make("cta_url.{$locale}")
                        ->label(__('CTA URL'))
                        ->url()
                        ->maxLength(255),
                ]),
                DateTimePicker::make('starts_at')
                    ->label(__('Starts at')),
                DateTimePicker::make('ends_at')
                    ->label(__('Ends at')),
                ...CommonFields::publication(),
                SpatieMediaLibraryFileUpload::make('image')
                    ->label(__('Image'))
                    ->collection('image')
                    ->image()
                    ->required(),
                SpatieMediaLibraryFileUpload::make('image_mobile')
                    ->label(__('Image (mobile)'))
                    ->collection('image_mobile')
                    ->image(),
            ]);
    }
}
