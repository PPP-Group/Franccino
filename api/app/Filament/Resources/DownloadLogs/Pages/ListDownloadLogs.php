<?php

namespace App\Filament\Resources\DownloadLogs\Pages;

use App\Filament\Resources\DownloadLogs\DownloadLogResource;
use Filament\Resources\Pages\ListRecords;

class ListDownloadLogs extends ListRecords
{
    protected static string $resource = DownloadLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            //
        ];
    }
}
