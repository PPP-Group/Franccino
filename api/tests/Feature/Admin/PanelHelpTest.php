<?php

use App\Filament\Pages\HelpCenter;
use App\Filament\Pages\ManageGeneralSettings;
use App\Filament\Support\PanelGuides;
use App\Models\ContactMessage;
use App\Models\User;
use App\Settings\GeneralSettings;

use function Pest\Livewire\livewire;

it('opens the panel home with the welcome, shortcuts and what needs attention', function () {
    publishedProduct();

    $this->actingAs(User::factory()->editor()->create(['name' => 'Matheus Francino']))
        ->get('/admin')
        ->assertOk()
        ->assertSee('Olá, Matheus')
        ->assertSee('Ver o tour')
        ->assertSee('Novo produto')
        ->assertSee('Banner da página inicial')
        ->assertSee('Produtos publicados')
        ->assertSee('Produtos sem nome em inglês');
});

it('hides the shortcuts a support user cannot use', function () {
    $this->actingAs(User::factory()->support()->create())
        ->get('/admin')
        ->assertOk()
        ->assertDontSee('Novo produto')
        ->assertDontSee('Produtos publicados');
});

it('counts unread messages on the messages shortcut', function () {
    ContactMessage::factory()->count(2)->create(['read_at' => null]);

    $this->actingAs(User::factory()->admin()->create())
        ->get('/admin')
        ->assertOk()
        ->assertSee('Mensagens não lidas');
});

it('lists every guide in the help center, with the link to each screen', function () {
    $this->actingAs(User::factory()->editor()->create());

    $response = $this->get(HelpCenter::getUrl())->assertOk();

    foreach (PanelGuides::keys() as $key) {
        $response->assertSee(trans("guides.sections.{$key}.title"));
    }

    $response->assertSee('Abrir a tela')->assertSee('Ver o tour de boas-vindas de novo');
});

it('shows a "Como preencher" button on screens that have a guide', function () {
    $this->actingAs(User::factory()->editor()->create())
        ->get('/admin/products')
        ->assertOk()
        ->assertSee('Como preencher')
        ->assertSee(HelpCenter::getUrl().'#products', escape: false);
});

it('maps panel routes to their guide', function () {
    expect(PanelGuides::forRoute('filament.admin.resources.products.edit'))->toBe('products')
        ->and(PanelGuides::forRoute('filament.admin.resources.finish-groups.index'))->toBe('finishes')
        ->and(PanelGuides::forRoute('filament.admin.pages.dashboard'))->toBeNull()
        ->and(PanelGuides::forRoute(null))->toBeNull();
});

it('shows field hints and the optional english note on the product form', function () {
    $this->actingAs(User::factory()->editor()->create())
        ->get('/admin/products/create')
        ->assertOk()
        ->assertSee(e(__('panel-help.product.area_id')), escape: false)
        ->assertSee(e(__('panel-help.slug')), escape: false)
        ->assertSee(e(__('guides.english_tab_note')), escape: false);
});

it('brings the welcome tour and the help link to signed-in pages only', function () {
    $this->get('/admin/login')
        ->assertOk()
        ->assertSee(__('guides.login'))
        ->assertDontSee('franccino-panel-tour-v1');

    $this->actingAs(User::factory()->editor()->create())
        ->get('/admin')
        ->assertSee('franccino-panel-tour-v1')
        ->assertSee(HelpCenter::getUrl(), escape: false);
});

it('turns share links into embeddable video players', function (string $url, ?string $embed) {
    expect(PanelGuides::videoEmbedUrl($url))->toBe($embed);
})->with([
    ['https://youtu.be/OG_GNCn0HoQ', 'https://www.youtube-nocookie.com/embed/OG_GNCn0HoQ'],
    ['https://www.youtube.com/watch?v=OG_GNCn0HoQ&t=3', 'https://www.youtube-nocookie.com/embed/OG_GNCn0HoQ'],
    ['https://vimeo.com/123456789', 'https://player.vimeo.com/video/123456789'],
    ['https://drive.google.com/file/d/1AbC-dEf_9/view?usp=sharing', 'https://drive.google.com/file/d/1AbC-dEf_9/preview'],
    ['https://example.com/video.mp4', null],
    ['', null],
]);

it('lets an admin set a tutorial video that the help center then plays', function () {
    $this->actingAs(User::factory()->admin()->create());

    livewire(ManageGeneralSettings::class)
        ->fillForm([
            'contact_recipients' => ['vendas@franccino.com.br'],
            'tutorial_videos' => [
                ['guide' => 'products', 'url' => 'https://youtu.be/OG_GNCn0HoQ'],
            ],
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    expect(app(GeneralSettings::class)->tutorial_videos[0]['guide'])->toBe('products');

    $this->get(HelpCenter::getUrl())
        ->assertOk()
        ->assertSee('https://www.youtube-nocookie.com/embed/OG_GNCn0HoQ', escape: false);
});

it('keeps the tutorial videos out of the public settings', function () {
    $this->getJson('/api/v1/settings', ['X-Frontend-Key' => config('franccino.frontend.api_key') ?? ''])
        ->assertJsonMissingPath('data.tutorial_videos');
});
