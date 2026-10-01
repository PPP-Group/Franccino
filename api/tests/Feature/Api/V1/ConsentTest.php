<?php

use App\Filament\Resources\ConsentRecords\Pages\ListConsentRecords;
use App\Models\ConsentRecord;
use App\Models\User;

use function Pest\Livewire\livewire;

function validConsent(array $overrides = []): array
{
    return array_merge([
        'visitor_id' => '7d3f0c1e-5b2a-4c3d-9e8f-1a2b3c4d5e6f',
        'choice' => 'granted',
        'policy_version' => '2026-10-01',
        'locale' => 'pt',
    ], $overrides);
}

it('records the cookie banner choice with the IP only as a hash', function () {
    $this->postJson('/api/v1/consents', validConsent(), ['User-Agent' => 'Teste/1.0'])
        ->assertCreated()
        ->assertExactJson(['data' => ['recorded' => true]]);

    $record = ConsentRecord::sole();
    expect($record->choice)->toBe('granted')
        ->and($record->policy_version)->toBe('2026-10-01')
        ->and($record->ip_hash)->toHaveLength(64)
        ->and($record->user_agent)->toBe('Teste/1.0');
});

it('keeps every choice of the same visitor as history', function () {
    $this->postJson('/api/v1/consents', validConsent())->assertCreated();
    $this->postJson('/api/v1/consents', validConsent(['choice' => 'denied']))->assertCreated();

    expect(ConsentRecord::where('visitor_id', validConsent()['visitor_id'])->pluck('choice')->all())
        ->toBe(['granted', 'denied']);
});

it('rejects an unknown choice, a non-uuid visitor and a missing locale', function () {
    $this->postJson('/api/v1/consents', validConsent(['choice' => 'maybe', 'visitor_id' => 'abc']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['choice', 'visitor_id']);

    $payload = validConsent();
    unset($payload['locale']);
    $this->postJson('/api/v1/consents', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['locale']);

    expect(ConsentRecord::count())->toBe(0);
});

it('lists consents read-only in the panel', function () {
    $this->actingAs(User::factory()->editor()->create());
    $record = ConsentRecord::create(validConsent() + ['ip_hash' => str_repeat('a', 64)]);

    livewire(ListConsentRecords::class)->assertCanSeeTableRecords([$record]);

    $this->get('/admin/consent-records/create')->assertNotFound();
    expect(User::factory()->editor()->create()->can('delete', $record))->toBeFalse();
});
