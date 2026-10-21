<?php

use App\Filament\RelationManagers\OrderedProductsRelationManager;
use App\Filament\Resources\Collections\Pages\EditCollection;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Filament\Resources\Products\RelationManagers\FinishesRelationManager;
use App\Models\Collection;
use App\Models\Finish;
use App\Models\Product;
use App\Models\User;
use Filament\Actions\AttachAction;
use Illuminate\Support\Facades\Storage;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Storage::fake('media');
    $this->actingAs(User::factory()->editor()->create());
});

it('adds pieces to the end of a collection and keeps the order they are dragged into', function () {
    $collection = Collection::factory()->create(['is_published' => true]);
    $first = publishedProduct();
    [$second, $third] = Product::factory()->count(2)
        ->for($first->area)->for($first->category)->for($first->designer)
        ->create(['is_published' => true])->all();
    $collection->products()->attach($first, ['sort_order' => 1]);

    livewire(OrderedProductsRelationManager::class, ['ownerRecord' => $collection, 'pageClass' => EditCollection::class])
        ->callTableAction(AttachAction::class, data: ['recordId' => [$second->id, $third->id]])
        ->assertHasNoTableActionErrors();

    expect($collection->products()->pluck('products.id')->all())->toBe([$first->id, $second->id, $third->id]);

    // The drag mode lists the pieces by the pivot column too: unqualified, MySQL refuses it as ambiguous.
    livewire(OrderedProductsRelationManager::class, ['ownerRecord' => $collection, 'pageClass' => EditCollection::class])
        ->call('toggleTableReordering')
        ->assertCanSeeTableRecords([$first, $second, $third], inOrder: true)
        ->call('reorderTable', [(string) $third->id, (string) $first->id, (string) $second->id]);

    expect($collection->products()->pluck('products.id')->all())->toBe([$third->id, $first->id, $second->id])
        ->and($this->getJson("/api/v1/collections/{$collection->slug}")->json('data.products.*.id'))->toBe([$third->id, $first->id, $second->id]);
});

it('orders the finishes of a piece', function () {
    $product = Product::factory()->create();
    [$oak, $linen] = Finish::factory()->count(2)->create()->all();

    livewire(FinishesRelationManager::class, ['ownerRecord' => $product, 'pageClass' => EditProduct::class])
        ->callTableAction(AttachAction::class, data: ['recordId' => [$oak->id, $linen->id]])
        ->call('reorderTable', [(string) $linen->id, (string) $oak->id]);

    expect($product->finishes()->pluck('finishes.id')->all())->toBe([$linen->id, $oak->id]);
});
