# API

Backend Laravel 13 + Filament do site da Franccino: API REST versionada (`/api/v1`, tasks
seguintes) e painel administrativo (`/admin`). Ver `CLAUDE.md` (convenções deste app) e, na raiz do
monorepo, `CLAUDE.md` e `docs/` (spec, modelo de dados, contrato da API).

## Instalação local

Sem Docker, usando SQLite:

```bash
composer install
cp .env.example .env
# no .env: DB_CONNECTION=sqlite e apague as linhas DB_HOST/DB_PORT/DB_DATABASE/DB_USERNAME/DB_PASSWORD
touch database/database.sqlite
php artisan key:generate
php artisan migrate
php artisan serve
```

Com Docker (MySQL via `compose.yaml` da raiz), mantenha o `.env` com `DB_CONNECTION=mysql` e as
demais variáveis `DB_*` do `.env.example`.

## Comandos

```bash
composer lint                           # Pint em modo verificacao (--test)
composer analyse                         # PHPStan via Larastan, nivel 5
composer test                             # suite Pest completa (= php artisan test)
php artisan test --filter=NomeDoTeste    # roda só um teste ou arquivo
```
