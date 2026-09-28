<?php

namespace App\Filament\Resources\Lines\Pages;

use App\Filament\Resources\Lines\LineResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListLines extends ListRecords
{
    protected static string $resource = LineResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
