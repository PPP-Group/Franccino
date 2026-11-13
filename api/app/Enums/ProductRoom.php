<?php

namespace App\Enums;

/**
 * Ambiente em que a peça fica (revisão da Franccino, 12/11/2026, item 8): o filtro "Ambientes" do catálogo, com a lista
 * do PDF (Varanda e jardim, Sala de jantar, Living, Quarto, Escritório).
 * O site traduz cada chave; o painel mostra o rótulo daqui.
 */
enum ProductRoom: string
{
    case Balcony = 'balcony';
    case Dining = 'dining';
    case Living = 'living';
    case Bedroom = 'bedroom';
    case Office = 'office';

    public function label(): string
    {
        return match ($this) {
            self::Balcony => __('Balcony and garden'),
            self::Dining => __('Dining room'),
            self::Living => __('Living'),
            self::Bedroom => __('Bedroom'),
            self::Office => __('Office'),
        };
    }

    /** @return array<string, string> */
    public static function options(): array
    {
        return collect(self::cases())->mapWithKeys(fn (self $room) => [$room->value => $room->label()])->all();
    }
}
