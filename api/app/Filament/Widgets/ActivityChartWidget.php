<?php

namespace App\Filament\Widgets;

use App\Support\SiteStatus;
use Filament\Widgets\ChartWidget;

/** Messages, wish lists and technical downloads per day, last 30 days (revisão de 17/11/2026). */
class ActivityChartWidget extends ChartWidget
{
    protected static ?int $sort = 4;

    protected ?string $maxHeight = '260px';

    public function getHeading(): string
    {
        return __('guides.dashboard.chart.activity');
    }

    public function getDescription(): ?string
    {
        return __('guides.dashboard.chart.activity_hint');
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getData(): array
    {
        $data = app(SiteStatus::class)->activity();

        return [
            'labels' => $data['labels'],
            'datasets' => [
                ['label' => __('guides.dashboard.chart.messages'), 'data' => $data['messages'], 'borderColor' => '#171717', 'backgroundColor' => '#171717', 'tension' => 0.3],
                ['label' => __('guides.dashboard.chart.lists'), 'data' => $data['lists'], 'borderColor' => '#7b4b2a', 'backgroundColor' => '#7b4b2a', 'tension' => 0.3],
                ['label' => __('guides.dashboard.chart.downloads'), 'data' => $data['downloads'], 'borderColor' => '#2e4a37', 'backgroundColor' => '#2e4a37', 'tension' => 0.3],
            ],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => ['legend' => ['position' => 'bottom']],
            'scales' => ['y' => ['beginAtZero' => true, 'ticks' => ['precision' => 0]]],
        ];
    }
}
