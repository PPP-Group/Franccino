<?php

use App\Support\IpHasher;
use Tests\TestCase;

uses(TestCase::class);

it('hashes an ip address into a 64 character hex string', function () {
    $hash = IpHasher::hash('1.2.3.4');

    expect($hash)->toHaveLength(64)
        ->and($hash)->toMatch('/^[0-9a-f]{64}$/');
});

it('is deterministic for the same ip', function () {
    expect(IpHasher::hash('1.2.3.4'))->toBe(IpHasher::hash('1.2.3.4'));
});

it('differs for different ips', function () {
    expect(IpHasher::hash('1.2.3.4'))->not->toBe(IpHasher::hash('1.2.3.5'));
});

it('hashes a null ip without failing', function () {
    expect(IpHasher::hash(null))->toHaveLength(64);
});
