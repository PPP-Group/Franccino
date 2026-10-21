<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Enums\UserRole;
use App\Models\User;
use Closure;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;
use Illuminate\Validation\Rules\Password;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->label(__('Name'))
                    ->required(),
                TextInput::make('email')
                    ->label(__('Email'))
                    ->email()
                    ->required()
                    ->unique(ignoreRecord: true),
                Select::make('role')
                    ->label(__('Role'))
                    ->options(fn (): array => collect(UserRole::cases())
                        ->mapWithKeys(fn (UserRole $role) => [$role->value => $role->label()])
                        ->all())
                    ->required()
                    ->rule(fn (?User $record) => function (string $attribute, mixed $value, Closure $fail) use ($record) {
                        if ($record?->isLastActiveAdmin() && $value !== UserRole::Admin->value) {
                            $fail(__('The panel needs at least one active administrator.'));
                        }
                    }),
                Toggle::make('is_active')
                    ->label(__('Active'))
                    ->default(true)
                    ->rule(fn (?User $record) => function (string $attribute, mixed $value, Closure $fail) use ($record) {
                        if ($record?->isLastActiveAdmin() && ! $value) {
                            $fail(__('The panel needs at least one active administrator.'));
                        }
                    }),
                TextInput::make('password')
                    ->label(__('Password'))
                    ->password()
                    ->revealable()
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->confirmed()
                    ->rule(Password::default())
                    ->dehydrated(fn (?string $state): bool => filled($state)),
                TextInput::make('password_confirmation')
                    ->label(__('Confirm password'))
                    ->password()
                    ->revealable()
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->dehydrated(false),
            ]);
    }
}
