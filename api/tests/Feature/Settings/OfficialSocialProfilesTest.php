<?php

use App\Settings\GeneralSettings;

/** Roda de novo a migration dos perfis oficiais sobre o valor que estiver salvo. */
function runSocialProfilesMigration(): void
{
    $migration = require database_path('settings/2026_11_15_100000_fix_official_social_profiles.php');
    $migration->up();
}

it('points the default social profiles to the official ones', function () {
    $settings = app(GeneralSettings::class);

    expect($settings->instagram_url)->toBe('https://www.instagram.com/franccino.oficial/')
        ->and($settings->facebook_url)->toBe('https://www.facebook.com/Franccinooficial/');
});

it('swaps the old default even with a different case or trailing slash', function () {
    $settings = app(GeneralSettings::class);
    $settings->instagram_url = 'https://www.instagram.com/Franccino';
    $settings->facebook_url = 'https://www.facebook.com/franccino/';
    $settings->save();

    runSocialProfilesMigration();

    $fresh = app(GeneralSettings::class)->refresh();
    expect($fresh->instagram_url)->toBe('https://www.instagram.com/franccino.oficial/')
        ->and($fresh->facebook_url)->toBe('https://www.facebook.com/Franccinooficial/');
});

it('keeps an address already changed in the panel', function () {
    $settings = app(GeneralSettings::class);
    $settings->instagram_url = 'https://www.instagram.com/outra.conta/';
    $settings->save();

    runSocialProfilesMigration();

    expect(app(GeneralSettings::class)->refresh()->instagram_url)->toBe('https://www.instagram.com/outra.conta/');
});
