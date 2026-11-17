<?php

namespace App\Filament\Pages;

use App\Manage\ApiProblem;
use App\Manage\Areas;
use App\Manage\OAuth;
use App\Models\Manage\OAuthRequest;
use App\Models\User;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Livewire\Attributes\Url;

/**
 * A janela de aprovar a conexão de um aplicativo (Claude, ChatGPT) pelo OAuth: quem pede, para onde a pessoa volta e
 * as permissões pedidas, que o administrador pode diminuir. Fora do menu; o `/oauth/authorize` manda para cá.
 */
class ConnectApp extends Page
{
    protected static ?string $slug = 'connect-app';

    protected static bool $shouldRegisterNavigation = false;

    protected string $view = 'filament.pages.connect-app';

    #[Url(as: 'request')]
    public string $requestId = '';

    /** @var array<string, string> Nível escolhido por área: `none`, `ler` ou `escrever`. */
    public array $levels = [];

    public static function canAccess(): bool
    {
        $user = auth()->user();

        return $user instanceof User && $user->isAdmin() && ! $user->isApiAccount();
    }

    public function getTitle(): string
    {
        return 'Conectar aplicativo';
    }

    public function mount(): void
    {
        $request = $this->pendingRequest();
        if ($request === null) {
            return;
        }
        foreach (Areas::LIST as $area => $info) {
            $this->levels[$area] = match (true) {
                in_array("{$area}:escrever", $request->scopes, true) => 'escrever',
                in_array("{$area}:ler", $request->scopes, true) => 'ler',
                default => 'none',
            };
        }
    }

    public function pendingRequest(): ?OAuthRequest
    {
        return $this->requestId !== '' ? OAuth::pending($this->requestId) : null;
    }

    public function appName(): string
    {
        $request = $this->pendingRequest();

        return $request ? OAuth::clientName($request->client_id) : '';
    }

    public function returnHost(): string
    {
        return (string) parse_url((string) $this->pendingRequest()?->redirect_uri, PHP_URL_HOST);
    }

    /** @return list<string> O máximo de cada área que o aplicativo pediu. */
    public function requestedLevels(string $area): array
    {
        $request = $this->pendingRequest();
        if ($request === null) {
            return [];
        }

        return match (true) {
            in_array("{$area}:escrever", $request->scopes, true) => ['none', 'ler', 'escrever'],
            in_array("{$area}:ler", $request->scopes, true) => ['none', 'ler'],
            default => [],
        };
    }

    public function approve(): void
    {
        $request = $this->pendingRequest();
        if ($request === null) {
            Notification::make()->danger()->title('O pedido venceu')->body('Volte ao aplicativo e conecte de novo.')->send();

            return;
        }
        $scopes = [];
        foreach ($this->levels as $area => $level) {
            if (in_array($level, ['ler', 'escrever'], true) && isset(Areas::LIST[$area])) {
                $scopes[] = "{$area}:{$level}";
            }
        }

        try {
            /** @var User $user */
            $user = auth()->user();
            $this->redirect(OAuth::approve($request, $scopes, $user));
        } catch (ApiProblem $problem) {
            Notification::make()->danger()->title($problem->getMessage())->send();
        }
    }

    public function deny(): void
    {
        $request = $this->pendingRequest();
        if ($request === null) {
            $this->redirect(ApiConnections::getUrl());

            return;
        }
        $this->redirect(OAuth::deny($request));
    }
}
