<?php

namespace App\Filament\Pages;

use App\Filament\Support\PanelGuides;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;

/** Step-by-step guides for every panel screen, with an optional video each (set in Settings). */
class HelpCenter extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedLifebuoy;

    protected static ?int $navigationSort = -1;

    protected static ?string $slug = 'ajuda';

    protected string $view = 'filament.pages.help-center';

    public static function getNavigationLabel(): string
    {
        return __('guides.center.title');
    }

    public function getTitle(): string
    {
        return __('guides.center.title');
    }

    /** @return list<array{key: string, title: string, summary: string, steps: list<string>, tips: list<string>, url: ?string, video: ?string}> */
    public function getGuides(): array
    {
        return PanelGuides::all();
    }
}
