<?php

namespace App\Enums;

enum AreaKey: string
{
    case Indoor = 'indoor';
    case Outdoor = 'outdoor';

    public function label(): string
    {
        return match ($this) {
            self::Indoor => __('Indoor'),
            self::Outdoor => __('Outdoor'),
        };
    }
}
