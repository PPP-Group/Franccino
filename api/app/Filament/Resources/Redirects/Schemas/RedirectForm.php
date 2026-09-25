<?php

namespace App\Filament\Resources\Redirects\Schemas;

use App\Enums\RedirectStatus;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class RedirectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('from_path')
                    ->label(__('From path'))
                    ->required()
                    ->maxLength(512)
                    ->startsWith('/')
                    ->unique(ignoreRecord: true),
                Select::make('status_code')
                    ->label(__('Status code'))
                    ->options(fn (): array => collect(RedirectStatus::cases())
                        ->mapWithKeys(fn (RedirectStatus $status) => [$status->value => $status->label()])
                        ->all())
                    ->default(RedirectStatus::MovedPermanently->value)
                    ->live()
                    ->required(),
                TextInput::make('to_path')
                    ->label(__('To path'))
                    ->maxLength(2048)
                    ->required(fn (Get $get): bool => (int) $get('status_code') !== RedirectStatus::Gone->value),
                Toggle::make('is_active')
                    ->label(__('Active'))
                    ->default(true),
                Textarea::make('notes')
                    ->label(__('Notes'))
                    ->columnSpanFull(),
            ]);
    }
}
