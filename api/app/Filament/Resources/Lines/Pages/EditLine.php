<?php

namespace App\Filament\Resources\Lines\Pages;

use App\Filament\Concerns\HydratesTranslations;
use App\Filament\Resources\Lines\LineResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditLine extends EditRecord
{
    use HydratesTranslations;

    protected static string $resource = LineResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
