<?php

namespace App\Enums;

enum StoreType: string
{
    case Exclusive = 'exclusive';
    case Reseller = 'reseller';

    public function label(): string
    {
        return match ($this) {
            self::Exclusive => __('Exclusive store'),
            self::Reseller => __('Reseller'),
        };
    }
}
