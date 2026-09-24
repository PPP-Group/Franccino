<?php

namespace App\Enums;

enum ProjectType: string
{
    case Residential = 'residential';
    case Corporate = 'corporate';

    public function label(): string
    {
        return match ($this) {
            self::Residential => __('Residential'),
            self::Corporate => __('Corporate'),
        };
    }
}
