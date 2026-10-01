<?php

use App\Filament\Resources\ActivityLogs\Pages\ListActivityLogs;
use App\Filament\Resources\ContactMessages\Pages\ListContactMessages;
use App\Models\ActivityLog;
use App\Models\ContactMessage;
use App\Models\Page;
use App\Models\Product;
use App\Models\User;
use App\Settings\GeneralSettings;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
use Spatie\MediaLibrary\Conversions\Events\ConversionHasBeenCompletedEvent;
use Spatie\MediaLibrary\MediaCollections\Events\MediaHasBeenAddedEvent;

use function Pest\Livewire\livewire;

// PPP-54: customer service role

it('lets customer service into the panel to read the inbox but not the content', function () {
    $support = User::factory()->support()->create();
    $message = ContactMessage::factory()->create();

    $this->actingAs($support)->get('/admin')->assertOk();
    livewire(ListContactMessages::class)->assertCanSeeTableRecords([$message]);

    expect($support->can('viewAny', Product::class))->toBeFalse()
        ->and($support->can('update', Page::factory()->make()))->toBeFalse()
        ->and($support->can('delete', $message))->toBeFalse();
    $this->get('/admin/products')->assertForbidden();
});

it('keeps admins and editors managing content', function (string $role) {
    $user = User::factory()->{$role}()->create();

    expect($user->can('create', Product::class))->toBeTrue()
        ->and($user->can('update', Page::factory()->make()))->toBeTrue();
})->with(['admin', 'editor']);

// PPP-54: activity log

it('records who created, edited and deleted a record, with field names only', function () {
    $editor = User::factory()->editor()->create(['name' => 'Ana Editora']);
    $this->actingAs($editor);

    $product = Product::factory()->create();
    $product->update(['sku' => 'NEW-1']);
    $product->delete();

    $logs = ActivityLog::query()->where('subject_type', $product->getMorphClass())->orderBy('id')->get();
    expect($logs->pluck('action')->all())->toBe(['created', 'updated', 'deleted'])
        ->and($logs->pluck('user_id')->unique()->all())->toBe([$editor->id])
        ->and($logs[1]->changes)->toBe(['sku'])
        ->and($logs[0]->subject_label)->toBe($product->getTranslation('name', 'pt'));
});

it('does not log changes made without a signed-in person (imports, seeders, public API)', function () {
    Product::factory()->create();

    expect(ActivityLog::count())->toBe(0);
});

it('labels contact messages by id so no visitor data is copied', function () {
    $this->actingAs(User::factory()->admin()->create());
    $message = ContactMessage::factory()->create(['name' => 'Maria Visitante']);

    $message->delete();

    expect(ActivityLog::query()->where('action', 'deleted')->sole()->subject_label)->toBe('#'.$message->id);
});

it('records panel sign-ins and settings changes', function () {
    $admin = User::factory()->admin()->create();
    Event::dispatch(new Login('web', $admin, false));

    $this->actingAs($admin);
    $settings = app(GeneralSettings::class);
    $settings->save();

    expect(ActivityLog::query()->where('action', 'login')->sole()->user_id)->toBe($admin->id)
        ->and(ActivityLog::query()->where('subject_type', 'settings')->sole()->action)->toBe('updated');
});

it('shows the activity log only to admins', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);
    Product::factory()->create();

    livewire(ListActivityLogs::class)->assertCanSeeTableRecords(ActivityLog::all());

    $this->actingAs(User::factory()->editor()->create())->get('/admin/activity-logs')->assertForbidden();
});

it('registers each listener once (no automatic discovery on top of the explicit ones)', function (string $event) {
    expect(Event::getListeners($event))->toHaveCount(1);
})->with([Login::class, MediaHasBeenAddedEvent::class, ConversionHasBeenCompletedEvent::class]);
