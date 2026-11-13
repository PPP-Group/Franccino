<?php

namespace App\Filament\Resources\QuoteLists\Pages;

use App\Filament\Resources\QuoteLists\QuoteListResource;
use Filament\Resources\Pages\ListRecords;

class ListQuoteLists extends ListRecords
{
    protected static string $resource = QuoteListResource::class;
}
