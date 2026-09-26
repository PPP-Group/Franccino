<?php

it('returns 429 on the 301st read within a minute for the same ip', function () {
    for ($i = 0; $i < 300; $i++) {
        $this->getJson('/api/v1/areas')->assertOk();
    }

    $this->getJson('/api/v1/areas')->assertStatus(429);
});

it('does not limit reads carrying a valid X-Frontend-Key', function () {
    config(['franccino.frontend.api_key' => 'super-secret']);

    for ($i = 0; $i < 301; $i++) {
        $this->withHeaders(['X-Frontend-Key' => 'super-secret'])
            ->getJson('/api/v1/areas')
            ->assertOk();
    }
});

it('still limits reads carrying the wrong X-Frontend-Key', function () {
    config(['franccino.frontend.api_key' => 'super-secret']);

    for ($i = 0; $i < 300; $i++) {
        $this->withHeaders(['X-Frontend-Key' => 'wrong'])
            ->getJson('/api/v1/areas')
            ->assertOk();
    }

    $this->withHeaders(['X-Frontend-Key' => 'wrong'])
        ->getJson('/api/v1/areas')
        ->assertStatus(429);
});
