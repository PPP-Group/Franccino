<?php

use App\Models\Finish;
use App\Models\FinishGroup;

it('lists finish groups with only published finishes, in the contract shape', function () {
    $group = FinishGroup::factory()->create(['name' => ['pt' => 'Madeiras', 'en' => 'Woods']]);
    Finish::factory()->for($group, 'group')->create(['name' => ['pt' => 'Carvalho', 'en' => 'Oak']]);
    Finish::factory()->for($group, 'group')->create(['is_published' => false]);

    $emptyGroup = FinishGroup::factory()->create();

    $response = $this->getJson('/api/v1/finishes')->assertOk();

    $response->assertJsonStructure([
        'data' => ['*' => ['id', 'name', 'items' => ['*' => ['id', 'name', 'code', 'description', 'swatch']]]],
    ]);

    $payload = collect($response->json('data'))->firstWhere('id', $group->id);
    expect($payload['items'])->toHaveCount(1);
    expect(collect($response->json('data'))->pluck('id'))->not->toContain($emptyGroup->id);
});
