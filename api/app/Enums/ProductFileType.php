<?php

namespace App\Enums;

enum ProductFileType: string
{
    case TechnicalSheet = 'technical_sheet';
    case Block2d = 'block_2d';
    case Block3d = 'block_3d';
    case Manual = 'manual';
    case Catalog = 'catalog';
    case Presentation = 'presentation';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::TechnicalSheet => __('Technical sheet'),
            self::Block2d => __('2D block'),
            self::Block3d => __('3D block'),
            self::Manual => __('Manual'),
            self::Catalog => __('Catalog'),
            self::Presentation => __('Presentation'),
            self::Other => __('Other'),
        };
    }
}
