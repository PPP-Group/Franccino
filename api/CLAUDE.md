# CLAUDE.md — api/ (Laravel)

Complementa o `CLAUDE.md` da raiz. Regras específicas do backend Laravel + Filament.

## Comandos

```bash
composer lint              # Pint em modo verificacao (--test)
composer analyse            # PHPStan via Larastan, nivel 5
composer test                # suite Pest completa (= php artisan test)
php artisan test --filter=NomeDoTeste   # roda só um teste ou arquivo
```

## Onde fica cada tipo de código

- `app/Actions` — casos de uso de escrita (ex.: `SubmitContactMessage`)
- `app/Enums` — enums com rótulo traduzido
- `app/Filament` — painel administrativo: `Resources`, `Pages`, `Support` (`Translatable`,
  `CommonFields`), `Exports`, `Concerns`
- `app/Http/Controllers/Api/V1` — um controller por recurso da API, enxuto
- `app/Http/Middleware` — `SetContentLocale`, `NoStoreCache`
- `app/Http/Requests/Api/V1` — Form Requests de validação da API
- `app/Http/Resources/V1` — serialização das respostas da API (Refs + Resources)
- `app/Jobs`, `app/Listeners`, `app/Observers` — jobs assíncronos e revalidação do front
- `app/Models` (+ `Models/Concerns`) — um model por tabela de `docs/data-model.md`
- `app/Policies` — autorização do painel
- `app/Queries` — consultas e filtros reutilizáveis (ex.: `ProductQuery`, `ProductFacets`)
- `app/Services` — integrações externas (ex.: `Turnstile`)
- `app/Settings` — configurações persistidas (spatie/laravel-settings)
- `app/Support` — helpers (`Locales`, `ContentLocale`, `Localized`, `ImagePresenter`,
  `FrontendRevalidator`, ...)
- `database/{migrations,factories,seeders,settings}`
- `lang/pt_BR.json` — traduções da interface do painel
- `routes/api.php` — rotas públicas da API, sempre com prefixo `/api`
- `tests/{Feature/Admin,Feature/Api/V1,Unit}`

## Regras

- Nenhum texto de interface do painel fica em português literal no PHP: sempre `__('English phrase')`,
  com a tradução correspondente em `lang/pt_BR.json`.
- Campos traduzíveis (pt/en) usam `App\Filament\Support\Translatable::tabs` para gerar as abas
  PT/EN do formulário — não duplicar essa lógica em cada Resource.
- A API pública só expõe conteúdo publicado (nunca rascunho/despublicado).
- Formato de request/resposta de cada endpoint segue `docs/api.md`. Mudou o contrato? Atualize o
  doc no mesmo commit.
