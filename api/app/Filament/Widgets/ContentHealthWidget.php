<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Filament\Resources\Products\ProductResource;
use App\Models\ContactMessage;
use App\Models\Product;
use App\Support\Locales;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Builder;

/** What still needs work in the catalog, so the team knows where to start. */
class ContentHealthWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 3;

    protected static bool $isLazy = false;

    protected int|string|array $columnSpan = 'full';

    protected ?string $pollingInterval = null;

    public static function canView(): bool
    {
        return ProductResource::canViewAny();
    }

    protected function getHeading(): ?string
    {
        return __('guides.dashboard.health');
    }

    protected function getStats(): array
    {
        $products = ProductResource::getUrl();
        $published = Product::query()->where('is_published', true);
        $default = Locales::default();
        $other = collect(Locales::all())->first(fn (string $locale): bool => $locale !== $default);

        $stats = [
            Stat::make(__('guides.dashboard.stat.published'), (clone $published)->count())
                ->description(__('guides.dashboard.stat.published_hint', ['count' => Product::query()->count()]))
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->url($products),
            Stat::make(__('guides.dashboard.stat.drafts'), Product::query()->where('is_published', false)->count())
                ->description(__('guides.dashboard.stat.drafts_hint'))
                ->icon('heroicon-o-pencil-square')
                ->url($products),
            Stat::make(
                __('guides.dashboard.stat.no_cover'),
                Product::query()->whereDoesntHave('media', fn (Builder $query) => $query->where('collection_name', 'cover'))->count(),
            )
                ->description(__('guides.dashboard.stat.no_cover_hint'))
                ->icon('heroicon-o-photo')
                ->color('warning')
                ->url($products),
            Stat::make(
                __('guides.dashboard.stat.no_description'),
                (clone $published)->where(fn (Builder $query) => $query
                    ->whereNull("description->{$default}")
                    ->orWhere("description->{$default}", ''))
                    ->count(),
            )
                ->description(__('guides.dashboard.stat.no_description_hint'))
                ->icon('heroicon-o-document-text')
                ->color('warning')
                ->url($products),
        ];

        if ($other !== null) {
            $stats[] = Stat::make(
                __('guides.dashboard.stat.no_english'),
                (clone $published)->where(fn (Builder $query) => $query
                    ->whereNull("name->{$other}")
                    ->orWhere("name->{$other}", ''))
                    ->count(),
            )
                ->description(__('guides.dashboard.stat.no_english_hint'))
                ->icon('heroicon-o-language')
                ->url($products);
        }

        if (ContactMessageResource::canViewAny()) {
            $stats[] = Stat::make(__('guides.dashboard.stat.unread'), ContactMessage::query()->whereNull('read_at')->count())
                ->description(__('guides.dashboard.stat.unread_hint'))
                ->icon('heroicon-o-envelope')
                ->color('danger')
                ->url(ContactMessageResource::getUrl());
        }

        return $stats;
    }
}
