<?php

namespace App\Filament\Resources\Stores\Pages;

use App\Filament\Concerns\HydratesTranslations;
use App\Filament\Resources\Stores\StoreResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditStore extends EditRecord
{
    use HydratesTranslations;

    protected static string $resource = StoreResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
