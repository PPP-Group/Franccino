<?php

use App\Models\DownloadLead;

$valid = [
    'profile' => 'professional',
    'first_name' => 'Ana',
    'last_name' => 'Souza',
    'email' => 'ana@example.com',
    'interest' => 'Mesas de jantar',
    'locale' => 'pt',
    'consent' => true,
];

it('stores the details and returns a token, keeping only its hash', function () use ($valid) {
    $token = $this->postJson('/api/v1/download-leads', $valid)->assertCreated()->json('data.token');

    $lead = DownloadLead::sole();
    expect($token)->toBeString()->toHaveLength(48)
        ->and($lead->token_hash)->toBe(hash('sha256', $token))
        ->and($lead->email)->toBe('ana@example.com')
        ->and(DownloadLead::findByToken($token)?->id)->toBe($lead->id);
});

it('requires name, surname, a valid e-mail, a profile and the consent', function () use ($valid) {
    $this->postJson('/api/v1/download-leads', [...$valid, 'email' => 'nao-e-email'])->assertUnprocessable()
        ->assertJsonValidationErrors('email');
    $this->postJson('/api/v1/download-leads', [...$valid, 'first_name' => ''])->assertUnprocessable();
    $this->postJson('/api/v1/download-leads', [...$valid, 'profile' => 'outro'])->assertUnprocessable();
    $this->postJson('/api/v1/download-leads', [...$valid, 'consent' => false])->assertUnprocessable();

    expect(DownloadLead::count())->toBe(0);
});
