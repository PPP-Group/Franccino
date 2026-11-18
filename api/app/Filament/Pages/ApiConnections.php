<?php

namespace App\Filament\Pages;

use App\Manage\Areas;
use App\Manage\OAuth;
use App\Models\Manage\ApiCredential;
use App\Models\Manage\ApiLog;
use App\Models\User;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Support\Collection;

/**
 * API e conectores (docs/api-gestao.md): as chaves da API, os aplicativos conectados (Claude, ChatGPT), as últimas
 * chamadas e o passo a passo para conectar. Só o administrador.
 */
class ApiConnections extends Page implements HasTable
{
    use InteractsWithTable;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCommandLine;

    protected static ?string $slug = 'api-e-conectores';

    protected string $view = 'filament.pages.api-connections';

    /** O segredo da chave recém-criada: aparece uma vez, até fechar o aviso. */
    public ?string $newSecret = null;

    public ?string $newSecretName = null;

    public static function canAccess(): bool
    {
        $user = auth()->user();

        return $user instanceof User && $user->isAdmin() && ! $user->isApiAccount();
    }

    public static function getNavigationGroup(): ?string
    {
        return __('System');
    }

    public static function getNavigationLabel(): string
    {
        return 'API e conectores';
    }

    public function getTitle(): string
    {
        return 'API e conectores';
    }

    public function mcpUrl(): string
    {
        return OAuth::mcpResource();
    }

    public function docsUrl(): string
    {
        return OAuth::issuer().'/api/manage/docs';
    }

    /** @return Collection<int, ApiLog> */
    public function recentCalls(): Collection
    {
        return ApiLog::query()->with('credential')->latest('created_at')->limit(30)->get();
    }

    public function dismissSecret(): void
    {
        $this->newSecret = null;
        $this->newSecretName = null;
    }

    protected function getHeaderActions(): array
    {
        $areaFields = [];
        foreach (Areas::LIST as $area => $info) {
            $areaFields[] = Select::make("areas.{$area}")
                ->label($info['label'])
                ->options($info['write'] ? ['none' => 'Não', 'ler' => 'Ler', 'escrever' => 'Ler e mudar'] : ['none' => 'Não', 'ler' => 'Ler'])
                ->default('none')
                ->selectablePlaceholder(false)
                ->native(false);
        }

        return [
            Action::make('createKey')
                ->label('Criar chave')
                ->icon(Heroicon::OutlinedKey)
                ->modalHeading('Criar chave da API')
                ->modalDescription('O segredo aparece uma vez só, logo depois de criar. Dê só as permissões que a integração precisa.')
                ->modalSubmitActionLabel('Criar')
                ->schema([
                    TextInput::make('name')
                        ->label('Nome')
                        ->helperText('Para saber depois de onde vêm as chamadas (ex.: "Planilha de preços").')
                        ->required()
                        ->minLength(2)
                        ->maxLength(60),
                    Select::make('days')
                        ->label('Validade')
                        ->options(['7' => '7 dias', '30' => '30 dias', '90' => '90 dias', '180' => '180 dias', '365' => '1 ano', 'none' => 'Sem validade'])
                        ->default('90')
                        ->selectablePlaceholder(false)
                        ->native(false)
                        ->required(),
                    Select::make('all')
                        ->label('Atalho para todas as áreas')
                        ->options(['' => 'Escolher área por área', 'ler' => 'Todas: ler', 'escrever' => 'Todas: ler e mudar'])
                        ->default('')
                        ->native(false)
                        ->helperText('Liberar tudo dá à chave o mesmo alcance de um administrador nas áreas da API.'),
                    Section::make('Permissões por área')->schema($areaFields)->columns(2)->collapsible(),
                ])
                ->action(function (array $data): void {
                    $this->createKey($data);
                }),
        ];
    }

    /** @param  array<string, mixed>  $data */
    private function createKey(array $data): void
    {
        $active = ApiCredential::query()->active()->where('kind', ApiCredential::KEY)->count();
        if ($active >= ApiCredential::MAX_ACTIVE_KEYS) {
            Notification::make()->danger()->title('Já há '.ApiCredential::MAX_ACTIVE_KEYS.' chaves ativas')->body('Revogue uma antes de criar outra.')->send();

            return;
        }

        $scopes = [];
        foreach (Areas::LIST as $area => $info) {
            $level = in_array($data['all'] ?? '', ['ler', 'escrever'], true) ? $data['all'] : ($data['areas'][$area] ?? 'none');
            if ($level === 'escrever' && ! $info['write']) {
                $level = 'ler';
            }
            if ($level !== 'none') {
                $scopes[] = "{$area}:{$level}";
            }
        }
        if ($scopes === []) {
            Notification::make()->danger()->title('Escolha pelo menos uma permissão')->send();

            return;
        }

        $days = ($data['days'] ?? 'none') === 'none' ? null : (int) $data['days'];
        /** @var User $user */
        $user = auth()->user();
        [, $secret] = ApiCredential::issueKey(trim((string) $data['name']), $scopes, $days, $user);
        $this->newSecret = $secret;
        $this->newSecretName = trim((string) $data['name']);
        $this->resetTable();
    }

    public function table(Table $table): Table
    {
        return $table
            ->query(ApiCredential::query()->latest())
            ->heading('Chaves e aplicativos conectados')
            ->description('Chave: para scripts e integrações. Conector: o Claude ou o ChatGPT, aprovado por um administrador.')
            ->columns([
                TextColumn::make('name')->label('Nome')->searchable()->weight('medium'),
                TextColumn::make('kind')->label('Tipo')->badge()
                    ->formatStateUsing(fn (string $state): string => $state === ApiCredential::KEY ? 'Chave' : 'Conector')
                    ->color(fn (string $state): string => $state === ApiCredential::KEY ? 'gray' : 'info'),
                TextColumn::make('prefix')->label('Início')
                    ->formatStateUsing(fn (string $state, ApiCredential $record): string => $record->kind === ApiCredential::KEY ? $state.'…' : '—'),
                // `state()` and not `formatStateUsing()`: on an array column the format runs once per item, and the whole
                // sentence came out repeated for every area (revisão de 17/11/2026).
                TextColumn::make('permissions')->label('Permissões')->wrap()
                    ->state(fn (ApiCredential $record): string => Areas::summarize($record->scopes)),
                TextColumn::make('expires_at')->label('Validade')->date('d/m/Y')->placeholder('Sem validade'),
                TextColumn::make('last_used_at')->label('Último uso')->since()->placeholder('Nunca'),
                TextColumn::make('status')->label('Situação')->badge()
                    ->state(fn (ApiCredential $record): string => $record->revoked_at !== null ? 'Revogada' : ($record->isActive() ? 'Ativa' : 'Vencida'))
                    ->color(fn (string $state): string => $state === 'Ativa' ? 'success' : 'danger'),
            ])
            ->recordActions([
                Action::make('revoke')
                    ->label(fn (ApiCredential $record): string => $record->kind === ApiCredential::KEY ? 'Revogar' : 'Desconectar')
                    ->color('danger')
                    ->icon(Heroicon::OutlinedNoSymbol)
                    ->visible(fn (ApiCredential $record): bool => $record->isActive())
                    ->requiresConfirmation()
                    ->modalHeading(fn (ApiCredential $record): string => ($record->kind === ApiCredential::KEY ? 'Revogar a chave ' : 'Desconectar ').$record->name.'?')
                    ->modalDescription('Para de valer na hora. Quem usa precisa de uma chave nova ou de conectar de novo.')
                    ->action(function (ApiCredential $record): void {
                        $record->revoke();
                        Notification::make()->success()->title('Pronto: parou de valer.')->send();
                    }),
            ])
            ->emptyStateHeading('Nenhuma chave nem aplicativo conectado')
            ->emptyStateDescription('Crie uma chave ou conecte o Claude ou o ChatGPT pelo endereço acima.')
            ->paginated([10, 25, 50]);
    }
}
