<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Banners\BannerResource;
use App\Filament\Resources\Clients\ClientResource;
use App\Filament\Resources\Collections\CollectionResource;
use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Filament\Resources\Launches\LaunchResource;
use App\Filament\Resources\Pages\PageResource;
use App\Filament\Resources\Products\ProductResource;
use App\Filament\Resources\Stores\StoreResource;
use App\Models\ContactMessage;
use Filament\Resources\Resource;
use Filament\Widgets\Widget;

/** Big buttons for the daily tasks; each one only shows when the user may open that screen. */
class QuickActionsWidget extends Widget
{
    protected static ?int $sort = 2;

    protected static bool $isLazy = false;

    protected int|string|array $columnSpan = 'full';

    protected string $view = 'filament.widgets.quick-actions';

    /**
     * label key => [resource, page, icon].
     *
     * @var array<string, array{class-string<resource>, string, string}>
     */
    private const SHORTCUTS = [
        'new_product' => [ProductResource::class, 'create', 'heroicon-o-plus-circle'],
        'new_collection' => [CollectionResource::class, 'create', 'heroicon-o-rectangle-stack'],
        'new_launch' => [LaunchResource::class, 'create', 'heroicon-o-sparkles'],
        'banners' => [BannerResource::class, 'index', 'heroicon-o-photo'],
        'pages' => [PageResource::class, 'index', 'heroicon-o-document-text'],
        'stores' => [StoreResource::class, 'index', 'heroicon-o-map-pin'],
        'clients' => [ClientResource::class, 'index', 'heroicon-o-building-office-2'],
        'messages' => [ContactMessageResource::class, 'index', 'heroicon-o-envelope'],
    ];

    /** @return array{shortcuts: list<array{label: string, url: string, icon: string, badge: ?int}>} */
    protected function getViewData(): array
    {
        $shortcuts = [];

        foreach (self::SHORTCUTS as $key => [$resource, $page, $icon]) {
            $allowed = $page === 'create' ? $resource::canCreate() : $resource::canViewAny();

            if (! $allowed) {
                continue;
            }

            $shortcuts[] = [
                'label' => __("guides.dashboard.shortcut.{$key}"),
                'url' => $resource::getUrl($page),
                'icon' => $icon,
                'badge' => $key === 'messages' ? (ContactMessage::query()->whereNull('read_at')->count() ?: null) : null,
            ];
        }

        return ['shortcuts' => $shortcuts];
    }
}
