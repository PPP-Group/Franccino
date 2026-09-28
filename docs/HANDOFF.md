# Franccino — documento de continuidade (handoff)

Atualizado em 2026-09-28. Ponto de partida para quem assume o projeto: o que já foi feito, o que está em
andamento, o que falta, os impedimentos e como colocar tudo para rodar.

Leia nesta ordem: este arquivo, [`CLAUDE.md`](../CLAUDE.md) (regras de código), a
[spec da fundação](specs/2026-09-23-fundacao-design.md) e o plano da fase em que você vai trabalhar
([`docs/plans/`](plans/)).

---

## 1. Resumo

| Item            | Situação                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Repositório     | `https://github.com/PPP-Group/Franccino` (integração: `develop`)                                   |
| Stack           | `api/` Laravel 13 + Filament 5 (PHP 8.4) · `web/` Next.js 16 + React 19 + next-intl 4 + Tailwind 4 |
| P1 Fundação     | **Concluída**                                                                                      |
| P2 API + painel | **T1–T14 concluídas e revisadas**; T15 bloqueada (aprovação de `laravel/boost` e Scramble)         |
| P3 Web base     | **Concluída** (6/6 tarefas + revisão final)                                                        |
| P4 Páginas web  | **Concluída** (T1–T12 revisadas + revisão final da branch)                                         |
| P5 Go-live      | Sem plano escrito (migração do WordPress, redirects, deploy, analytics, QA)                        |
| Testes          | API: 215 testes Pest verdes · Web: 231 testes Vitest verdes                                        |
| Rodando         | `develop` sobe com banco vazio; nas branches de feature o `db:seed` local traz a demonstração      |

---

## 2. Como colocar para rodar

### 2.1 Requisitos

- Node.js 24 e pnpm 11 (`corepack enable`)
- PHP 8.4 com `intl, gd, exif, fileinfo, mbstring, openssl, pdo_mysql, pdo_sqlite, sqlite3, zip, curl, sodium` e
  Composer 2 **no PATH** (Laravel Herd no Windows/macOS já traz tudo)
- Docker Desktop opcional (sem ele o back-end usa SQLite)
- Windows: clone **fora do OneDrive** (ex.: `C:\dev\franccino`)

### 2.2 Primeira vez

```bash
git clone https://github.com/PPP-Group/Franccino.git franccino
cd franccino
git checkout develop
pnpm install      # dependências da raiz e do web/, hooks de git
pnpm bootstrap    # api/.env e web/.env.local, composer install, chave, migrations, seed, storage:link
pnpm dev          # API http://localhost:8000 · fila · site http://localhost:3000
```

- Painel: http://localhost:8000/admin. O bootstrap gera e mostra a senha do admin; e-mail e senha ficam em
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` no `api/.env`. Mudou? `cd api && php artisan db:seed --class=AdminUserSeeder`.
- Site: http://localhost:3000/pt (ou `/en`). Com banco vazio as páginas mostram estados vazios. Com a P2 T14
  (`feature/fundacao-api`), o `db:seed` em `APP_ENV=local` traz o conteúdo de demonstração com dados públicos do
  site atual; as imagens são baixadas de franccino.com.br na primeira vez e ficam em `api/storage/app/demo-cache`.
- `pnpm bootstrap --sqlite` força SQLite. Com Docker, e-mails de teste no Mailpit: http://localhost:8025.
- `pnpm setup` é um comando nativo do pnpm, não o bootstrap.

### 2.3 Comandos do dia a dia

```bash
pnpm test                          # testes da API e do site
pnpm lint                          # ESLint do site e Pint da API
cd api && php artisan test         # só API
cd api && composer analyse         # Larastan
pnpm --filter web test             # só site
pnpm --filter web typecheck
API_URL=http://127.0.0.1:9 ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build   # build sem API no ar
```

### 2.4 Protótipo visual aprovado

```bash
cd design/prototype
python -m http.server 4173         # http://localhost:4173
```

As fotos do protótipo (`design/prototype/img/`) não são versionadas; sem elas o layout aparece com imagens
quebradas.

### 2.5 Problemas comuns

| Sintoma                               | Solução                                                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `php` não reconhecido                 | PHP fora do PATH: adicione a pasta ao PATH do usuário e reabra o terminal                                                                                                             |
| `Could not open input file: artisan`  | Rode dentro de `api/` ou use `php api/artisan ...` a partir da raiz                                                                                                                   |
| Site com erro 500                     | API fora do ar ou `FRONTEND_API_KEY` diferente entre `api/.env` e `web/.env.local`                                                                                                    |
| Porta 8000/3000 ocupada após `Ctrl+C` | Processo `php`/`node` órfão: finalize no Gerenciador de Tarefas e rode `pnpm dev`                                                                                                     |
| Commit recusado                       | Mensagem fora de Conventional Commits (ex.: `feat(web): ...`)                                                                                                                         |
| `pnpm dev` cai sozinho no Windows     | `queue:listen` estoura 60 s (`ProcessTimedOutException`) e o `concurrently -k` derruba tudo; suba a fila com `php api/artisan queue:listen --tries=1 --timeout=0` (ledger da P4, T11) |

---

## 3. Branches

| Branch                     | Conteúdo                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `main`                     | Igual à `develop` em 2026-09-28 (tudo integrado). Daqui em diante, só por PR aprovado |
| `develop`                  | Integração: todas as fases até P2 T12 e P4 T8 + esta documentação. **Comece daqui**   |
| `feature/fundacao-projeto` | P1, specs, planos, protótipo, `web/DESIGN.md`, documentação                           |
| `feature/fundacao-api`     | P2 até a T14 (`77412ed`). PR para `develop` pendente                                  |
| `feature/fundacao-web`     | P3 + P4 completas, com a revisão final. PR para `develop` pendente                    |

Em 2026-09-28, a pedido do responsável pelo projeto, tudo foi mergeado em `develop` e `main` de uma vez (push
direto, sem PR), **incluindo** a P2 T12 ainda não revisada e a P4 T8 com ajustes pendentes (seção 5). Na integração,
200 testes da API e 203 do site passaram e o typecheck ficou verde. O histórico inicial do repositório antigo
(`PPP-Group/Francciono-Website`) foi mantido de propósito.

Depois disso (ainda em 2026-09-28) o trabalho continuou só nas branches de feature, que entram em `develop` por PR:
as duas estão à frente de `develop`, sem nenhum commit atrás, e mergeiam sem conflito (sozinhas e juntas).

---

## 4. O que já foi feito

### 4.1 P1 — Fundação

Plano: [`plans/2026-09-23-p1-fundacao.md`](plans/2026-09-23-p1-fundacao.md)

- Monorepo pnpm; husky + lint-staged + commitlint; `.editorconfig`, `.gitattributes`, Prettier
- `compose.yaml` (MySQL 8.4 + Mailpit); SQLite como alternativa
- Templates de PR/issue, CODEOWNERS, CI
- ADRs 0001–0005 ([`decisions/`](decisions/)), `CLAUDE.md` (raiz, `api/`, `web/`), README
- `pnpm bootstrap` e `pnpm dev`
- Referência: [spec](specs/2026-09-23-fundacao-design.md), [modelo de dados](data-model.md),
  [contrato da API](api.md), [inventário do WordPress](content-inventory.md), [runbook](runbook-deploy.md)
- Protótipo aprovado (`design/prototype/`) e sistema visual ([`web/DESIGN.md`](../web/DESIGN.md))

### 4.2 P2 — API Laravel e painel Filament (T1–T14)

Plano: [`plans/2026-09-23-p2-api.md`](plans/2026-09-23-p2-api.md) · Ledger:
[`handoff/p2-api-ledger.md`](handoff/p2-api-ledger.md)

| Tarefa | Entrega                                                                                             |
| ------ | --------------------------------------------------------------------------------------------------- |
| T1     | Esqueleto Laravel 13, Pint, Larastan, Pest, CI                                                      |
| T2     | Idiomas pt/en com fallback, texto rico sanitizado, utilitários                                      |
| T3     | Painel Filament 5, usuários, perfis (admin/editor), 2FA, políticas                                  |
| T4     | Mídia: discos (local/R2), conversões, metadados, `ImagePresenter`                                   |
| T5     | Schema do catálogo (áreas, categorias, linhas, designers, produtos, acabamentos, arquivos técnicos) |
| T6     | Schema editorial, contato, newsletter, configurações gerais                                         |
| T7     | Painel — catálogo (abas pt/en, mídia, GLB)                                                          |
| T8     | Painel — conteúdo editorial (construtor de blocos)                                                  |
| T9     | Painel — mensagens (com itens), newsletter, logs, redirects, configurações                          |
| T10    | API pública — infraestrutura (idioma, `no-store`, rate limit, chave do front) e catálogo            |
| T11    | API pública — conteúdo editorial, `/settings`, sitemap, redirects                                   |
| T12    | API de escrita: contato (com `items`), newsletter, link temporário de download, Turnstile, e-mail   |
| T13    | Revalidação do site: observers juntam as tags e um job faz `POST /api/revalidate`                   |
| T14    | Conteúdo de demonstração com dados públicos do site atual (só em `APP_ENV=local`)                   |

### 4.3 P3 — Base do site Next.js (concluída)

Plano: [`plans/2026-09-23-p3-web-base.md`](plans/2026-09-23-p3-web-base.md) · Ledger:
[`handoff/p3-web-base-ledger.md`](handoff/p3-web-base-ledger.md)

- App Router com rotas localizadas (`/pt/produtos` = `/en/products`), proteção de staging por senha
- Cliente tipado da API, revalidação por tag (`/api/revalidate`), imagens, medidas, texto rico
- SEO técnico (metadata, hreflang, sitemap, JSON-LD) e cabeçalhos de segurança
- Esqueleto de todas as rotas, formulários com Turnstile, 3D sob demanda

### 4.4 P4 — Páginas do site (concluída)

Plano: [`plans/2026-09-24-p4-web-paginas.md`](plans/2026-09-24-p4-web-paginas.md) · Ledger:
[`handoff/p4-web-paginas-ledger.md`](handoff/p4-web-paginas-ledger.md) · Pré-execução:
[`handoff/p4-preflight.md`](handoff/p4-preflight.md)

| Tarefa | Entrega                                                                          |
| ------ | -------------------------------------------------------------------------------- |
| T1     | Tokens de design, fonte provisória, estilos base, componentes de UI              |
| T2     | Lista de orçamento no navegador (lógica pura, `localStorage`)                    |
| T3     | Formulários no design system (contato com `items`, newsletter)                   |
| T4     | Cabeçalho, rodapé, layout, "pular para o conteúdo", rotas novas                  |
| T5     | Card de produto, adicionar à lista, trilho de produtos                           |
| T6     | Catálogo com filtros, tabela técnica, paginação, lançamentos, downloads          |
| T7     | Seletor de acabamentos, quantidade, ações de orçamento                           |
| T8     | Página de produto: galeria, 3D com "tentar de novo", medidas, downloads          |
| T9     | Sala para montar: geometria, planta salva no navegador, desenho em escala        |
| T10    | Sala para montar: página interativa (mouse, toque, teclado) e envio para a lista |
| T11    | Home com seções alimentadas pela API (cada uma some sem dado)                    |
| T12    | Página da lista de orçamento e verificação final                                 |
| Final  | Revisão da branch: páginas voltaram a ser estáticas (R24), menu no tablet        |

---

## 5. Em andamento

Nada em andamento. Aguardando o tech lead:

- PRs de `feature/fundacao-api` e `feature/fundacao-web` para `develop`.
- As aprovações da seção 7 (a P2 T15 depende de `laravel/boost` e Scramble).
- Decisões registradas nos ledgers como "finding": CORS da mídia para o 3D no ambiente local (o runbook já cobre
  produção), `pnpm bootstrap` sem gerar `FRONTEND_REVALIDATE_SECRET`/`REVALIDATE_SECRET`, o `queue:listen` do
  `pnpm dev` no Windows (seção 2.5).
- Números oficiais do Lighthouse para o PR da P4 (a verificação final mediu só uma aproximação; ledger da P4, T12).

---

## 6. O que falta

### 6.1 P2 — API

| Tarefa | O que é                                                                              |
| ------ | ------------------------------------------------------------------------------------ |
| T15    | Laravel Boost (MCP), OpenAPI (Scramble), revisão de `docs/api.md`, verificação final |
| Final  | Revisão da branch inteira da P2 e uma rodada de correção                             |

### 6.2 P4 — Web

Concluída. O que o plano deixou para a P5 está em "Próximo plano (P5)", no fim do
[plano da P4](plans/2026-09-24-p4-web-paginas.md).

### 6.3 P5 — Go-live (escrever o plano)

Base: checklist do [runbook](runbook-deploy.md).

- Migração do WordPress (precisa do dump do banco — campos JetEngine não saem pela API REST)
- Redirects 301 das ~1.094 URLs antigas (inclui `?taxonomy=linhas&term=`)
- PDFs legais (transparência salarial) acessíveis e redirecionados
- Hospedagem, staging com senha e `noindex`, deploy, backups, monitoramento
- Analytics / Tag Manager / Search Console, cookies e política de privacidade
- QA em iOS/Android reais (3D), treinamento do CMS, aceite formal

### 6.4 Pendências menores

Cada ledger em [`handoff/`](handoff/) lista os itens "minor (deferred)" por tarefa. Principais:

- Web sem ambiente DOM nos testes: teclado, foco e menus foram conferidos no navegador na P4 T12, mas não têm
  teste automatizado.
- `local-store`: `dispatchEvent` sem guarda fora do navegador; fallback permanente em memória após falha.
- Lista de orçamento: CLS ≈ 0,3 quando o "Carregando…" (exigido pelo plano) dá lugar à lista ou ao estado vazio.
- 404 global sempre em português (R24 da P4).
- Painel: limite de upload 50MB fixo no `FilesRelationManager`; faltam testes de publicação em massa.
- Textos provisórios em `web/messages/{pt,en}.json` precisam de revisão de copy.

---

## 7. Impedimentos

| Impedimento                                                                                                                       | Dono                 | Impacto                                                      |
| --------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------ |
| Modelos 3D em GLB                                                                                                                 | Cliente              | 3D desligado por produto até existir arquivo (hoje há 1 SKP) |
| Traduções em inglês                                                                                                               | Cliente              | `/en` usa fallback para pt                                   |
| Dump do banco do WordPress                                                                                                        | Cliente / hospedagem | Migração completa (P5)                                       |
| Contas: Cloudflare (DNS, R2, Turnstile), hospedagem, e-mail, Sentry, GA/GTM/Search Console                                        | Cliente / tech lead  | Staging e produção                                           |
| Aprovação de dependências novas (ex.: `filament/spatie-laravel-media-library-plugin`, `spatie/laravel-settings`, `laravel/boost`) | Tech lead            | Citar no PR                                                  |
| Aprovação de `laravel/boost` e Scramble (`dedoc/scramble`)                                                                        | Tech lead            | Bloqueia a P2 T15                                            |
| Aprovação de escopo: lista de orçamento e sala para montar                                                                        | Tech lead / cliente  | Adicionadas a pedido do product owner; passar por orçamento  |
| Fonte definitiva                                                                                                                  | Design / cliente     | Archivo (Google Fonts) é provisória                          |
| Proteção de branch no GitHub                                                                                                      | Tech lead            | Org no plano Free: regras não são aplicadas em repo privado  |

---

## 8. Como continuar

### 8.1 Fluxo

1. `git checkout develop && git pull`
2. Próximos passos: PRs das duas branches de feature; depois a P2 T15 (quando as dependências forem aprovadas), a
   revisão final da P2 e o plano da P5.
3. Siga a tarefa do plano: cada uma tem arquivos, interfaces, testes e mensagem de commit.
4. Antes do commit: `pnpm test`, `pnpm lint`, `cd api && composer analyse`, `pnpm --filter web typecheck`.
5. PR para `develop` com aprovação do tech lead.

Trabalho fora dos planos: branch `feature/nome-curto` ou `fix/nome-curto` a partir de `develop`.

### 8.2 Decisões de execução (valem sobre o texto do plano)

Cada tarefa passou por implementação com testes → revisão de especificação e qualidade → correção → registro no
ledger. As decisões ("Rulings") estão nos ledgers; as que mais afetam quem continua:

- **P2 R1:** áreas únicas por `key`; nos testes use `area('indoor')`, não `Area::factory()->state()`.
- **P2 R2:** resources sem criação retornam 404 em `/create`.
- **P2 R4:** newsletter responde `{"data":{"subscribed":true}}` (201 e 200).
- **P2 R6:** contato aceita `items` `[{product_id, quantity, finish_ids, note}]`.
- **P2 R8:** blocos de página = tabela `pages.content` do `data-model.md`; só `rich_text.body` e `image_text.body`
  são HTML.
- **P2 R10:** `GET /settings` sem `contact_recipients`; `footer_documents` como `[{label, url}]`.
- **P4 R3:** sem `withBuildFallback`; use o fallback do `apiGet` e `lib/api/empty.ts`.
- **P4 R12:** não inventar texto de marketing (preço, prazo, garantia, "sob medida").
- **P4 R17:** controles principais com área de toque ≥ 44px; bordas de controle com contraste ≥ 3:1.
- **P4 R19:** `Banner` com `title/subtitle/cta` anuláveis (Home, T11).
- **P4 R7:** mensagens: mesclar no namespace existente, nunca substituir; apagar só chave sem referência.
- **P4 R24:** fora de `[locale]`, chamar next-intl sempre com `locale` explícito. O `getLocale()` no not-found da
  raiz lia `headers()` e deixava o site inteiro dinâmico; hoje as páginas são estáticas com revalidação por tag.

### 8.3 Onde está cada coisa

| Caminho                           | O que é                                      |
| --------------------------------- | -------------------------------------------- |
| `api/app/Filament`                | Painel                                       |
| `api/app/Http/Controllers/Api/V1` | Endpoints públicos                           |
| `api/app/Actions`, `app/Queries`  | Regras de negócio                            |
| `api/tests`                       | Pest                                         |
| `web/src/app/[locale]`            | Rotas do site                                |
| `web/src/lib/api`                 | Cliente da API (único acesso a dados)        |
| `web/src/components`              | Componentes por domínio                      |
| `web/src/styles`                  | Tokens e CSS por área                        |
| `web/messages/{pt,en}.json`       | Strings de interface                         |
| `design/prototype`                | Protótipo HTML aprovado                      |
| `docs/handoff`                    | Ledgers com decisões e pendências por tarefa |

### 8.4 Acompanhamento

- Linear: "PPP Group Workspace", projeto **P-PPP-1** (atualizado até 2026-09-26; PPP-102 Sala para montar,
  PPP-103 Lista de orçamento). O cliente tem acesso ao workspace.
- O roadmap interno (PDF) não vai para o repositório nem para o cliente na forma integral.

---

## 9. Regras inegociáveis

- Nunca commitar `.env`, chaves, tokens ou dump de banco.
- Schema só por migration nova, atualizando `docs/data-model.md`.
- Mudou a API? Atualize `docs/api.md` no mesmo PR.
- Nenhuma string de interface fora de `web/messages` ou `lang/pt_BR.json`.
- GLB e imagens pesadas vão para o R2, nunca para o Git.
- Dependência nova só com aprovação do tech lead.
- Não inventar dados de produto (preço, especificação, garantia).
