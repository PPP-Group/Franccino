<?php

namespace App\Filament\Pages;

use App\Filament\Support\Translatable;
use App\Models\User;
use App\Settings\GeneralSettings;
use App\Support\Locales;
use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Pages\SettingsPage;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Auth;

class ManageGeneralSettings extends SettingsPage
{
    protected static string $settings = GeneralSettings::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    public static function getNavigationGroup(): ?string
    {
        return __('System');
    }

    public static function getNavigationLabel(): string
    {
        return __('Settings');
    }

    public static function canAccess(): bool
    {
        /** @var User|null $user */
        $user = Auth::user();

        return $user?->isAdmin() ?? false;
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make(__('Contact'))
                    ->columns(2)
                    ->schema([
                        TextInput::make('company_name')
                            ->label(__('Company name'))
                            ->required(),
                        TextInput::make('contact_email')
                            ->label(__('Contact email'))
                            ->email(),
                        TextInput::make('contact_phone')
                            ->label(__('Contact phone')),
                        TextInput::make('factory_address')
                            ->label(__('Factory address'))
                            ->columnSpanFull(),
                    ]),
                Section::make(__('WhatsApp'))
                    ->columns(2)
                    ->schema([
                        TextInput::make('quotes_whatsapp')
                            ->label(__('Quotes WhatsApp')),
                        TextInput::make('assistance_whatsapp')
                            ->label(__('Assistance WhatsApp')),
                        TextInput::make('assistance_phone')
                            ->label(__('Assistance phone')),
                    ]),
                Section::make(__('Social networks'))
                    ->columns(2)
                    ->schema([
                        TextInput::make('instagram_url')
                            ->label(__('Instagram'))
                            ->url(),
                        TextInput::make('facebook_url')
                            ->label(__('Facebook'))
                            ->url(),
                        TextInput::make('pinterest_url')
                            ->label(__('Pinterest'))
                            ->url(),
                        TextInput::make('linkedin_url')
                            ->label(__('LinkedIn'))
                            ->url(),
                        TextInput::make('youtube_url')
                            ->label(__('YouTube'))
                            ->url(),
                    ]),
                Section::make(__('Form recipients'))
                    ->schema([
                        TagsInput::make('contact_recipients')
                            ->label(__('Recipient emails'))
                            ->placeholder(__('Add an email and press enter'))
                            ->nestedRecursiveRules(['email'])
                            ->required()
                            ->hiddenLabel()
                            ->columnSpanFull(),
                    ]),
                Section::make(__('Footer documents'))
                    ->schema([
                        Repeater::make('footer_documents')
                            ->hiddenLabel()
                            ->schema([
                                Translatable::tabs(fn (string $locale): array => [
                                    TextInput::make("label.{$locale}")
                                        ->label(__('Label'))
                                        ->required($locale === Locales::default()),
                                ]),
                                FileUpload::make('path')
                                    ->label(__('File'))
                                    ->disk('media')
                                    ->directory('documents')
                                    ->acceptedFileTypes(['application/pdf'])
                                    ->required(),
                            ])
                            ->reorderable()
                            ->collapsible()
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
