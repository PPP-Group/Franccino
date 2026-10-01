<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Editor = 'editor';
    /** Customer service: reads and answers messages, newsletter and download logs; never edits content. */
    case Support = 'support';

    public function label(): string
    {
        return match ($this) {
            self::Admin => __('Administrator'),
            self::Editor => __('Editor'),
            self::Support => __('Customer service (read only)'),
        };
    }
}
