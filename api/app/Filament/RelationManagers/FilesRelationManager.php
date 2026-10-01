<?php

namespace App\Filament\RelationManagers;

use App\Enums\ProductFileType;
use App\Filament\Support\Translatable;
use App\Support\Locales;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Number;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

/**
 * Private files for download of a product, a designer or a launch (PPP-109): saved on the `downloads` disk,
 * in a folder per owner, and served only through the temporary link.
 */
class FilesRelationManager extends RelationManager
{
    protected static string $relationship = 'files';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('type')
                    ->label(__('Type'))
                    ->options(fn (): array => collect(ProductFileType::cases())
                        ->mapWithKeys(fn (ProductFileType $type) => [$type->value => $type->label()])
                        ->all())
                    ->required(),
                Translatable::tabs(fn (string $locale): array => [
                    TextInput::make("title.{$locale}")
                        ->label(__('Title'))
                        ->required($locale === Locales::default())
                        ->maxLength(160),
                ]),
                FileUpload::make('path')
                    ->label(__('File'))
                    ->disk('downloads')
                    ->directory(fn (): string => Str::plural(Str::kebab(class_basename($this->getOwnerRecord()))))
                    ->storeFileNamesIn('original_name')
                    ->maxSize(51200)
                    ->live()
                    ->afterStateUpdated(function (Set $set, mixed $state): void {
                        if ($state instanceof TemporaryUploadedFile) {
                            $set('format', Str::upper((string) $state->getClientOriginalExtension()));
                        }
                    })
                    ->required(),
                TextInput::make('format')
                    ->label(__('Format'))
                    ->maxLength(20),
                Toggle::make('is_published')
                    ->label(__('Published')),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title')
            ->columns([
                TextColumn::make('title')
                    ->label(__('Title'))
                    ->searchable(),
                TextColumn::make('type')
                    ->label(__('Type'))
                    ->formatStateUsing(fn (ProductFileType $state): string => $state->label()),
                TextColumn::make('format')
                    ->label(__('Format')),
                TextColumn::make('size')
                    ->label(__('Size'))
                    ->formatStateUsing(fn (?int $state): string => $state === null ? '—' : Number::fileSize($state)),
                IconColumn::make('is_published')
                    ->label(__('Published'))
                    ->boolean(),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->headerActions([
                CreateAction::make(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
