<?php

use App\Support\ContentLocale;
use App\Support\Localized;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Spatie\Translatable\HasTranslations;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

class LocalizedStub extends Model
{
    use HasTranslations;

    protected $table = 'localized_stubs';

    protected $guarded = [];

    public array $translatable = ['name', 'summary'];
}

beforeEach(function () {
    Schema::create('localized_stubs', function (Blueprint $table) {
        $table->id();
        $table->json('name');
        $table->json('summary')->nullable();
        $table->timestamps();
    });
});

it('returns the value in the requested locale', function () {
    $stub = LocalizedStub::create(['name' => ['pt' => 'Cadeira', 'en' => 'Chair']]);

    expect(Localized::value($stub, 'name', 'en'))->toBe('Chair')
        ->and(Localized::value($stub, 'name', 'pt'))->toBe('Cadeira');
});

it('falls back to portuguese when english is missing', function () {
    $stub = LocalizedStub::create(['name' => ['pt' => 'Cadeira']]);

    expect(Localized::value($stub, 'name', 'en'))->toBe('Cadeira')
        ->and(Localized::missing($stub, ['name'], 'en'))->toBeTrue()
        ->and(Localized::missing($stub, ['name'], 'pt'))->toBeFalse();
});

it('uses the current content locale by default', function () {
    $stub = LocalizedStub::create(['name' => ['pt' => 'Cadeira', 'en' => 'Chair']]);
    app(ContentLocale::class)->set('en');

    expect(Localized::value($stub, 'name'))->toBe('Chair');
});

it('returns null for empty values', function () {
    $stub = LocalizedStub::create(['name' => ['pt' => 'Cadeira'], 'summary' => ['pt' => '']]);

    expect(Localized::value($stub, 'summary', 'en'))->toBeNull();
});

it('resolves loose arrays', function () {
    expect(Localized::array(['pt' => 'Madeira', 'en' => 'Wood'], 'en'))->toBe('Wood')
        ->and(Localized::array(['pt' => 'Madeira', 'en' => null], 'en'))->toBe('Madeira')
        ->and(Localized::array(null, 'en'))->toBeNull();
});
