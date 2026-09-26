<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('general.company_name', 'Franccino');
        $this->migrator->add('general.contact_email', 'contato@franccino.com.br');
        $this->migrator->add('general.contact_phone', '(37) 3381-4204');
        $this->migrator->add('general.factory_address', 'Rod. MG 260, KM 36, 1254 — Sobrado, Cláudio — MG, CEP 35530-000');
        $this->migrator->add('general.quotes_whatsapp', '5511942900080');
        $this->migrator->add('general.assistance_whatsapp', '5537998725961');
        $this->migrator->add('general.assistance_phone', '(37) 99872-5961');
        $this->migrator->add('general.instagram_url', 'https://www.instagram.com/franccino/');
        $this->migrator->add('general.facebook_url', 'https://www.facebook.com/franccino');
        $this->migrator->add('general.pinterest_url', null);
        $this->migrator->add('general.linkedin_url', null);
        $this->migrator->add('general.youtube_url', null);
        $this->migrator->add('general.contact_recipients', []);
        $this->migrator->add('general.footer_documents', []);
    }
};
