<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\ActivityChartWidget;
use App\Filament\Widgets\CatalogCompletenessWidget;
use App\Filament\Widgets\ContentHealthWidget;
use App\Filament\Widgets\QuickActionsWidget;
use App\Filament\Widgets\SiteStatusWidget;
use App\Filament\Widgets\WelcomeWidget;
use Filament\Pages\Dashboard as BaseDashboard;

/**
 * Panel home: welcome, the site health (up, version, queue, backup), shortcuts to the daily tasks, two charts (contacts
 * per day and how complete the catalog is) and what needs attention (revisão de 17/11/2026: "dashboard com gráficos").
 */
class Dashboard extends BaseDashboard
{
    public static function getNavigationLabel(): string
    {
        return __('guides.dashboard.title');
    }

    public function getTitle(): string
    {
        return __('guides.dashboard.title');
    }

    public function getWidgets(): array
    {
        return [
            WelcomeWidget::class,
            SiteStatusWidget::class,
            QuickActionsWidget::class,
            ActivityChartWidget::class,
            CatalogCompletenessWidget::class,
            ContentHealthWidget::class,
        ];
    }

    /** Two columns on large screens: the two charts side by side, the rest across the page. */
    public function getColumns(): int|array
    {
        return ['default' => 1, 'lg' => 2];
    }
}
