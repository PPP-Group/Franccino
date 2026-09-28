<?php

namespace App\Filament\Resources\Finishes\Pages;

use App\Filament\Resources\Finishes\FinishResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFinishes extends ListRecords
{
    protected static string $resource = FinishResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
