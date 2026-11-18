<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Products\ProductResource;
use App\Support\SiteStatus;
use Filament\Widgets\ChartWidget;

/** How complete the published pieces are, in percent per part of the page (revisão de 17/11/2026). */
class CatalogCompletenessWidget extends ChartWidget
{
    protected static ?int $sort = 5;

    protected ?string $maxHeight = '260px';

    public static function canView(): bool
    {
        return ProductResource::canViewAny();
    }

    public function getHeading(): string
    {
        return __('guides.dashboard.chart.completeness');
    }

    public function getDescription(): ?string
    {
        return __('guides.dashboard.chart.completeness_hint');
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $values = app(SiteStatus::class)->completeness();

        return [
            'labels' => array_map(fn (string $key): string => __("guides.dashboard.chart.part.{$key}"), array_keys($values)),
            'datasets' => [[
                'label' => __('guides.dashboard.chart.percent'),
                'data' => array_values($values),
                'backgroundColor' => array_map(fn (int $value): string => $value >= 90 ? '#2e4a37' : ($value >= 50 ? '#7b4b2a' : '#9b2c1f'), array_values($values)),
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'indexAxis' => 'y',
            'plugins' => ['legend' => ['display' => false]],
            'scales' => ['x' => ['min' => 0, 'max' => 100, 'ticks' => ['stepSize' => 25]]],
        ];
    }
}
