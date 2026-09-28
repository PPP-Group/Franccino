<?php

use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Filament\Resources\ContactMessages\Pages\ListContactMessages;
use App\Filament\Resources\ContactMessages\Pages\ViewContactMessage;
use App\Filament\Resources\DownloadLogs\Pages\ListDownloadLogs;
use App\Filament\Resources\NewsletterSubscribers\Pages\ListNewsletterSubscribers;
use App\Models\ContactMessage;
use App\Models\DownloadLog;
use App\Models\Finish;
use App\Models\NewsletterSubscriber;
use App\Models\Product;
use App\Models\User;

use function Pest\Livewire\livewire;

// Contact messages

it('lists messages and marks one as read', function () {
    $this->actingAs(User::factory()->editor()->create());
    $message = ContactMessage::factory()->create(['read_at' => null]);

    livewire(ListContactMessages::class)
        ->assertCanSeeTableRecords([$message])
        ->callTableAction('markAsRead', $message);

    expect($message->refresh()->read_at)->not->toBeNull();
});

it('does not allow creating messages in the panel', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get('/admin/contact-messages/create')
        ->assertNotFound();
});

it('lets only admins delete messages', function () {
    $editor = User::factory()->editor()->create();
    $message = ContactMessage::factory()->create();

    expect($editor->can('delete', $message))->toBeFalse()
        ->and(User::factory()->admin()->create()->can('delete', $message))->toBeTrue();
});

it('shows the related product and items with finish names and codes on the message view', function () {
    $this->actingAs(User::factory()->editor()->create());

    $product = Product::factory()->create();
    $keptFinish = Finish::factory()->create(['name' => ['pt' => 'Carvalho', 'en' => 'Oak'], 'code' => 'CRV-01']);
    $deletedFinishId = Finish::factory()->create()->id;
    $deletedProductId = Product::factory()->create()->id;
    Finish::whereKey($deletedFinishId)->delete();
    Product::whereKey($deletedProductId)->delete();

    $message = ContactMessage::factory()->create([
        'product_id' => $product->id,
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 2,
                'finish_ids' => [$keptFinish->id, $deletedFinishId],
                'note' => 'Entregar até dia 10',
            ],
            [
                'product_id' => $deletedProductId,
                'quantity' => 1,
                'finish_ids' => [],
                'note' => null,
            ],
        ],
    ]);

    livewire(ViewContactMessage::class, ['record' => $message->getRouteKey()])
        ->assertOk()
        ->assertSee($product->name)
        ->assertSee('CRV-01');
});

it('filters messages by type, read state and period', function () {
    $this->actingAs(User::factory()->editor()->create());

    $quote = ContactMessage::factory()->create(['type' => 'quote', 'read_at' => null, 'created_at' => now()]);
    $assistance = ContactMessage::factory()->create(['type' => 'assistance', 'read_at' => now(), 'created_at' => now()->subDays(10)]);

    livewire(ListContactMessages::class)
        ->filterTable('type', 'quote')
        ->assertCanSeeTableRecords([$quote])
        ->assertCanNotSeeTableRecords([$assistance])
        ->removeTableFilter('type')
        ->filterTable('read_at', false)
        ->assertCanSeeTableRecords([$quote])
        ->assertCanNotSeeTableRecords([$assistance]);
});

it('shows a navigation badge with the number of unread messages', function () {
    ContactMessage::factory()->count(2)->create(['read_at' => null]);
    ContactMessage::factory()->create(['read_at' => now()]);

    expect(ContactMessageResource::getNavigationBadge())->toBe('2');
});

// Newsletter subscribers

it('lists newsletter subscribers', function () {
    $this->actingAs(User::factory()->editor()->create());
    $subscribers = NewsletterSubscriber::factory()->count(2)->create();

    livewire(ListNewsletterSubscribers::class)->assertCanSeeTableRecords($subscribers);
});

it('does not allow creating newsletter subscribers in the panel', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get('/admin/newsletter-subscribers/create')
        ->assertNotFound();
});

it('lets only admins delete newsletter subscribers', function () {
    $editor = User::factory()->editor()->create();
    $subscriber = NewsletterSubscriber::factory()->create();

    expect($editor->can('delete', $subscriber))->toBeFalse()
        ->and(User::factory()->admin()->create()->can('delete', $subscriber))->toBeTrue();
});

// Download logs

it('lists download logs read-only, with product and period filters', function () {
    $this->actingAs(User::factory()->editor()->create());

    $product = Product::factory()->create();
    $log = DownloadLog::factory()->create(['product_id' => $product->id, 'created_at' => now()]);
    $otherLog = DownloadLog::factory()->create(['created_at' => now()->subDays(30)]);

    livewire(ListDownloadLogs::class)
        ->assertCanSeeTableRecords([$log, $otherLog])
        ->filterTable('product_id', $product->id)
        ->assertCanSeeTableRecords([$log])
        ->assertCanNotSeeTableRecords([$otherLog]);
});

it('does not allow creating or editing download logs in the panel', function () {
    $this->actingAs(User::factory()->admin()->create());
    $log = DownloadLog::factory()->create();

    $this->get('/admin/download-logs/create')->assertNotFound();
    $this->get("/admin/download-logs/{$log->id}/edit")->assertNotFound();
});
