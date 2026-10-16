<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\ContentHealthWidget;
use App\Filament\Widgets\QuickActionsWidget;
use App\Filament\Widgets\WelcomeWidget;
use Filament\Pages\Dashboard as BaseDashboard;

/** Panel home: welcome with the tour and help, shortcuts to the daily tasks and what needs attention. */
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
            QuickActionsWidget::class,
            ContentHealthWidget::class,
        ];
    }

    public function getColumns(): int
    {
        return 1;
    }
}
