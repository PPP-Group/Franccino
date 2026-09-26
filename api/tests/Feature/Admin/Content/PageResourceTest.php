<?php

use App\Filament\Resources\Pages\Pages\EditPage;
use App\Models\Page;
use App\Models\User;
use Database\Seeders\PageSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Storage::fake('media');
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

it('saves image_text and cta blocks with texts in both languages', function () {
    $page = Page::where('key', 'factory')->sole();

    livewire(EditPage::class, ['record' => $page->getRouteKey()])
        ->fillForm([
            'content' => [
                [
                    'type' => 'image_text',
                    'data' => [
                        'image' => [UploadedFile::fake()->image('factory.jpg', 1200, 800)],
                        'image_position' => 'right',
                        'heading' => ['pt' => 'Nossa fábrica', 'en' => 'Our factory'],
                        'body' => ['pt' => '<p>Texto</p>', 'en' => '<p>Text</p>'],
                    ],
                ],
                [
                    'type' => 'cta',
                    'data' => [
                        'heading' => ['pt' => 'Fale conosco', 'en' => 'Talk to us'],
                        'body' => ['pt' => 'Corpo', 'en' => 'Body'],
                        'label' => ['pt' => 'Contato', 'en' => 'Contact'],
                        'url' => ['pt' => 'https://franccino.com.br/contato', 'en' => 'https://franccino.com/contact'],
                    ],
                ],
            ],
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    $content = $page->refresh()->content;

    expect($content[0]['type'])->toBe('image_text')
        ->and($content[0]['data']['image_position'])->toBe('right')
        ->and($content[0]['data']['heading'])->toBe(['pt' => 'Nossa fábrica', 'en' => 'Our factory'])
        ->and($content[0]['data']['image'])->toBeString()
        ->and($content[1]['type'])->toBe('cta')
        ->and($content[1]['data']['label'])->toBe(['pt' => 'Contato', 'en' => 'Contact'])
        ->and($content[1]['data']['url'])->toBe(['pt' => 'https://franccino.com.br/contato', 'en' => 'https://franccino.com/contact']);
});

it('does not allow creating or deleting pages', function () {
    $this->get('/admin/pages/create')->assertNotFound();
});
