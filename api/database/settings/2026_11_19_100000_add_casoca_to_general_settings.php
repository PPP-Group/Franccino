<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * Perfil da Franccino no Casoca (revisão da Franccino, "Alterações site", 18/11/2026): entra com o endereço que eles
 * mandaram, ao lado do Instagram e do Pinterest no topo e no rodapé do site. Muda em Configurações › Redes sociais.
 */
return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('general.casoca_url', 'https://casoca.com.br/franccino.html');
    }

    public function down(): void
    {
        $this->migrator->delete('general.casoca_url');
    }
};
