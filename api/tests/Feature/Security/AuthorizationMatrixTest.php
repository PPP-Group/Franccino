<?php

use App\Enums\UserRole;
use App\Filament\Pages\HelpCenter;
use App\Filament\Pages\ManageGeneralSettings;
use App\Models\ActivityLog;
use App\Models\Area;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Client;
use App\Models\Collection;
use App\Models\ConsentRecord;
use App\Models\ContactMessage;
use App\Models\Designer;
use App\Models\DownloadLog;
use App\Models\Finish;
use App\Models\FinishGroup;
use App\Models\Launch;
use App\Models\Line;
use App\Models\MediaLink;
use App\Models\NewsletterSubscriber;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductFile;
use App\Models\Project;
use App\Models\Redirect;
use App\Models\Store;
use App\Models\User;

/*
 * Who may do what in the panel (docs/data-model.md, "Permissões"), one row per model. Each cell lists the roles that
 * may view the list, create, update and delete. The test runs every model × role × ability.
 */
$content = ['view' => ['admin', 'editor'], 'create' => ['admin', 'editor'], 'update' => ['admin', 'editor'], 'delete' => ['admin', 'editor']];
$fixed = ['view' => ['admin', 'editor'], 'create' => [], 'update' => ['admin', 'editor'], 'delete' => []];
$inbox = ['view' => ['admin', 'editor', 'support'], 'create' => [], 'update' => ['admin', 'editor', 'support'], 'delete' => ['admin']];
$adminOnly = ['view' => ['admin'], 'create' => ['admin'], 'update' => ['admin'], 'delete' => ['admin']];

$matrix = [
    'products' => [Product::class, $content],
    'product files' => [ProductFile::class, $content],
    'media links' => [MediaLink::class, $content],
    'categories' => [Category::class, $content],
    'lines' => [Line::class, $content],
    'designers' => [Designer::class, $content],
    'finish groups' => [FinishGroup::class, $content],
    'finishes' => [Finish::class, $content],
    'collections' => [Collection::class, $content],
    'launches' => [Launch::class, $content],
    'projects' => [Project::class, $content],
    'clients' => [Client::class, $content],
    'stores' => [Store::class, $content],
    'banners' => [Banner::class, $content],
    'areas' => [Area::class, $fixed],
    'pages' => [Page::class, $fixed],
    'contact messages' => [ContactMessage::class, $inbox],
    'newsletter' => [NewsletterSubscriber::class, $inbox],
    'download logs' => [DownloadLog::class, $inbox],
    'cookie consents' => [ConsentRecord::class, $inbox],
    'redirects' => [Redirect::class, $adminOnly],
    'activity log' => [ActivityLog::class, $adminOnly],
    'users' => [User::class, ['view' => ['admin'], 'create' => ['admin'], 'update' => ['admin'], 'delete' => []]],
];

dataset('roles', ['admin', 'editor', 'support']);

it('lets each role do only what the permission table says', function (string $model, array $allowed, string $role) {
    $user = User::factory()->create(['role' => UserRole::from($role)]);
    // `users.delete` is empty because nobody deletes themselves; deleting someone else is covered in PanelSecurityTest.
    $record = $model === User::class ? $user : new $model;

    expect($user->can('viewAny', $model))->toBe(in_array($role, $allowed['view'], true), "{$role} viewAny {$model}")
        ->and($user->can('create', $model))->toBe(in_array($role, $allowed['create'], true), "{$role} create {$model}")
        ->and($user->can('update', $record))->toBe(in_array($role, $allowed['update'], true), "{$role} update {$model}")
        ->and($user->can('delete', $record))->toBe(in_array($role, $allowed['delete'], true), "{$role} delete {$model}");
})->with($matrix)->with('roles');

it('opens the settings only to administrators, and the help to everyone', function (string $role) {
    $this->actingAs(User::factory()->create(['role' => UserRole::from($role)]));

    $this->get(ManageGeneralSettings::getUrl())->assertStatus($role === 'admin' ? 200 : 403);
    $this->get(HelpCenter::getUrl())->assertOk();
})->with('roles');

it('keeps inactive users out of the panel', function () {
    $this->actingAs(User::factory()->admin()->create(['is_active' => false]));

    $this->get('/admin')->assertForbidden();
});
