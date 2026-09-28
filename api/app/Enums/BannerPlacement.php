<?php

namespace App\Enums;

/**
 * Extensible set of banner placements. Only `home_hero` exists today; new panel
 * placements are added as new cases when the front grows more banner slots.
 */
enum BannerPlacement: string
{
    case HomeHero = 'home_hero';

    public function label(): string
    {
        return match ($this) {
            self::HomeHero => __('Home hero'),
        };
    }
}
