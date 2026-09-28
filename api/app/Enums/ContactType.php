<?php

namespace App\Enums;

enum ContactType: string
{
    case Quote = 'quote';
    case Assistance = 'assistance';
    case Partnership = 'partnership';
    case Press = 'press';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Quote => __('Quote'),
            self::Assistance => __('Assistance'),
            self::Partnership => __('Partnership'),
            self::Press => __('Press'),
            self::Other => __('Other'),
        };
    }
}
