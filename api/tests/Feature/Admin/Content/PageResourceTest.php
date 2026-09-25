<?php

use App\Filament\Resources\Pages\Pages\EditPage;
use App\Models\Page;
use App\Models\User;
use Database\Seeders\PageSeeder;

use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->seed(PageSeeder::class);
    $this->actingAs(User::factory()->editor()->create());
});

it('saves blocks with texts in both languages', function () {
    $page = Page::where('key', 'factory')->sole();

    livewire(EditPage::class, ['record' => $page->getRouteKey()])
        ->fillForm([
            'content' => [
                ['type' => 'timeline', 'data' => ['items' => [
                    ['year' => '2000', 'title' => ['pt' => 'Fundação', 'en' => 'Foundation'], 'text' => ['pt' => 'Início', 'en' => 'Start']],
                ]]],
            ],
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    $block = $page->refresh()->content[0];

    expect($block['type'])->toBe('timeline')
        ->and($block['data']['items'][0]['title'])->toBe(['pt' => 'Fundação', 'en' => 'Foundation']);
});

it('does not allow creating or deleting pages', function () {
    $this->get('/admin/pages/create')->assertNotFound();
});
