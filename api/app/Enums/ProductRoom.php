<?php

namespace App\Enums;

/**
 * Ambiente em que a peça fica (revisão da Franccino, 12/11/2026, item 8): o filtro "Ambientes" do catálogo.
 * O site traduz cada chave; o painel mostra o rótulo daqui.
 */
enum ProductRoom: string
{
    case Living = 'living';
    case Dining = 'dining';
    case Bedroom = 'bedroom';
    case Office = 'office';
    case Balcony = 'balcony';
    case Gourmet = 'gourmet';
    case Pool = 'pool';
    case Garden = 'garden';

    public function label(): string
    {
        return match ($this) {
            self::Living => __('Living room'),
            self::Dining => __('Dining room'),
            self::Bedroom => __('Bedroom'),
            self::Office => __('Office'),
            self::Balcony => __('Balcony'),
            self::Gourmet => __('Gourmet area'),
            self::Pool => __('Pool'),
            self::Garden => __('Garden'),
        };
    }

    /** @return array<string, string> */
    public static function options(): array
    {
        return collect(self::cases())->mapWithKeys(fn (self $room) => [$room->value => $room->label()])->all();
    }
}
