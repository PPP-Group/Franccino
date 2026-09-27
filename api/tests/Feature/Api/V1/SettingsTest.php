<?php

use App\Settings\GeneralSettings;
use Illuminate\Support\Facades\Storage;

it('exposes the public settings without contact_recipients', function () {
    Storage::fake('media');

    $settings = app(GeneralSettings::class);
    $settings->contact_recipients = ['orcamentos@franccino.com.br'];
    $settings->footer_documents = [
        ['label' => ['pt' => 'Relatório', 'en' => 'Report'], 'path' => 'documents/relatorio.pdf'],
    ];
    $settings->save();

    $response = $this->getJson('/api/v1/settings')->assertOk();

    $response->assertJsonMissingPath('data.contact_recipients')
        ->assertJsonPath('data.footer_documents.0.label', 'Relatório')
        ->assertJsonPath('data.footer_documents.0.url', Storage::disk('media')->url('documents/relatorio.pdf'));

    $response->assertJsonStructure([
        'data' => [
            'company_name', 'contact_email', 'contact_phone', 'factory_address',
            'quotes_whatsapp', 'assistance_whatsapp', 'assistance_phone',
            'instagram_url', 'facebook_url', 'pinterest_url', 'linkedin_url', 'youtube_url',
            'footer_documents' => ['*' => ['label', 'url']],
        ],
    ]);
});

it('returns the footer document label in the requested locale', function () {
    Storage::fake('media');

    $settings = app(GeneralSettings::class);
    $settings->footer_documents = [
        ['label' => ['pt' => 'Relatório', 'en' => 'Report'], 'path' => 'documents/relatorio.pdf'],
    ];
    $settings->save();

    $this->getJson('/api/v1/settings?locale=en')
        ->assertOk()
        ->assertJsonPath('data.footer_documents.0.label', 'Report');
});
