<?php

namespace App\Support;

final class ContentLocale
{
    private ?string $locale = null;

    public function set(string $locale): void
    {
        $this->locale = $locale;
    }

    public function current(): string
    {
        return $this->locale ?? Locales::default();
    }
}
