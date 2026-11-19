<?php

use App\Models\Banner;
use App\Models\Collection as CollectionModel;
use App\Models\Launch;
use App\Models\Product;
use App\Models\Project;
use App\Settings\GeneralSettings;

it('attaches products to collections, launches and projects', function () {
    $product = Product::factory()->create();
    $collection = CollectionModel::factory()->create();
    $launch = Launch::factory()->create(['year' => now()->year]);
    $project = Project::factory()->create();

    $collection->products()->attach($product, ['sort_order' => 1]);
    $launch->products()->attach($product, ['sort_order' => 1]);
    $project->products()->attach($product);

    expect($product->collections)->toHaveCount(1)
        ->and($product->launches)->toHaveCount(1)
        ->and($product->projects)->toHaveCount(1);
});

it('flags a product as new for a year after it entered a published launch', function () {
    $recent = Product::factory()->create();
    $old = Product::factory()->create();
    $launch = Launch::factory()->create(['year' => now()->year, 'is_published' => true]);
    $launch->products()->attach($recent);
    $launch->products()->attach($old);
    $launch->products()->updateExistingPivot($old->id, ['created_at' => now()->subMonths(13)]);

    expect($recent->isNew())->toBeTrue()->and($old->fresh()->isNew())->toBeFalse();
});

it('shows banners only inside their window', function () {
    Banner::factory()->create(['starts_at' => now()->subDay(), 'ends_at' => now()->addDay()]);
    Banner::factory()->create(['starts_at' => now()->addDay()]);
    Banner::factory()->create(['ends_at' => now()->subDay()]);
    Banner::factory()->unpublished()->create();

    expect(Banner::visible()->count())->toBe(1);
});

it('reads general settings with defaults', function () {
    $settings = app(GeneralSettings::class);

    expect($settings->company_name)->toBe('Franccino')
        ->and($settings->contact_recipients)->toBe([]);
});
