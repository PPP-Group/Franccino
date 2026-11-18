<?php

namespace App\Filament\Widgets;

use App\Support\SiteStatus;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/** Is the site up, which version is running, how the queue and the backups are (revisão de 17/11/2026). */
class SiteStatusWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 2;

    protected static bool $isLazy = true;

    protected int|string|array $columnSpan = 'full';

    protected ?string $pollingInterval = null;

    protected function getHeading(): ?string
    {
        return __('guides.dashboard.status.heading');
    }

    protected function getDescription(): ?string
    {
        return __('guides.dashboard.status.description');
    }

    protected function getColumns(): int
    {
        return 4;
    }

    protected function getStats(): array
    {
        $status = app(SiteStatus::class);
        $site = $status->frontend();
        $version = $status->version();
        $queue = $status->queue();
        $backup = $status->lastBackup();

        return [
            Stat::make(__('guides.dashboard.status.site'), $site['up'] ? __('guides.dashboard.status.up') : __('guides.dashboard.status.down'))
                ->description($site['up']
                    ? __('guides.dashboard.status.site_ms', ['ms' => $site['ms']])
                    : __('guides.dashboard.status.site_down_hint'))
                ->icon($site['up'] ? 'heroicon-o-signal' : 'heroicon-o-signal-slash')
                ->color($site['up'] ? 'success' : 'danger')
                ->url((string) config('franccino.frontend.url'), shouldOpenInNewTab: true),
            Stat::make(
                __('guides.dashboard.status.version'),
                $version['deployed_at']?->timezone(config('app.timezone'))->format('d/m H:i') ?? '—',
            )
                ->description(trim(implode(' · ', array_filter([
                    $version['commit'],
                    'Laravel '.$version['laravel'],
                    'PHP '.$version['php'],
                ]))))
                ->icon('heroicon-o-code-bracket'),
            Stat::make(__('guides.dashboard.status.queue'), $queue['pending'])
                ->description($queue['failed_week'] > 0
                    ? __('guides.dashboard.status.queue_failed', ['count' => $queue['failed_week']])
                    : __('guides.dashboard.status.queue_ok'))
                ->icon('heroicon-o-queue-list')
                ->color($queue['failed_week'] > 0 ? 'danger' : ($queue['pending'] > 50 ? 'warning' : 'success')),
            Stat::make(
                __('guides.dashboard.status.backup'),
                $backup?->timezone(config('app.timezone'))->format('d/m H:i') ?? __('guides.dashboard.status.backup_none'),
            )
                ->description($backup !== null && $backup->greaterThan(now()->subDays(2))
                    ? __('guides.dashboard.status.backup_ok')
                    : __('guides.dashboard.status.backup_late'))
                ->icon('heroicon-o-archive-box')
                ->color($backup !== null && $backup->greaterThan(now()->subDays(2)) ? 'success' : 'warning'),
        ];
    }
}
