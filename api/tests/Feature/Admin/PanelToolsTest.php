<?php

use App\Enums\ContactProfession;
use App\Filament\Exports\ContactMessageExporter;
use App\Filament\Exports\NewsletterSubscriberExporter;
use App\Filament\Resources\Products\Pages\ListProducts;
use App\Filament\Widgets\QuickActionsWidget;
use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use App\Models\Product;
use App\Models\User;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

use function Pest\Livewire\livewire;

/** @return list<string> the shortcut labels the widget shows to the signed-in user */
function shortcutLabels(): array
{
    $data = (fn () => $this->getViewData())->call(new QuickActionsWidget);

    return array_column($data['shortcuts'], 'label');
}

/**
 * @param  class-string<Exporter>  $exporter
 * @return array<string, mixed> exported row, by column name
 */
function exportRow(string $exporter, object $record): array
{
    $columns = array_map(fn ($column) => $column->getName(), $exporter::getColumns());
    $row = (new $exporter(new Export, array_combine($columns, $columns), []))($record);

    return array_combine($columns, $row);
}

it('publishes and unpublishes the selected pieces at once', function () {
    $this->actingAs(User::factory()->editor()->create());
    $drafts = Product::factory()->count(2)->create(['is_published' => false]);
    $other = Product::factory()->create(['is_published' => false]);

    livewire(ListProducts::class)->callTableBulkAction('publish', $drafts);

    expect($drafts->each->refresh()->pluck('is_published')->all())->toBe([true, true])
        ->and($other->refresh()->is_published)->toBeFalse();

    livewire(ListProducts::class)->callTableBulkAction('unpublish', $drafts->take(1));

    expect($drafts->first()->refresh()->is_published)->toBeFalse()
        ->and($drafts->last()->refresh()->is_published)->toBeTrue();
});

it('shows each role only the shortcuts it can use, with the unread messages count', function () {
    ContactMessage::factory()->count(2)->create(['read_at' => null]);
    ContactMessage::factory()->create(['read_at' => now()]);

    $this->actingAs(User::factory()->editor()->create());
    expect(shortcutLabels())->toContain(__('guides.dashboard.shortcut.new_product'), __('guides.dashboard.shortcut.pages'));

    $this->actingAs(User::factory()->support()->create());
    $data = (fn () => $this->getViewData())->call(new QuickActionsWidget);
    expect(array_column($data['shortcuts'], 'label'))->toBe([__('guides.dashboard.shortcut.messages')])
        ->and($data['shortcuts'][0]['badge'])->toBe(2);
});

it('exports contact messages with readable type and profession', function () {
    $message = ContactMessage::factory()->create([
        'name' => 'Ana Souza',
        'profession' => ContactProfession::cases()[0],
        'city' => 'Belo Horizonte',
    ]);

    $row = exportRow(ContactMessageExporter::class, $message);

    expect($row['name'])->toBe('Ana Souza')
        ->and($row['type'])->toBe($message->type->label())
        ->and($row['profession'])->toBe(ContactProfession::cases()[0]->label())
        ->and($row['city'])->toBe('Belo Horizonte');
});

it('exports newsletter subscribers with the consent date', function () {
    $subscriber = NewsletterSubscriber::factory()->create(['email' => 'ana@example.com']);

    $row = exportRow(NewsletterSubscriberExporter::class, $subscriber);

    expect($row['email'])->toBe('ana@example.com')
        ->and($row)->toHaveKeys(['locale', 'consent_at', 'unsubscribed_at']);
});
