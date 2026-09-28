<?php

namespace App\Filament\Resources\Collections\Pages;

use App\Filament\Concerns\HydratesTranslations;
use App\Filament\Resources\Collections\CollectionResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCollection extends EditRecord
{
    use HydratesTranslations;

    protected static string $resource = CollectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
