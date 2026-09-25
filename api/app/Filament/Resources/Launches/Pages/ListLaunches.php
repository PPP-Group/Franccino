<?php

namespace App\Filament\Resources\Launches\Pages;

use App\Filament\Resources\Launches\LaunchResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListLaunches extends ListRecords
{
    protected static string $resource = LaunchResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
