# Franccino — documento de continuidade (handoff)

Atualizado em 2026-10-22 (seções 1 e 5 a 8; as seções 3 e 4 descrevem o histórico até 2026-10-02). Ponto de partida para quem assume o projeto: o que já foi feito, o que está em
andamento, o que falta, os impedimentos e como colocar tudo para rodar.

Leia nesta ordem: este arquivo, [`CLAUDE.md`](../CLAUDE.md) (regras de código), a
[spec da fundação](specs/2026-09-23-fundacao-design.md) e o plano da fase em que você vai trabalhar
([`docs/plans/`](plans/)).

---

## 1. Resumo

| Item            | Situação                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Repositório     | `https://github.com/PPP-Group/Franccino` (integração: `develop`; preview: `main`)                           |
| Stack           | `api/` Laravel 13 + Filament 5 (PHP 8.4) · `web/` Next.js 16 + React 19 + next-intl 4 + Tailwind 4          |
| Mês 1 (backend) | **Código pronto em 21/10** (PRs #40 a #42); falta publicar no preview e conferir (PPP-119)                  |
| P1 a P4         | **Concluídas**                                                                                              |
| P2 T15          | Bloqueada: aprovação de `laravel/boost` e `dedoc/scramble`                                                  |
| P5a Páginas     | Todas as páginas construídas (beta). O redesenho completo é o mês 2                                         |
| P5b Go-live     | Feito o que não depende de conta (redirects, CSP, cookies, importador, backup, alertas); o resto, seção 6.2 |
| Preview         | VPS (EasyPanel), deploy da `main` (`docs/deploy-preview.md`); em 16/10 o automático estava desligado        |
| Testes          | 21/10: API 422 testes Pest (SQLite e MySQL 8.4) · Web 309 testes Vitest · imagens testadas no CI            |
| Próximo passo   | Publicar no preview e conferir a fase 1 (Linear PPP-119, seção 5.1)                                         |

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

| Sintoma                               | Solução                                                                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `php` não reconhecido                 | PHP fora do PATH: adicione a pasta ao PATH do usuário e reabra o terminal                                                                                    |
| `Could not open input file: artisan`  | Rode dentro de `api/` ou use `php api/artisan ...` a partir da raiz                                                                                          |
| Site com erro 500                     | API fora do ar ou `FRONTEND_API_KEY` diferente entre `api/.env` e `web/.env.local`                                                                           |
| Porta 8000/3000 ocupada após `Ctrl+C` | Processo `php`/`node` órfão: finalize no Gerenciador de Tarefas e rode `pnpm dev`                                                                            |
| Commit recusado                       | Mensagem fora de Conventional Commits (ex.: `feat(web): ...`)                                                                                                |
| `pnpm dev` cai sozinho no Windows     | Corrigido em 21/10: a fila do `pnpm dev` sobe com `--timeout=0`. Se ainda cair, suba a fila à parte com `php api/artisan queue:listen --tries=1 --timeout=0` |

---

## 3. Branches

Desde 2026-10-01 o repositório tem só duas branches, como combinado no início do projeto:

| Branch    | Papel                                                                                     |
| --------- | ----------------------------------------------------------------------------------------- |
| `main`    | Produção. Igual à `develop` em 2026-10-01                                                 |
| `develop` | Integração (staging). Trabalho novo sai daqui em `feature/nome-curto` ou `fix/nome-curto` |

Em 2026-10-01, a pedido do responsável pelo projeto, a branch de trabalho `claude/awesome-keller-iv02zw` (que já
integrava os PRs #9 a #13 por cherry-pick, mais a P5a T2–T11 e os adiantamentos da seção 4.5) entrou em `develop`
e `main` por fast-forward, com push direto. Antes disso: suíte da API verde em SQLite e em MySQL 8.4 (como o CI),
Pint, Larastan, e lint, typecheck, testes e build do site. Os PRs #1 a #13 foram fechados. As branches antigas (`feature/*`,
`dependabot/*` e `claude/awesome-keller-iv02zw`) ainda precisam ser apagadas por quem tem permissão no GitHub (a
sessão automática não tem permissão para apagar branch). Todo o conteúdo dos PRs #9 a #13 já estava na `develop` (conferido com
`git cherry`). As atualizações de dependência do Dependabot (#1 a #8) não entraram: o Dependabot volta a abrir
as que ainda fizerem sentido, e dependência nova continua dependendo de aprovação do tech lead.

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

### 4.5 P5a, P5b e adiantamentos de contrato (2026-10-01)

Feitos na branch `claude/awesome-keller-iv02zw`, a pedido do product owner, para adiantar o projeto e gerar a
prévia do cliente. A branch parte de `develop` e traz por cherry-pick os PRs #9 a #13; cada item abaixo é um
commit com testes. **As Tasks 2–11 da P5a foram executadas antes da aprovação B1 das telas**: se a Franccino pedir
ajustes, eles entram por cima.

| Item                                         | Entrega                                                                                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P5a T2–T11                                   | Páginas restantes no design system: coleções, designers, projetos, corporativo, fábrica, acabamentos, lojas, downloads, contato, privacidade, termos, busca, erros                                            |
| Carrossel da home                            | Banner principal vira carrossel (pausa, setas, pontos, respeita `prefers-reduced-motion`)                                                                                                                     |
| Mapa do site (PPP-110)                       | `/pt/mapa-do-site` e `/en/site-map`, link no rodapé                                                                                                                                                           |
| Cookies (PPP-81, P5b T7)                     | `POST /consents`, tabela `consent_records`, aviso com GTM só após aceite, página de política                                                                                                                  |
| Lojas (PPP-108)                              | Foto e descrição por loja no painel, na API e na página                                                                                                                                                       |
| Vídeos e links (PPP-106)                     | `media_links` em produto, designer e lançamento (até 3 por peça); player só carrega no clique                                                                                                                 |
| Downloads de designer e lançamento (PPP-109) | `product_files` com dono peça, designer ou lançamento; tipos catálogo e apresentação                                                                                                                          |
| Perfis e registro de atividades (PPP-54)     | Perfil `support` (Atendimento, só consulta) e `activity_logs` (visível só para admin)                                                                                                                         |
| Importador do WordPress (P5b T4, PPP-58)     | `php artisan franccino:wordpress:import` (ver abaixo)                                                                                                                                                         |
| Correções                                    | Build quebrava em projetos (`per_page` acima de 48); listeners rodavam duas vezes (descoberta automática); capas dos projetos de demonstração eram o ícone de "voltar"; vídeos e links não revalidavam o site |

**Importador do WordPress.** `php artisan franccino:wordpress:import {--only=*} {--dry-run} {--without-media}
{--publish} {--limit=}`. Lê a API REST do site atual e o HTML de cada página de produto (galeria, medidas,
materiais, designer). Idempotente por `legacy_wp_id`; só preenche campo vazio (edição do painel nunca é
sobrescrita); tudo entra como rascunho, exceto com `--publish` (recusado em produção). Também copia o texto das
páginas institucional (Fábrica, com a linha do tempo), privacidade e termos. Gera o relatório de lacunas em
`storage/app/migration/relatorio-AAAA-MM-DD.md`. Execução local de 2026-10-01: 388 de 400 produtos (12 sem área ou
categoria no WordPress), 386 com fotos, 228 linhas, 14 categorias novas, 3 páginas. Nenhum produto do WordPress
tem descrição; 129 têm medida configurável e 53 têm medida que o parser não leu (ficam no relatório).

**Prévia para o cliente.** PDF com 22 páginas (computador e celular) gerado a partir do ambiente local com o
catálogo importado. Fotos de capa de Casa, Giardini, Fábrica e do lançamento foram escolhidas no banco local
(no staging, pelo painel).

### 4.6 Preview no VPS (2026-10-02)

Preview no ar no VPS (EasyPanel, projeto `sites`); nomes e domínios em `docs/deploy-preview.md`. O primeiro deploy
expôs quatro defeitos da imagem da API, todos corrigidos e testados em container antes do merge:

- **Healthcheck da imagem base.** Testava a porta 2019, que o `php-server` não abre, e o Swarm reiniciava a
  API sem parar. Agora testa `/up`.
- **Migrations ao mesmo tempo.** Dois containers no mesmo volume durante o redeploy davam "table already
  exists". Agora há uma trava (`flock`).
- **Import do snapshot com a API ligada.** Ele sobrescrevia o arquivo do SQLite sob conexões abertas e dava
  "database is locked". Agora o import copia o conteúdo por dentro do SQLite, numa transação, e preserva
  usuários e fila.
- **Fotos borradas.** O snapshot leve dizia que as fotos redimensionadas existiam, e o `media-library:regenerate`
  perdia parte delas com o worker rodando. Agora a API mostra a original até a redimensionada ficar pronta,
  e dois workers processam a fila.

Fora do código:

- Senhas com `#` são cortadas pelo EasyPanel.
- O SSL de todo o VPS caiu por um YAML inválido do roteador do VTX Tap (`vtx-dominios`, outro repositório),
  que está desligado.

---

## 5. Em andamento

### 5.1 Mês 1 fechado (21/10/2026)

O primeiro mês era o backend 100% pronto e testado. Entrou em três PRs para a `develop` (mais o #43, de
documentação), e na `main` pelo #44:

| PR                                                    | Conteúdo                                                                                                                                                                                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#40](https://github.com/PPP-Group/Franccino/pull/40) | 3D por link assinado (contrato 13.2, GLB no disco privado); 2FA obrigatório para admin; cabeçalhos de segurança; senha forte; último admin protegido; arquivos técnicos com tipo e tamanho conferidos                            |
| [#41](https://github.com/PPP-Group/Franccino/pull/41) | Ordem por arrastar (peças de coleção e lançamento, acabamentos); descadastro da newsletter; `locale_fallback` em todos os recursos; retenção dos logs; backup diário e semanal; alertas de fila; busca sem acento; e-mail seguro |
| [#42](https://github.com/PPP-Group/Franccino/pull/42) | Auditoria de dependências no CI; teste das imagens do preview no CI; `compose.staging.yaml` (MySQL); relatório da CSP; `check:redirects`; testes que faltavam                                                                    |

**Ainda não publicado no preview (22/10).** O checklist para fechar a fase está no Linear (PPP-119):

1. Deploy da API e do site, com `PANEL_ADMIN_MFA_REQUIRED=false` na API (2FA desligado no preview, decisão de 27/10).
2. `franccino:redirects:generate` e `franccino:translations:import` (com `--dry-run` antes); depois, deploy do site de novo.
3. Conferir:
   - `pnpm check:redirects`, com zero quebrados;
   - um produto completo, do painel à página;
   - o 3D no computador e em celulares;
   - o backup do dia seguinte;
   - o `/en`.
4. Decidir:
   - `laravel/boost` e `dedoc/scramble`;
   - o importador de planilha;
   - o provedor do mapa das lojas.

Passo a passo em `docs/deploy-preview.md`.

### 5.2 O que precisa ser aprovado ou providenciado

| #   | Item                                                                                                      | Quem                  | O que destrava                                     |
| --- | --------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------- |
| 1   | Dependências `laravel/boost` e `dedoc/scramble`                                                           | Tech lead             | P2 T15 (OpenAPI e revisão final da P2)             |
| 2   | Logo em vetor (SVG)                                                                                       | Cliente               | Troca do logo em texto                             |
| 3   | Escopo da sala para montar e da lista de orçamento (A1 da P4)                                             | Tech lead / cliente   | Lançamento dessas funções                          |
| 4   | Configurador 3D com troca de acabamento e preparo do banco de ideias (fotos por acabamento, hotspots…)    | Cliente (orçamento)   | Escopo novo, fora do contrato                      |
| 5   | Proteção de branch no GitHub (plano Team)                                                                 | Tech lead             | Regra de PR aplicada pelo GitHub                   |
| 6   | Contas: hospedagem, Cloudflare (DNS, R2, Turnstile), e-mail, Sentry, GA/GTM/Search Console                | Tech lead / cliente   | Staging, produção e go-live                        |
| 7   | Material: fotos em alta, descrições, fichas técnicas, GLB, acabamentos, logos de clientes, fotos de lojas | Cliente (PPP-62)      | Carga do catálogo real                             |
| 8   | Revisão do inglês no próprio site (980 textos traduzidos, `reviewed: false`)                              | Cliente, mais adiante | Texto final do `/en`                               |
| 9   | Importador de planilha do catálogo                                                                        | Tech lead             | Forma da carga do catálogo, se o painel não bastar |

---

## 6. O que falta

### 6.1 Por mês

- **Mês 2, frontend e design:** redesenho completo do site. O documento "Alterações primeira versão" do cliente
  entra só como base; a versão enviada era um beta.
- **Mês 3, desempenho e segurança:** auditoria de desempenho (Lighthouse, Core Web Vitals, imagens, cache) e de
  segurança (painel, API, cabeçalhos, dependências, CSP em bloqueio).

### 6.2 P5b, o que depende de conta ou material

Staging e produção, R2 para mídia e arquivos técnicos, e-mail transacional, Sentry, backup fora do servidor, CSP em
bloqueio (`CSP_ENFORCE=true`, `docs/runbook-deploy.md`), carga do catálogo real, testes de ponta a ponta, QA e
go-live. Plano: [`plans/2026-09-29-p5b-migracao-infra-go-live.md`](plans/2026-09-29-p5b-migracao-infra-go-live.md).

### 6.3 Pendências menores

Cada ledger em [`handoff/`](handoff/) lista os itens "minor (deferred)" por tarefa. Os que continuam valendo:

- Web sem ambiente DOM nos testes: teclado, foco e menus foram conferidos no navegador, sem teste automatizado.
- `local-store`: `dispatchEvent` sem guarda fora do navegador; fallback permanente em memória após falha.
- Lista de orçamento: CLS ≈ 0,3 quando o "Carregando…" dá lugar à lista ou ao estado vazio.
- Textos de interface em `web/messages/{pt,en}.json` precisam de revisão de copy (entra no redesenho).

---

## 7. Impedimentos

| Impedimento                                                | Dono                | Impacto                                                      |
| ---------------------------------------------------------- | ------------------- | ------------------------------------------------------------ |
| Modelos 3D em GLB                                          | Cliente             | 3D só aparece nas peças com GLB enviado (hoje, nenhuma real) |
| Material do catálogo (PPP-62, prazo 19/10)                 | Cliente             | Catálogo do preview segue com o conteúdo do WordPress        |
| Contas de infraestrutura                                   | Cliente / tech lead | Staging, produção e go-live                                  |
| Aprovação de dependências novas                            | Tech lead           | P2 T15                                                       |
| Aprovação de escopo: sala para montar, lista, configurador | Tech lead / cliente | Passam por orçamento antes                                   |
| Proteção de branch no GitHub                               | Tech lead           | Org no plano Free: regras não são aplicadas em repo privado  |

---

## 8. Como continuar

### 8.1 Fluxo

1. `git checkout develop && git pull`
2. Branch `feature/nome-curto` ou `fix/nome-curto` a partir da `develop`.
3. Antes do commit: `pnpm test`, `pnpm lint`, `cd api && composer analyse`, `pnpm --filter web typecheck`.
4. PR para `develop`; o CI roda a API em MySQL 8.4, o site e as imagens do preview. Merge com CI verde.
5. PR da `develop` para a `main` e deploy no EasyPanel (confira se o deploy automático está ligado).

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
