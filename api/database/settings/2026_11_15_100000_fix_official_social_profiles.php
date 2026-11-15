<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * Perfis oficiais da Franccino (revisão geral de 14/11/2026, item 08). O valor inicial das configurações apontava para
 * "franccino", que no Instagram é o perfil pessoal de outra pessoa e no Facebook não existe. Os oficiais são os do site
 * atual (franccino.com.br) e do Google: @franccino.oficial e /Franccinooficial.
 *
 * Só troca o valor que ainda é o inicial: um endereço já mudado no painel fica como está.
 */
return new class extends SettingsMigration
{
    private const PROFILES = [
        'general.instagram_url' => ['https://www.instagram.com/franccino/', 'https://www.instagram.com/franccino.oficial/'],
        'general.facebook_url' => ['https://www.facebook.com/franccino', 'https://www.facebook.com/Franccinooficial/'],
    ];

    public function up(): void
    {
        foreach (self::PROFILES as $property => [$old, $new]) {
            $this->migrator->update($property, fn (?string $value) => $this->same($value, $old) ? $new : $value);
        }
    }

    public function down(): void
    {
        foreach (self::PROFILES as $property => [$old, $new]) {
            $this->migrator->update($property, fn (?string $value) => $this->same($value, $new) ? $old : $value);
        }
    }

    private function same(?string $value, string $url): bool
    {
        return $value !== null && rtrim(strtolower(trim($value)), '/') === rtrim(strtolower($url), '/');
    }
};
