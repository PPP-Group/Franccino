<?php

use App\Enums\RedirectStatus;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Line;
use App\Models\Product;
use App\Models\Redirect;

function redirectFor(string $from): ?Redirect
{
    return Redirect::query()->where('from_path', $from)->first();
}

it('creates a 301 from the legacy product URL to the new product page', function () {
    publishedProduct([
        'slug' => ['pt' => 'cadeira-aura', 'en' => 'aura-chair'],
        'legacy_url' => 'https://franccino.com.br/produto/cadeira-aura/',
    ]);

    $this->artisan('franccino:redirects:generate')->assertSuccessful();

    expect(redirectFor('/produto/cadeira-aura'))
        ->to_path->toBe('/pt/produtos/cadeira-aura')
        ->status_code->toBe(RedirectStatus::MovedPermanently)
        ->is_active->toBeTrue();
});

it('keeps redirects edited in the panel', function () {
    Redirect::factory()->create(['from_path' => '/produto/x', 'to_path' => '/pt/colecoes/tempo', 'notes' => 'ajuste manual']);
    publishedProduct(['slug' => ['pt' => 'x', 'en' => 'x'], 'legacy_url' => 'https://franccino.com.br/produto/x/']);

    $this->artisan('franccino:redirects:generate')->assertSuccessful();

    expect(redirectFor('/produto/x')->to_path)->toBe('/pt/colecoes/tempo');
});

it('normalizes query strings and is idempotent', function () {
    Line::factory()->create(['slug' => 'pinot', 'legacy_url' => 'https://franccino.com.br/?term=pinot&taxonomy=linhas']);

    $this->artisan('franccino:redirects:generate')->assertSuccessful();
    $this->artisan('franccino:redirects:generate')->assertSuccessful();

    expect(Redirect::query()->where('from_path', '/?taxonomy=linhas&term=pinot')->count())->toBe(1)
        ->and(redirectFor('/?taxonomy=linhas&term=pinot')->to_path)->toBe('/pt/produtos?line=pinot');
});

it('routes legacy categories under the area named in the old URL', function () {
    Category::factory()->published()->create([
        'slug' => ['pt' => 'banquetas', 'en' => 'stools'],
        'legacy_url' => 'https://franccino.com.br/categoria/externa/banqueta-giardini/',
    ]);

    $this->artisan('franccino:redirects:generate')->assertSuccessful();

    expect(redirectFor('/categoria/externa/banqueta-giardini')->to_path)->toBe('/pt/outdoor/banquetas');
});

it('writes the fixed pages, prefix fallbacks and gone paths from config', function () {
    $this->artisan('franccino:redirects:generate')->assertSuccessful();

    expect(redirectFor('/institucional')->to_path)->toBe('/pt/fabrica')
        ->and(redirectFor('/produto/*')->to_path)->toBe('/pt/produtos')
        ->and(redirectFor('/jet-popup/*'))
        ->status_code->toBe(RedirectStatus::Gone)
        ->to_path->toBeNull();
});

it('deactivates generated rules whose record was unpublished', function () {
    $collection = Collection::factory()->published()->create([
        'slug' => ['pt' => 'tempo', 'en' => 'time'],
        'legacy_url' => 'https://franccino.com.br/colecoes/colecao-tempo/',
    ]);
    $this->artisan('franccino:redirects:generate')->assertSuccessful();
    expect(redirectFor('/colecoes/colecao-tempo')->is_active)->toBeTrue();

    $collection->update(['is_published' => false]);
    $this->artisan('franccino:redirects:generate')->assertSuccessful();

    expect(redirectFor('/colecoes/colecao-tempo')->is_active)->toBeFalse();
});

it('writes nothing on a dry run', function () {
    Product::query()->delete();

    $this->artisan('franccino:redirects:generate', ['--dry-run' => true])->assertSuccessful();

    expect(Redirect::query()->count())->toBe(0);
});
