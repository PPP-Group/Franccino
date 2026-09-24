<?php

namespace App\Enums;

enum ContactProfession: string
{
    case Architect = 'architect';
    case InteriorDesigner = 'interior_designer';
    case Retailer = 'retailer';
    case EndCustomer = 'end_customer';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Architect => __('Architect'),
            self::InteriorDesigner => __('Interior designer'),
            self::Retailer => __('Retailer'),
            self::EndCustomer => __('End customer'),
            self::Other => __('Other'),
        };
    }
}
