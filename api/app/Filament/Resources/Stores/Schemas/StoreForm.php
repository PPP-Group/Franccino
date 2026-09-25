<?php

namespace App\Filament\Resources\Stores\Schemas;

use App\Enums\StoreType;
use App\Filament\Support\CommonFields;
use App\Filament\Support\Translatable;
use App\Support\BrazilianStates;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class StoreForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->label(__('Name'))
                    ->required()
                    ->maxLength(160),
                Select::make('type')
                    ->label(__('Type'))
                    ->options(fn (): array => collect(StoreType::cases())
                        ->mapWithKeys(fn (StoreType $type) => [$type->value => $type->label()])
                        ->all())
                    ->required(),
                TextInput::make('address')
                    ->label(__('Address'))
                    ->required()
                    ->maxLength(255),
                TextInput::make('address_complement')
                    ->label(__('Address complement'))
                    ->maxLength(255),
                TextInput::make('district')
                    ->label(__('District'))
                    ->maxLength(160),
                TextInput::make('city')
                    ->label(__('City'))
                    ->required()
                    ->maxLength(160),
                Select::make('state')
                    ->label(__('State'))
                    ->options(BrazilianStates::options())
                    ->required(),
                TextInput::make('postal_code')
                    ->label(__('Postal code'))
                    ->maxLength(20),
                TextInput::make('country')
                    ->label(__('Country'))
                    ->default('BR')
                    ->required()
                    ->maxLength(2),
                TextInput::make('latitude')
                    ->label(__('Latitude'))
                    ->numeric()
                    ->minValue(-90)
                    ->maxValue(90),
                TextInput::make('longitude')
                    ->label(__('Longitude'))
                    ->numeric()
                    ->minValue(-180)
                    ->maxValue(180),
                TextInput::make('phone')
                    ->label(__('Phone'))
                    ->tel()
                    ->maxLength(30),
                TextInput::make('whatsapp')
                    ->label(__('WhatsApp'))
                    ->tel()
                    ->maxLength(30),
                TextInput::make('email')
                    ->label(__('Email'))
                    ->email()
                    ->maxLength(255),
                TextInput::make('website_url')
                    ->label(__('Website'))
                    ->url()
                    ->maxLength(255),
                TextInput::make('instagram_url')
                    ->label(__('Instagram'))
                    ->url()
                    ->maxLength(255),
                Translatable::tabs(fn (string $locale): array => [
                    Textarea::make("opening_hours.{$locale}")
                        ->label(__('Opening hours')),
                ]),
                ...CommonFields::publication(),
            ]);
    }
}
