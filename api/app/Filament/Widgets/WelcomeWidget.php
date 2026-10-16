<?php

namespace App\Filament\Widgets;

use App\Filament\Pages\HelpCenter;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Auth;

class WelcomeWidget extends Widget
{
    protected static ?int $sort = 1;

    protected static bool $isLazy = false;

    protected int|string|array $columnSpan = 'full';

    protected string $view = 'filament.widgets.welcome';

    /** @return array{name: string, helpUrl: string, siteUrl: string} */
    protected function getViewData(): array
    {
        $name = (string) (Auth::user()->name ?? '');

        return [
            'name' => trim(strtok($name, ' ') ?: $name),
            'helpUrl' => HelpCenter::getUrl(),
            // FRONTEND_URL may list several origins (CORS); the first one is the public site.
            'siteUrl' => rtrim(trim(explode(',', (string) config('franccino.frontend.url'))[0]), '/').'/pt',
        ];
    }
}
