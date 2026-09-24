<?php

namespace App\Filament\Resources\FinishGroups\Pages;

use App\Filament\Concerns\HydratesTranslations;
use App\Filament\Resources\FinishGroups\FinishGroupResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFinishGroup extends EditRecord
{
    use HydratesTranslations;

    protected static string $resource = FinishGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
