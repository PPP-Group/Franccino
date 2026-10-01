<?php

use App\Filament\RelationManagers\MediaLinksRelationManager;
use App\Filament\Resources\Designers\Pages\EditDesigner;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Models\Designer;
use App\Models\Launch;
use App\Models\Product;
use App\Models\User;

use function Pest\Livewire\livewire;

it('returns videos with embed url and links, in order, on the product page', function () {
    $product = Product::factory()->create();
    $product->mediaLinks()->create(['kind' => 'link', 'title' => ['pt' => 'Matéria na Casa Vogue'], 'url' => 'https://casavogue.globo.com/x', 'sort_order' => 2]);
    $product->mediaLinks()->create(['kind' => 'video', 'title' => ['pt' => 'Making of', 'en' => 'Making of'], 'url' => 'https://youtu.be/dQw4w9WgXcQ', 'sort_order' => 1]);

    $slug = $product->getTranslation('slug', 'pt');
    $links = $this->getJson("/api/v1/products/{$slug}")->assertOk()->json('data.media_links');

    expect($links)->toHaveCount(2)
        ->and($links[0])->toMatchArray(['kind' => 'video', 'title' => 'Making of', 'embed_url' => 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'])
        ->and($links[1])->toMatchArray(['kind' => 'link', 'url' => 'https://casavogue.globo.com/x', 'embed_url' => null]);
});

it('returns media links on designer and launch pages', function () {
    $designer = Designer::factory()->create();
    $designer->mediaLinks()->create(['kind' => 'video', 'title' => ['pt' => 'Entrevista'], 'url' => 'https://vimeo.com/76979871']);
    $launch = Launch::factory()->create();
    $launch->mediaLinks()->create(['kind' => 'link', 'title' => ['pt' => 'Catálogo'], 'url' => 'https://issuu.com/franccino']);

    expect($this->getJson("/api/v1/designers/{$designer->slug}")->json('data.media_links.0.embed_url'))
        ->toBe('https://player.vimeo.com/video/76979871');
    expect($this->getJson('/api/v1/launches/'.$launch->getTranslation('slug', 'pt'))->json('data.media_links.0.title'))
        ->toBe('Catálogo');
});

it('lets editors add a video to a product in the panel', function () {
    $this->actingAs(User::factory()->editor()->create());
    $product = Product::factory()->create();

    livewire(MediaLinksRelationManager::class, ['ownerRecord' => $product, 'pageClass' => EditProduct::class])
        ->callTableAction('create', data: [
            'kind' => 'video',
            'title' => ['pt' => 'Making of'],
            'url' => 'https://youtu.be/dQw4w9WgXcQ',
        ])
        ->assertHasNoTableActionErrors();

    expect($product->mediaLinks()->sole()->url)->toBe('https://youtu.be/dQw4w9WgXcQ');
});

it('stops adding videos or links to a product at the contract limit of 3', function () {
    $this->actingAs(User::factory()->editor()->create());
    $product = Product::factory()->create();
    $designer = Designer::factory()->create();
    foreach (range(1, MediaLinksRelationManager::PRODUCT_LIMIT) as $order) {
        $product->mediaLinks()->create(['kind' => 'link', 'title' => ['pt' => "Link {$order}"], 'url' => "https://example.com/{$order}", 'sort_order' => $order]);
        $designer->mediaLinks()->create(['kind' => 'link', 'title' => ['pt' => "Link {$order}"], 'url' => "https://example.com/{$order}", 'sort_order' => $order]);
    }

    livewire(MediaLinksRelationManager::class, ['ownerRecord' => $product, 'pageClass' => EditProduct::class])
        ->assertTableActionHidden('create');
    livewire(MediaLinksRelationManager::class, ['ownerRecord' => $designer, 'pageClass' => EditDesigner::class])
        ->assertTableActionVisible('create');
});
