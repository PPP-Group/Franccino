<?php

use App\Filament\Resources\Areas\Pages\EditArea;
use App\Filament\Resources\Areas\Pages\ListAreas;
use App\Filament\Resources\Categories\Pages\CreateCategory;
use App\Filament\Resources\Categories\Pages\ListCategories;
use App\Filament\Resources\Finishes\Pages\CreateFinish;
use App\Filament\Resources\Finishes\Pages\ListFinishes;
use App\Filament\Resources\FinishGroups\Pages\CreateFinishGroup;
use App\Filament\Resources\FinishGroups\Pages\ListFinishGroups;
use App\Filament\Resources\Lines\Pages\CreateLine;
use App\Filament\Resources\Lines\Pages\ListLines;
use App\Models\Category;
use App\Models\Finish;
use App\Models\FinishGroup;
use App\Models\Line;
use App\Models\User;

use function Pest\Livewire\livewire;

beforeEach(fn () => $this->actingAs(User::factory()->editor()->create()));

// Categories

it('lists categories', function () {
    $categories = Category::factory()->count(3)->create();

    livewire(ListCategories::class)->assertCanSeeTableRecords($categories);
});

it('creates a category in both languages', function () {
    livewire(CreateCategory::class)
        ->fillForm([
            'name' => ['pt' => 'Cadeiras', 'en' => 'Chairs'],
            'singular_name' => ['pt' => 'Cadeira', 'en' => 'Chair'],
            'slug' => ['pt' => 'cadeiras', 'en' => 'chairs'],
            'is_published' => true,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $category = Category::sole();

    expect($category->getTranslation('name', 'en'))->toBe('Chairs')
        ->and($category->getTranslation('slug', 'pt'))->toBe('cadeiras');
});

// Lines

it('lists lines', function () {
    $lines = Line::factory()->count(3)->create();

    livewire(ListLines::class)->assertCanSeeTableRecords($lines);
});

it('creates a line', function () {
    livewire(CreateLine::class)
        ->fillForm([
            'name' => 'Linha Aura',
            'slug' => 'linha-aura',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Line::sole())
        ->name->toBe('Linha Aura')
        ->slug->toBe('linha-aura');
});

// Finishes

it('lists finishes', function () {
    $finishes = Finish::factory()->count(3)->create();

    livewire(ListFinishes::class)->assertCanSeeTableRecords($finishes);
});

it('creates a finish in both languages', function () {
    $group = FinishGroup::factory()->create();

    livewire(CreateFinish::class)
        ->fillForm([
            'finish_group_id' => $group->id,
            'name' => ['pt' => 'Nogueira', 'en' => 'Walnut'],
            'is_published' => true,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $finish = Finish::sole();

    expect($finish->getTranslation('name', 'en'))->toBe('Walnut')
        ->and($finish->finish_group_id)->toBe($group->id);
});

// Finish groups

it('lists finish groups', function () {
    $groups = FinishGroup::factory()->count(3)->create();

    livewire(ListFinishGroups::class)->assertCanSeeTableRecords($groups);
});

it('creates a finish group in both languages', function () {
    livewire(CreateFinishGroup::class)
        ->fillForm([
            'name' => ['pt' => 'Madeiras', 'en' => 'Woods'],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(FinishGroup::sole()->getTranslation('name', 'en'))->toBe('Woods');
});

// Areas — fixed set of records: no create action, edition only.

it('lists areas', function () {
    $areas = collect([area('indoor'), area('outdoor')]);

    livewire(ListAreas::class)->assertCanSeeTableRecords($areas);
});

it('has no create action for areas', function () {
    $this->get('/admin/areas/create')->assertNotFound();
});

it('saves an area edition in english', function () {
    $area = area('indoor');

    livewire(EditArea::class, ['record' => $area->getRouteKey()])
        ->fillForm(['description' => ['en' => 'Updated indoor description']])
        ->call('save')
        ->assertHasNoFormErrors();

    expect($area->refresh()->getTranslation('description', 'en'))->toBe('Updated indoor description');
});
