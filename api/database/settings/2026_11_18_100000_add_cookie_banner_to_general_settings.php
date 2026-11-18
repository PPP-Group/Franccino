<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * Texts of the cookie notice of the site, editable in the panel, the API and the connector (revisão de 17/11/2026).
 * Empty means the site's own default text.
 */
return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('general.cookie_banner', []);
    }
};
