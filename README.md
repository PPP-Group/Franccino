# Franccino — site institucional

Monorepo do novo site institucional bilíngue (pt/en) da Franccino: catálogo de móveis gerenciável por CMS, com
visualizador 3D por produto e área de downloads técnicos.

| Pasta                     | O que é                                                                          |
| ------------------------- | -------------------------------------------------------------------------------- |
| `api/`                    | Laravel 13 + Filament 5: API REST (`/api/v1`) e painel administrativo (`/admin`) |
| `web/`                    | Next.js 16 + next-intl: site público                                             |
| `docs/`                   | spec, modelo de dados, contrato da API, ADRs, runbook, inventário do site atual  |
| `docker/`, `compose.yaml` | MySQL 8.4 e Mailpit para desenvolvimento                                         |

## Requisitos

- Node.js 24 LTS e pnpm 11
- PHP 8.4 com as extensões `intl`, `gd`, `exif`, `fileinfo`, `mbstring`, `openssl`, `pdo_mysql`, `pdo_sqlite`,
  `sqlite3`, `zip`, `curl`, `sodium` (Laravel Herd no Windows/macOS já traz tudo) e Composer 2
- Docker Desktop (opcional: sem ele, o back-end usa SQLite)
- Git com Conventional Commits (validado no commit)

**Windows:** clone o repositório fora do OneDrive (ex.: `C:\dev\franccino`). A sincronização trava `node_modules`
e `vendor`.

## Primeiro uso

```bash
pnpm install        # dependências da raiz e do web/, instala os hooks de git
pnpm setup          # cria os .env, instala o api/, gera a chave, roda migrations e seed
pnpm dev            # API em :8000, fila e site em :3000
```

Painel: http://localhost:8000/admin (usuário definido em `ADMIN_EMAIL` / `ADMIN_PASSWORD` no `api/.env`).
Com Docker: `docker compose up -d` antes do `pnpm setup` (e-mails de teste em http://localhost:8025).

## Comandos úteis

| Comando                                    | O que faz                   |
| ------------------------------------------ | --------------------------- |
| `pnpm test`                                | testes da API e do site     |
| `pnpm lint`                                | lint do site e Pint da API  |
| `cd api && php artisan test --filter=Nome` | um teste específico da API  |
| `cd api && composer analyse`               | análise estática (Larastan) |
| `pnpm --filter web typecheck`              | checagem de tipos do site   |
| `pnpm --filter web build`                  | build de produção do site   |

## Fluxo de trabalho

1. Crie a branch a partir de `develop`: `feature/nome-curto` ou `fix/nome-curto`.
2. Commits em Conventional Commits (`feat(web): ...`, `fix(api): ...`); o pre-commit formata os arquivos.
3. Abra PR para `develop` preenchendo o template. Tech lead aprova e faz o merge.
4. `develop` publica em staging; `main` publica em produção.

## Documentação

- [Spec da fundação](docs/specs/2026-09-23-fundacao-design.md)
- [Modelo de dados](docs/data-model.md)
- [Contrato da API](docs/api.md)
- [Inventário do site atual](docs/content-inventory.md)
- [Decisões técnicas (ADRs)](docs/decisions/)
- [Runbook de deploy](docs/runbook-deploy.md)
- Regras para o Claude Code e para o time: [CLAUDE.md](CLAUDE.md)
