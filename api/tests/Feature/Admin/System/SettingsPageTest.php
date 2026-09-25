<?php

use App\Filament\Pages\ManageGeneralSettings;
use App\Models\User;
use App\Settings\GeneralSettings;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Storage::fake('media');
});

it('lets an admin open and save the general settings', function () {
    $this->actingAs(User::factory()->admin()->create());

    livewire(ManageGeneralSettings::class)
        ->assertOk()
        ->fillForm([
            'contact_recipients' => ['vendas@franccino.com.br'],
            'footer_documents' => [
                [
                    'label' => ['pt' => 'Catálogo geral', 'en' => 'General catalog'],
                    'path' => [UploadedFile::fake()->create('catalogo.pdf', 10, 'application/pdf')],
                ],
            ],
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    $settings = app(GeneralSettings::class);

    expect($settings->contact_recipients)->toBe(['vendas@franccino.com.br'])
        ->and($settings->footer_documents)->toHaveCount(1)
        ->and($settings->footer_documents[0]['label']['en'])->toBe('General catalog');
});

it('rejects an invalid recipient email', function () {
    $this->actingAs(User::factory()->admin()->create());

    livewire(ManageGeneralSettings::class)
        ->fillForm([
            'contact_recipients' => ['not-an-email'],
        ])
        ->call('save')
        ->assertHasFormErrors(['contact_recipients.0']);
});

it('forbids editors from accessing the settings page', function () {
    $this->actingAs(User::factory()->editor()->create())
        ->get('/admin/manage-general-settings')
        ->assertForbidden();
});
