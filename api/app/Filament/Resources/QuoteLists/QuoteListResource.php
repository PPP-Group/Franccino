<?php

namespace App\Filament\Resources\QuoteLists;

use App\Filament\Resources\QuoteLists\Pages\ListQuoteLists;
use App\Filament\Resources\QuoteLists\Tables\QuoteListsTable;
use App\Models\QuoteList;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

/**
 * Listas de desejos compartilhadas por link (retorno de 12/11/2026): as que os visitantes mandaram pelo WhatsApp ou
 * junto do pedido de orçamento. Só consulta; cada uma abre no site com as fotos.
 */
class QuoteListResource extends Resource
{
    protected static ?string $model = QuoteList::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShoppingBag;

    protected static bool $hasTitleCaseModelLabel = false;

    public static function getModelLabel(): string
    {
        return __('Wishlist');
    }

    public static function getPluralModelLabel(): string
    {
        return __('Wishlists');
    }

    public static function getNavigationGroup(): ?string
    {
        return __('Relationship');
    }

    public static function table(Table $table): Table
    {
        return QuoteListsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListQuoteLists::route('/'),
        ];
    }
}
