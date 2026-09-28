<?php

namespace App\Filament\Resources\Launches\Pages;

use App\Filament\Concerns\HydratesTranslations;
use App\Filament\Resources\Launches\LaunchResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditLaunch extends EditRecord
{
    use HydratesTranslations;

    protected static string $resource = LaunchResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
