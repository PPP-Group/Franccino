<?php

namespace App\Filament\Resources\Clients\Schemas;

use App\Filament\Support\CommonFields;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ClientForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->label(__('Name'))
                    ->required()
                    ->maxLength(160),
                TextInput::make('url')
                    ->label(__('URL'))
                    ->url()
                    ->maxLength(255),
                ...CommonFields::publication(),
                SpatieMediaLibraryFileUpload::make('logo')
                    ->label(__('Logo'))
                    ->collection('logo')
                    ->image(),
            ]);
    }
}
