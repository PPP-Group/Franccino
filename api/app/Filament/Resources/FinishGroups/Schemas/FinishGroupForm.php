<?php

namespace App\Filament\Resources\FinishGroups\Schemas;

use App\Filament\Support\Translatable;
use App\Support\Locales;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class FinishGroupForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("name.{$locale}")
                        ->label(__('Name'))
                        ->required($locale === Locales::default())
                        ->maxLength(160),
                ]),
            ]);
    }
}
