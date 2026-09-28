<?php

namespace App\Enums;

enum RedirectStatus: int
{
    case MovedPermanently = 301;
    case Found = 302;
    case Gone = 410;

    public function label(): string
    {
        return match ($this) {
            self::MovedPermanently => __('301 — Moved permanently'),
            self::Found => __('302 — Found'),
            self::Gone => __('410 — Gone'),
        };
    }
}
