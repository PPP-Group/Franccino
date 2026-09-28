<?php

use App\Support\Locales;
use Tests\TestCase;

uses(TestCase::class);

it('lists the configured content locales', function () {
    expect(Locales::all())->toBe(['pt', 'en']);
});

it('has portuguese as the default locale', function () {
    expect(Locales::default())->toBe('pt');
});

it('knows which locales are supported', function () {
    expect(Locales::isSupported('en'))->toBeTrue()
        ->and(Locales::isSupported('es'))->toBeFalse()
        ->and(Locales::isSupported(null))->toBeFalse();
});

it('returns a human label for a locale', function () {
    expect(Locales::label('pt'))->toBe('Português')
        ->and(Locales::label('en'))->toBe('English');
});
