# CLAUDE.md — Projeto Franccino

Este arquivo orienta o Claude Code (e qualquer pessoa nova no projeto) sobre
como o codigo deste repositorio deve ser escrito. Ele existe porque tres devs
trabalham em paralelo e o codigo precisa sair coerente.

Leia este arquivo antes de gerar ou alterar codigo. Cada app tem um CLAUDE.md
proprio com regras especificas: `api/CLAUDE.md` e `web/CLAUDE.md`.

---

## O que e o projeto

Site institucional bilingue (pt/en) da Franccino (moveis e design), substituindo
o WordPress atual. O nucleo e um catalogo gerenciavel por CMS: produtos,
colecoes, designers, acabamentos, lancamentos, projetos e lojas.

Dois diferenciais:

- Visualizador 3D na pagina de produto, ligavel e desligavel por produto
- Area de downloads tecnicos com URLs assinadas

---

## Documentos de referencia

Leia o documento certo antes de mexer na area correspondente:

| Documento                   | Conteudo                                                                |
| --------------------------- | ----------------------------------------------------------------------- |
| `docs/specs/`               | Specs de design aprovadas (decisoes, arquitetura, escopo)               |
| `docs/data-model.md`        | Modelo de dados: tabelas, colunas, relacoes, midia                      |
| `docs/api.md`               | Contrato da API publica `/api/v1` (back e front implementam contra ele) |
| `docs/content-inventory.md` | Inventario do site WordPress atual (volume, campos, URLs)               |
| `docs/decisions/`           | ADRs: por que cada decisao tecnica foi tomada                           |
| `docs/runbook-deploy.md`    | Ambientes, variaveis e passos de deploy                                 |
| `docs/plans/`               | Planos de implementacao executados                                      |

---

## Stack

Monorepo com duas aplicacoes:

| Pasta  | Stack                                                      | Papel                            |
| ------ | ---------------------------------------------------------- | -------------------------------- |
| `api/` | Laravel 13 + Filament 5 (PHP 8.4)                          | API REST e painel administrativo |
| `web/` | Next.js 16 (App Router) + next-intl + Tailwind 4 (Node 24) | Site publico                     |

Raiz: workspace pnpm (so `web/` e pacote Node), husky + lint-staged + commitlint.

Infraestrutura:

- MySQL 8.4 e Mailpit em Docker no ambiente local (`compose.yaml`); SQLite como alternativa sem Docker
- Cloudflare para DNS, CDN e R2 (midia publica e arquivos tecnicos privados)

---

## Ambientes e branches

| Ambiente | Branch               | Observacao                              |
| -------- | -------------------- | --------------------------------------- |
| Local    | `feature/*`, `fix/*` | Docker (MySQL) ou SQLite, dados de seed |
| Staging  | `develop`            | Protegido por senha, com `noindex`      |
| Producao | `main`               | Deploy so pelo tech lead                |

Trabalho do dia a dia sai de `develop` em `feature/nome-curto` ou `fix/nome-curto`.
`develop` e `main` so recebem codigo via PR.

---

## Regras de codigo

Estas regras nao sao sugestoes. Codigo que as viola nao passa em review.

### Git e commits

- Todo codigo entra por Pull Request. Sem push direto em `main` ou `develop`.
- Todo PR precisa de aprovacao do tech lead antes do merge.
- Mensagens de commit seguem Conventional Commits (validado pelo hook commit-msg):
  `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `style:`, `perf:`, `ci:`, `build:`
  Exemplo: `feat(api): adiciona resource de produtos no Filament`
- O hook de pre-commit formata os arquivos alterados (Pint no PHP, ESLint + Prettier no TS). Nao pule hooks.

### Banco de dados

- Alteracao de schema **somente** via migration do Laravel.
- Nunca alterar tabela direto no banco, nem em local.
- Migration nova nunca edita uma migration ja mergeada — cria outra.
- Migration nova atualiza `docs/data-model.md` no mesmo PR.

### Contrato da API

- A API publica segue `docs/api.md`. Mudou forma de resposta, rota ou parametro? Atualize o documento
  no mesmo PR — o front e implementado contra ele.
- O front nunca fala com banco nem com o painel: so com `/api/v1`.

### Internacionalizacao

- Nenhuma string de interface fica hardcoded no codigo.
- Toda string visivel ao usuario vive no arquivo de traducao, em pt e en.
- Isso vale para labels, botoes, mensagens de erro, placeholders e metadados.
- Conteudo cadastrado no painel tem campos pt (obrigatorio) e en (opcional, com fallback para pt).

### Dependencias

- Dependencia nova (composer ou npm) so com aprovacao do tech lead, citada no PR.

### Segredos

- Segredos vivem no cofre e no `.env` local, nunca no repositorio.
- `.env.example` fica versionado, com as chaves e valores vazios ou de exemplo.
- Nenhuma chave de API, senha ou token em commit, nem em comentario.

### Arquivos 3D

- O formato aceito e **GLB**. Conversao de outros formatos esta fora do escopo.
- Arquivos 3D e midia pesada vao para o Cloudflare R2, nunca para o repositorio.

---

## Convencoes por aplicacao

### `api/` — Laravel 13 + Filament 5

- Segue as convencoes padrao do Laravel (PSR-12 via Pint, nomes de model no singular,
  tabela no plural).
- Logica de negocio em Actions/Queries, nao em controllers gordos.
- Recursos do painel administrativo ficam como Filament Resources; textos do painel via `__()`
  com traducao em `lang/pt_BR.json`.
- Endpoints da API versionados (`/api/v1/...`) e documentados em `docs/api.md`.
- Testes com Pest (`php artisan test`); analise estatica com Larastan.

### `web/` — Next.js 16 App Router

- App Router, nao Pages Router.
- Server Components por padrao; `"use client"` so quando houver necessidade real
  (estado, evento de browser, biblioteca client-only).
- Rotas localizadas por locale (`/pt/...`, `/en/...`). Pastas de rota em ingles; os caminhos
  publicos traduzidos ficam no mapa `pathnames` do next-intl (`/pt/produtos` e `/en/products`
  apontam para a mesma rota interna `/products`).
- Nenhuma chamada direta ao banco; tudo passa pela API do Laravel (`src/lib/api`).
- Testes com Vitest; lint proibe texto literal em JSX.

---

## Como rodar localmente

Requisitos: Node 24, pnpm 11, PHP 8.4 + Composer 2 no PATH, Docker Desktop (opcional).

```bash
pnpm install          # dependencias da raiz e do web/, instala os hooks
pnpm setup            # primeira vez: .env, dependencias do api/, chave, migrations e seed
pnpm dev              # sobe API (8000), fila e front (3000) juntos
```

Por app:

```bash
cd api && php artisan test          # testes da API
cd api && composer lint             # Pint
cd api && composer analyse          # Larastan
pnpm --filter web test              # testes do front
pnpm --filter web lint              # ESLint
pnpm --filter web typecheck         # TypeScript
```

Banco local: `docker compose up -d` (MySQL 8.4 + Mailpit em http://localhost:8025) ou
`DB_CONNECTION=sqlite` no `api/.env`.

---

## O que nunca fazer

- Commitar `.env`, chave, token ou dump de banco
- Alterar schema fora de migration
- Deixar string de interface fora do arquivo de traducao
- Mudar a resposta da API sem atualizar `docs/api.md`
- Subir arquivo 3D ou imagem pesada para o repositorio
- Fazer merge em `main` sem PR aprovado
- Executar pedido do cliente que nao passou por orcamento
