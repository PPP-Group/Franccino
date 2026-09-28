<?php

namespace App\Filament\Resources\FinishGroups\Pages;

use App\Filament\Resources\FinishGroups\FinishGroupResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFinishGroups extends ListRecords
{
    protected static string $resource = FinishGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
