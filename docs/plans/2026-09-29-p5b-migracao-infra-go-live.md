# P5b — Migração, infraestrutura e go-live: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levar o site ao ar: redirects do site antigo aplicados, conteúdo do WordPress migrado, consentimento de cookies com analytics, política de segurança completa, ambientes de staging e produção, monitoramento e backup, testes de ponta a ponta, QA e o go-live com aceite formal — seguindo o roadmap (semanas 5, 9 e 10) e o checklist do [runbook](../runbook-deploy.md).

**Architecture:** Duas frentes de código e uma de operação. **API:** comandos Artisan idempotentes para importar o WordPress (fase REST agora, fase dump quando o banco chegar) e gerar a tabela `redirects` a partir do `legacy_url` de cada registro migrado. **Site:** o `proxy.ts` passa a aplicar os redirects de `GET /redirects` antes do roteamento de idioma (inclusive `/wp-content/uploads/…`), um banner de consentimento carrega o Google Tag Manager só depois do "aceitar", e os cabeçalhos ganham uma CSP completa montada a partir das variáveis de ambiente. **Operação:** contas, ambientes, deploy, monitoramento, backup, carga do catálogo real, QA e go-live, conduzidos pelo tech lead com o checklist do runbook.

**Tech Stack:** o de P2–P4 (Laravel 13 + Filament 5, Next.js 16 + next-intl 4, Pest, Vitest). Dependências novas **só** as listadas em C1, cada uma com aprovação própria.

**Spec:** [docs/specs/2026-09-23-fundacao-design.md](../specs/2026-09-23-fundacao-design.md) (§6 SEO/segurança, §10 fora do escopo agora, §11 riscos). Roadmap de execução (semanas 5, 9 e 10 e checklist de go-live). Inventário: [docs/content-inventory.md](../content-inventory.md). Modelo: [docs/data-model.md](../data-model.md) (`legacy_wp_id`, `legacy_url`, `redirects`). Contrato: [docs/api.md](../api.md). Runbook: [docs/runbook-deploy.md](../runbook-deploy.md). Ledgers P2/P4 (decisões que continuam valendo).

## Itens de aprovação do tech lead

| #   | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Onde             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| C1  | **Dependências novas** (cada uma citada no PR da sua task; sem aprovação, a task fica de fora): monitoramento de erro — `sentry/sentry-laravel` e `@sentry/nextjs` (ou outro serviço escolhido); backup — `spatie/laravel-backup` **ou** backup do provedor de hospedagem (sem pacote); testes de ponta a ponta — `@playwright/test`. O importador de planilha usa o `ImportAction` que já vem no Filament (tabela `imports` já existe): **sem pacote novo**. | T9, T12, T6      |
| C2  | **Contas e acessos** (tech lead, com o cliente): hospedagem da API e do site, subdomínio de staging, Cloudflare (DNS, R2 com bucket público e privado, Turnstile), e-mail transacional, monitoramento, GA4 + Tag Manager + Search Console, cofre de senhas.                                                                                                                                                                                                   | T8–T10, T13, T14 |
| C3  | **Material do cliente:** dump do banco do WordPress (campos e relações do JetEngine), fotos em alta, textos pt/en, fichas técnicas, modelos GLB, cartela de acabamentos, textos jurídicos, planilha do catálogo (se C4 = sim), aceite formal.                                                                                                                                                                                                                 | T5, T11, T14     |
| C4  | **Decisões de escopo:** (a) importador de planilha sim/não (roadmap semana 2); (b) downloads técnicos atrás de cadastro ou livres (PRODUCT.md, pergunta em aberto); (c) lançamento só em `pt` se o inglês não chegar (spec §7 permite); (d) mapa embutido nas lojas (P5a B2).                                                                                                                                                                                 | T6, T11, T14     |
| C5  | **Findings do P4 a decidir:** `pnpm bootstrap` sem o segredo de revalidação; `queue:listen` do `pnpm dev` caindo no Windows; CORS da mídia no ambiente local.                                                                                                                                                                                                                                                                                                 | T1               |

## Global Constraints

- **Pré-requisitos:** PRs #9 e #10 mergeados em `develop` (redirects, `legacy_*`, API de escrita e o site da P4 vêm deles). A P5a pode andar em paralelo; a T13 (QA) e a T14 (go-live) esperam a P5a pronta.
- Cada task declara do que depende (C1–C5). Task bloqueada não começa; o bloqueio vai para o relatório e o ledger.
- **Nenhuma dependência nova sem aprovação** (C1). Nenhum segredo, chave, token ou dump no repositório; valores só no cofre e nas variáveis de ambiente do servidor; `.env.example` atualizado a cada variável nova.
- **Dados reais:** a migração importa o conteúdo do próprio site da Franccino (fonte aprovada no roadmap, semana 5). Nada é inventado: campo que não vem da fonte fica vazio e entra no relatório de lacunas. O seeder de demonstração da P2 T14 continua só em `APP_ENV=local` e nunca roda em staging ou produção.
- Schema só por migration nova, com `docs/data-model.md` atualizado. Mudou a API: `docs/api.md` no mesmo PR.
- Todo comando de migração é **idempotente** (chave `legacy_wp_id` / `from_path`), tem `--dry-run` e escreve relatório; nada apaga conteúdo editado à mão no painel.
- Web: zero texto literal em JSX (mensagens pt/en, R7 do P4 para mesclar), Server Components por padrão, decisões R1–R24 do P4 valendo; `proxy.ts` continua rodando a proteção de staging antes de tudo.
- Gates antes de cada commit: API — `php artisan test`, `composer analyse`, `vendor/bin/pint --test`; web — `pnpm --filter web lint`, `typecheck`, `test` e o build sem API.
- Commits Conventional em português sem acentos (`api`, `web`, `chore`, `docs`), terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Deploy de produção só pelo tech lead (roadmap §2.6).

## Conflitos entre as fontes e como este plano resolve

| #   | Conflito                                                                                                                                                                              | Resolução                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Web tipa `RedirectRule.to` como `string`; o data-model e a API mandam `null` quando `status = 410`.                                                                                   | `to: string \| null` (T2).                                                                                                                          |
| E2  | O `matcher` do `proxy.ts` ignora caminhos com ponto: `/wp-content/uploads/…/*.pdf` (PDFs legais, inventário §6) nunca chega ao proxy.                                                 | Matcher ganha `'/wp-content/:path*'` (T2).                                                                                                          |
| E3  | Spec: "redirects aplicados a partir de `/redirects`", sem dizer onde. As URLs antigas (`/produto/x/`) não têm prefixo de idioma e o next-intl as mandaria para `/pt/produto/x` (404). | Checagem no `proxy.ts` **antes** do roteamento de idioma, só para caminhos sem prefixo de idioma (ou a raiz com query), com índice em memória (T2). |
| E4  | O data-model guarda `from_path` "normalizado, pode incluir query"; o site antigo tem 228 URLs `/?taxonomy=linhas&term=…` e links com `utm_*`.                                         | Normalização única nos dois lados: sem barra final (exceto a raiz), query ordenada; busca exata e, sem achado, pelo caminho sem query (T2, T3).     |
| E5  | Campos do JetEngine (descrição, medidas, material, designer, galeria, relações) não saem na API REST do WordPress.                                                                    | Migração em duas fases: REST agora (estrutura, slugs, termos, SEO, mídia anexada), dump quando chegar (T5). Lacunas no relatório.                   |
| E6  | Roadmap semana 10 pede banner de cookies e analytics; LGPD pede consentimento antes de rastrear.                                                                                      | GTM carregado **só** depois do aceite; recusa guardada; link para a política de privacidade (T7).                                                   |
| E7  | Spec §6: "CSP completa fica para quando GA, Turnstile e o visualizador 3D estiverem definidos".                                                                                       | T8 depois de T7, com as origens vindas das variáveis de ambiente.                                                                                   |

## Mapa de arquivos

```
scripts/bootstrap.mjs, package.json (script dev)                     T1
web/src/
  proxy.ts                                                            T2
  lib/redirects/{match,store}.ts (+ testes)                           T2
  lib/api/types.ts (RedirectRule)                                     T2
  lib/consent/{store,gtm}.ts (+ testes); components/consent/ConsentBanner.tsx   T7
  lib/security/csp.ts (+ teste); next.config.ts                       T8
  lib/env.ts (NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_MEDIA_URL)              T7, T8
api/
  app/Console/Commands/{GenerateRedirects,ImportWordPress}.php        T3, T4
  app/Support/Migration/{PublicPaths,LegacyPath,RedirectGenerator}.php          T3
  app/Support/WordPress/{Client,Importer,ImportReport}.php (+ importadores)     T4, T5
  config/franccino.php (public_paths, wordpress)                     T3, T4
  app/Filament/Imports/ProductImporter.php                           T6 (se C4a)
  tests/Feature/Migration/*                                           T3–T5
e2e/ (se C1)                                                          T12
docs/runbook-deploy.md, docs/handoff/p5b-ledger.md                    T9–T14
```

---

### Task 1: Ajustes de ambiente pendentes do P4 (depende de C5)

**Files:** Modify `scripts/bootstrap.mjs`, `package.json` (raiz), `docs/HANDOFF.md` (seção 2.5).

- [ ] **Step 1: Segredo de revalidação no bootstrap.** Quando o `api/.env` **e** o `web/.env.local` forem criados nesta execução (ou estiverem com o segredo vazio), gerar um valor e gravar nos dois:

```js
// depois de criar api/.env e web/.env.local
const secret = randomBytes(24).toString('base64url');
for (const [file, key] of [
  [apiEnv, 'FRONTEND_REVALIDATE_SECRET'],
  [webEnv, 'REVALIDATE_SECRET'],
]) {
  const content = readFileSync(file, 'utf8');
  const pattern = new RegExp(`^${key}=\\s*$`, 'm');
  if (pattern.test(content)) {
    writeFileSync(file, content.replace(pattern, `${key}=${secret}`));
  }
}
```

Só preenche chave **vazia** (nunca sobrescreve um segredo existente) e o mesmo valor vai para os dois arquivos.

- [ ] **Step 2: Fila no Windows.** No script `dev` da raiz, `php api/artisan queue:listen --tries=1 --timeout=0` (o `queue:work --once` ocioso estourava os 60 s do listener e o `concurrently -k` derrubava tudo; P4 ledger, T11). Em produção a fila usa `queue:work` (runbook), sem mudança.
- [ ] **Step 3:** Conferir `pnpm bootstrap` numa pasta limpa (segredo igual nos dois `.env`, revalidação funcionando ao editar um banner) e `pnpm dev` parado 5 minutos sem cair. Atualizar a seção 2.5 do `HANDOFF.md`.
- [ ] **Step 4: Commit** — `chore: gera o segredo de revalidacao no bootstrap e evita a queda da fila no Windows`.

> O CORS da mídia local (terceiro finding) fica para o tech lead escolher: servir `/storage` com cabeçalho CORS no ambiente local ou aceitar que o 3D só funciona com a mídia no R2.

---

### Task 2: Redirects do site antigo no `proxy.ts`

**Files:**

- Create: `web/src/lib/redirects/match.ts`, `web/src/lib/redirects/store.ts`
- Modify: `web/src/proxy.ts`, `web/src/lib/api/types.ts`
- Test: `web/src/lib/redirects/match.test.ts`, `web/src/lib/redirects/store.test.ts`

**Interfaces:**

- Consumes: `getRedirects` (P3), `locales` (P3), `serverEnv`.
- Produces: `normalizeLegacyPath(pathname, search)`, `buildRedirectIndex(rules)`, `findRedirect(index, pathname, search)`, `isLegacyCandidate(pathname, search, locales)`, `loadRedirectIndex(now?)`, `resetRedirectCacheForTests()`.

- [ ] **Step 1: Testes que falham** — `web/src/lib/redirects/match.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildRedirectIndex, findRedirect, isLegacyCandidate, normalizeLegacyPath } from './match';

const index = buildRedirectIndex([
  { from: '/produto/cadeira-aura/', to: '/pt/produtos/cadeira-aura', status: 301 },
  { from: '/?term=pinot&taxonomy=linhas', to: '/pt/produtos?line=pinot', status: 301 },
  { from: '/jet-popup/cadastro-download', to: null, status: 410 },
]);

describe('normalizeLegacyPath', () => {
  it('drops the trailing slash and sorts the query', () => {
    expect(normalizeLegacyPath('/produto/x/', '')).toBe('/produto/x');
    expect(normalizeLegacyPath('/', '?taxonomy=linhas&term=pinot')).toBe('/?taxonomy=linhas&term=pinot');
  });
});

describe('findRedirect', () => {
  it('matches with or without trailing slash and query order', () => {
    expect(findRedirect(index, '/produto/cadeira-aura', '')?.to).toBe('/pt/produtos/cadeira-aura');
    expect(findRedirect(index, '/', '?taxonomy=linhas&term=pinot')?.to).toBe('/pt/produtos?line=pinot');
  });

  it('ignores extra tracking query when the path alone has a rule', () => {
    expect(findRedirect(index, '/produto/cadeira-aura/', '?utm_source=ig')?.status).toBe(301);
  });

  it('returns 410 rules and null for unknown paths', () => {
    expect(findRedirect(index, '/jet-popup/cadastro-download/', '')?.status).toBe(410);
    expect(findRedirect(index, '/nao-existe', '')).toBeNull();
  });
});

describe('isLegacyCandidate', () => {
  it('skips locale-prefixed paths and the bare root', () => {
    expect(isLegacyCandidate('/pt/produtos', '', ['pt', 'en'])).toBe(false);
    expect(isLegacyCandidate('/', '', ['pt', 'en'])).toBe(false);
    expect(isLegacyCandidate('/', '?taxonomy=linhas&term=x', ['pt', 'en'])).toBe(true);
    expect(isLegacyCandidate('/produto/x/', '', ['pt', 'en'])).toBe(true);
  });
});
```

`web/src/lib/redirects/store.test.ts` (mock de `@/lib/api/content`):

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';

const getRedirects = vi.fn();
vi.mock('@/lib/api/content', () => ({ getRedirects: (...args: unknown[]) => getRedirects(...args) }));

const { loadRedirectIndex, resetRedirectCacheForTests } = await import('./store');

describe('loadRedirectIndex', () => {
  afterEach(() => {
    resetRedirectCacheForTests();
    getRedirects.mockReset();
  });

  it('caches the index for five minutes', async () => {
    getRedirects.mockResolvedValue([{ from: '/a', to: '/pt', status: 301 }]);
    await loadRedirectIndex(0);
    await loadRedirectIndex(60_000);
    expect(getRedirects).toHaveBeenCalledTimes(1);
    await loadRedirectIndex(6 * 60_000);
    expect(getRedirects).toHaveBeenCalledTimes(2);
  });

  it('keeps the last good index when the API fails', async () => {
    getRedirects.mockResolvedValueOnce([{ from: '/a', to: '/pt', status: 301 }]);
    await loadRedirectIndex(0);
    getRedirects.mockRejectedValueOnce(new Error('down'));
    const index = await loadRedirectIndex(10 * 60_000);
    expect(index.size).toBe(1);
  });
});
```

- [ ] **Step 2: Módulos**

`web/src/lib/redirects/match.ts`:

```ts
import type { RedirectRule } from '@/lib/api/types';

export type RedirectIndex = Map<string, RedirectRule>;

/** Mesma normalização do `from_path` (T3): sem barra final (exceto a raiz), query em ordem alfabética. */
export function normalizeLegacyPath(pathname: string, search: string): string {
  const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const params = new URLSearchParams(search);
  params.sort();
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function buildRedirectIndex(rules: RedirectRule[]): RedirectIndex {
  const index: RedirectIndex = new Map();
  for (const rule of rules) {
    const url = new URL(rule.from, 'https://legado.invalid');
    index.set(normalizeLegacyPath(url.pathname, url.search), rule);
  }
  return index;
}

/** Exato (caminho + query) e, sem achado, só o caminho (ignora `utm_*` e afins). */
export function findRedirect(index: RedirectIndex, pathname: string, search: string): RedirectRule | null {
  return (
    index.get(normalizeLegacyPath(pathname, search)) ?? index.get(normalizeLegacyPath(pathname, '')) ?? null
  );
}

/** Só caminhos sem prefixo de idioma (ou a raiz com query) podem ser do site antigo. */
export function isLegacyCandidate(pathname: string, search: string, locales: readonly string[]): boolean {
  const first = pathname.split('/')[1] ?? '';
  if (locales.includes(first)) {
    return false;
  }
  return pathname !== '/' || search.length > 1;
}
```

`web/src/lib/redirects/store.ts`:

```ts
import { defaultLocale } from '@/i18n/config';
import { getRedirects } from '@/lib/api/content';
import { buildRedirectIndex, type RedirectIndex } from './match';

const TTL_MS = 5 * 60 * 1000;
let cache: { index: RedirectIndex; expires: number } | null = null;

/**
 * Índice de redirects em memória do processo do proxy (o cache de dados do Next não vale no proxy).
 * Revalida a cada 5 minutos; se a API falhar, mantém o último índice bom.
 */
export async function loadRedirectIndex(now: number = Date.now()): Promise<RedirectIndex> {
  if (cache && cache.expires > now) {
    return cache.index;
  }
  try {
    const index = buildRedirectIndex(await getRedirects(defaultLocale));
    cache = { index, expires: now + TTL_MS };
    return index;
  } catch {
    const fallback = cache?.index ?? new Map();
    cache = { index: fallback, expires: now + TTL_MS };
    return fallback;
  }
}

export function resetRedirectCacheForTests(): void {
  cache = null;
}
```

`web/src/lib/api/types.ts`: `export type RedirectRule = { from: string; to: string | null; status: 301 | 302 | 410 };` (E1).

- [ ] **Step 3: Proxy** — em `web/src/proxy.ts`, depois da proteção de staging e antes do `handleI18nRouting`:

```ts
const legacy = await legacyRedirect(request);
if (legacy) {
  return legacy;
}
```

com:

```ts
async function legacyRedirect(request: NextRequest): Promise<NextResponse | null> {
  const { pathname, search } = request.nextUrl;
  if (!isLegacyCandidate(pathname, search, locales)) {
    return null;
  }
  const rule = findRedirect(await loadRedirectIndex(), pathname, search);
  if (!rule) {
    return null;
  }
  if (rule.status === 410 || rule.to === null) {
    return new NextResponse(null, { status: 410 });
  }
  return NextResponse.redirect(new URL(rule.to, request.url), rule.status === 302 ? 302 : 301);
}
```

A função `proxy` passa a ser `async`. Matcher: `['/((?!api|_next|_vercel|.*\\..*).*)', '/wp-content/:path*']` (E2).

- [ ] **Step 4: Rodar e commitar** — gates verdes; com a API local e dois redirects cadastrados no painel (um 301 com query, um 410), conferir com `curl -I` que `/produto/x/`, `/?taxonomy=linhas&term=y` e `/wp-content/uploads/2024/05/arquivo.pdf` respondem o esperado e que `/pt` segue normal.

```bash
git commit -m "feat(web): aplica os redirects do site antigo no proxy antes do roteamento de idioma

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Geração dos redirects na API

**Files:**

- Create: `api/app/Support/Migration/{LegacyPath,PublicPaths,RedirectGenerator}.php`, `api/app/Console/Commands/GenerateRedirects.php`
- Modify: `api/config/franccino.php` (`public_paths`, `legacy_gone`)
- Test: `api/tests/Feature/Migration/GenerateRedirectsTest.php`

**Interfaces:**

- Produces: `LegacyPath::normalize(string $url): string` (mesma regra da T2); `PublicPaths::for(Model $model): ?string` (caminho público em `pt`); comando `php artisan franccino:redirects:generate {--dry-run}`.

**Regras:**

1. Para cada registro publicado com `legacy_url` (produtos, designers, coleções, lançamentos, projetos, lojas, categorias, linhas): `from_path = LegacyPath::normalize(legacy_url)`, `to_path = PublicPaths::for($model)`, `status_code = 301`, `notes = 'gerado: <tipo> #<id>'`.
2. Mapas fixos em `config('franccino.public_paths')` (caminhos em `pt`, espelhando os `pathnames` do web): produto `/pt/produtos/{slug}`, designer `/pt/designers/{slug}`, coleção `/pt/colecoes/{slug}`, lançamento `/pt/lancamentos/{slug}`, projeto `/pt/projetos/{slug}`, loja `/pt/lojas`, categoria `/pt/{indoor|outdoor}/{slug}`, linha `/pt/produtos?line={slug}`, e as páginas antigas (`/produtos-indoor/` → `/pt/indoor`, `/produtos-outdoor/` → `/pt/outdoor`, `/todos-produtos/` → `/pt/produtos`, `/institucional/` → `/pt/fabrica`, `/contato/` → `/pt/contato`, `/corporativo/` → `/pt/corporativo`, `/lojas/` → `/pt/lojas`, `/designers/` → `/pt/designers`, `/lancamentos/` → `/pt/lancamentos`, `/colecoes/` → `/pt/colecoes`, `/termos-de-uso/` e `/politica-de-privacidade/` → as páginas novas; os slugs antigos exatos vêm do inventário na hora de executar).
3. `config('franccino.legacy_gone')`: prefixos que respondem 410 (`/jet-popup/`, `/banners/`, `/author/`, `/wishlist/`, downloads de teste do inventário).
4. **Nunca** sobrescrever linha sem o prefixo `gerado:` em `notes` (regra editada no painel vence). Upsert por `from_path`. Linha gerada cujo registro sumiu vira `is_active = false`.
5. PDFs legais (`/wp-content/uploads/…` dos relatórios de transparência): uma linha por arquivo apontando para a URL nova do documento (configurações > documentos do rodapé); gerada a partir de uma lista em `config('franccino.legacy_documents')` preenchida quando os arquivos novos existirem.

- [ ] **Step 1: Testes que falham** (Pest):

```php
it('creates a 301 from the legacy product URL to the new product page', function () {
    $product = Product::factory()->published()->create([
        'slug' => ['pt' => 'cadeira-aura', 'en' => 'aura-chair'],
        'legacy_url' => 'https://franccino.com.br/produto/cadeira-aura/',
    ]);

    $this->artisan('franccino:redirects:generate')->assertSuccessful();

    expect(Redirect::where('from_path', '/produto/cadeira-aura')->first())
        ->to_path->toBe('/pt/produtos/cadeira-aura')
        ->status_code->toBe(RedirectStatus::MovedPermanently);
});

it('keeps redirects edited in the panel', function () {
    Redirect::factory()->create(['from_path' => '/produto/x', 'to_path' => '/pt/colecoes/tempo', 'notes' => 'ajuste manual']);
    Product::factory()->published()->create(['slug' => ['pt' => 'x', 'en' => 'x'], 'legacy_url' => 'https://franccino.com.br/produto/x/']);

    $this->artisan('franccino:redirects:generate')->assertSuccessful();

    expect(Redirect::where('from_path', '/produto/x')->value('to_path'))->toBe('/pt/colecoes/tempo');
});

it('normalizes query strings and is idempotent', function () {
    Line::factory()->create(['slug' => 'pinot', 'legacy_url' => 'https://franccino.com.br/?taxonomy=linhas&term=pinot']);

    $this->artisan('franccino:redirects:generate')->assertSuccessful();
    $this->artisan('franccino:redirects:generate')->assertSuccessful();

    expect(Redirect::where('from_path', '/?taxonomy=linhas&term=pinot')->count())->toBe(1);
});
```

> Os nomes de factory/state/enum seguem o que a P2 criou (conferir `database/factories` e `app/Enums/RedirectStatus.php`); se divergirem, siga o código e registre no relatório.

- [ ] **Step 2:** Implementar `LegacyPath` (parse da URL, só caminho + query, barra final removida exceto na raiz, query ordenada com `ksort`), `PublicPaths` (a partir do config, slug `pt` do modelo), `RedirectGenerator` (regras 1–5, retorna contagens criadas/atualizadas/desativadas/preservadas) e o comando (tabela de contagens; `--dry-run` não grava). Revalidação do site: o observer da P2 T13 já dispara a tag `redirects`; o proxy (T2) relê em até 5 minutos.
- [ ] **Step 3:** `docs/data-model.md`: nota sobre `notes = 'gerado: …'` como marcador de linha gerada. Gates verdes.
- [ ] **Step 4: Commit** — `feat(api): gera os redirects do site antigo a partir do legacy_url`.

---

### Task 4: Migração do WordPress — fase REST

**Files:**

- Create: `api/app/Support/WordPress/{Client,ImportReport}.php`, `api/app/Support/WordPress/Importers/{TermImporter,DesignerImporter,CollectionImporter,ProductImporter,StoreImporter,ProjectImporter,ClientImporter,MediaAttacher}.php`, `api/app/Console/Commands/ImportWordPress.php`
- Modify: `api/config/franccino.php` (`wordpress.base_url`, `wordpress.per_page`), `api/.env.example` (`WORDPRESS_BASE_URL=https://franccino.com.br`)
- Test: `api/tests/Feature/Migration/ImportWordPressTest.php` (com `Http::fake`, sem rede)

**Interfaces:**

- Comando `php artisan franccino:wordpress:import {--only=*} {--dry-run} {--without-media}`; ordem: termos (áreas, categorias, linhas) → designers → coleções → produtos → lojas → projetos/cases → clientes → mídia.
- `Client::paginate(string $endpoint, array $query = []): LazyCollection` (lê `X-WP-TotalPages`, `per_page=100`, retry com backoff, `timeout(20)`).
- `ImportReport` — contagens por entidade (criado/atualizado/ignorado) e **lacunas** (campos ausentes por registro), gravado em `storage/app/migration/relatorio-AAAA-MM-DD.md`.

**Regras:**

1. Chave de idempotência: `legacy_wp_id` + `legacy_url` (link do WordPress). Reexecutar atualiza só campos vindos da fonte e **nunca** sobrescreve campo editado no painel depois da importação (comparar `updated_at` com a última importação registrada em `legacy_imported_at`; se o schema não tiver a coluna, migration nova + data-model).
2. Tudo entra como **rascunho** (`is_published = false`); publicar é decisão da Franccino no painel (carga, T11).
3. Categorias duplicadas "X Casa"/"X Giardini" viram uma categoria por área (inventário §3); slugs com `-2`/`-3` e numéricos entram como vieram e aparecem no relatório para revisão.
4. Texto em pt; `en` vazio (sem versão em inglês no site atual).
5. Mídia: `/wp/v2/media?parent=<id>` por registro, ordem pelo `menu_order`/data; download para o disco `media` (R2 em staging/produção) com `legacy_media_id` como propriedade customizada (não duplica). WebP servido mesmo quando o original sumiu (inventário §6): baixar a URL servida.
6. SEO: `yoast_head_json.title` e `description` para os campos `seo_*`.
7. **Lacunas esperadas nesta fase** (entram no relatório, não são erro): descrição, medidas, material, acabamento, designer do produto, relações — campos do JetEngine (E5, fase T5).

- [ ] **Step 1: Teste que falha** — `Http::fake` com uma página de `/wp/v2/produtos`, uma de `/wp/v2/media?parent=…` e as imagens; afirmar: produto criado em rascunho com `legacy_wp_id`, termos ligados, SEO preenchido, 1 imagem anexada; segunda execução não duplica produto nem mídia; relatório lista "descrição" e "medidas" como lacunas.
- [ ] **Step 2:** Implementar `Client`, `ImportReport`, os importadores e o comando (com `--dry-run` que só lê e relata). Reusar o `DemoImageCache` da P2 T14 só como referência de download; não reusar o seeder.
- [ ] **Step 3:** Rodar localmente contra o site atual com `--dry-run` e depois de verdade num banco SQLite novo; revisar o relatório.
- [ ] **Step 4:** `docs/data-model.md` (se houver coluna nova) e `docs/handoff/p5b-ledger.md` com os números da execução. Gates verdes.
- [ ] **Step 5: Commit** — `feat(api): importa o conteudo do WordPress atual pela API REST`.

> Depois da importação: `php artisan franccino:redirects:generate` (T3) e o relatório de lacunas vai ao cliente pelo tech lead (roadmap semana 5: "peça que sustenta qualquer conversa sobre atraso por falta de material").

---

### Task 5: Migração do WordPress — fase dump (depende de C3: dump do banco)

**Files:** Create `api/app/Support/WordPress/Dump/{DumpReader,JetEngineMapper}.php`; Modify `ImportWordPress.php` (`--source=dump --dump=caminho.sql`); Test com um recorte de dump sintético (tabelas `wp_posts`, `wp_postmeta`, `wp_jet_rel_*` com poucos registros criados no teste).

- [ ] **Step 1:** Ler o dump num banco SQLite/MySQL temporário (nunca no banco da aplicação) e mapear `wp_postmeta` do JetEngine: descrição rica (sanitizada como o resto do texto rico da P2), medidas (reusar o parser de medidas da P2 T14: cm→mm, faixas e escala mista ignoradas e relatadas), material, designer e relações (`wp_jet_rel_*`).
- [ ] **Step 2:** Mesmas regras da T4 (idempotência, rascunho, nada sobrescrito do painel) e o relatório de lacunas atualizado.
- [ ] **Step 3: Commit** — `feat(api): completa a migracao com os campos do JetEngine a partir do dump`.

---

### Task 6: Importador de planilha do catálogo (depende de C4a)

**Files:** Create `api/app/Filament/Imports/ProductImporter.php`, `docs/catalogo-planilha-modelo.csv`; Modify o resource de produtos (ação "Importar planilha").

- [ ] **Step 1:** `ImportAction` do Filament (sem pacote novo) com colunas exatas do CMS: `legacy_wp_id` (opcional), `slug_pt`, `nome_pt`, `nome_en`, `area`, `categoria`, `linha`, `designer`, `colecao`, `largura_mm`, `profundidade_mm`, `altura_mm`, `altura_assento_mm`, `diametro_mm`, `material_pt`, `material_en`, `descricao_pt`, `descricao_en`. Validação por linha; linha com erro vai para o arquivo de falhas do Filament, as outras entram.
- [ ] **Step 2:** Casa com registros existentes por `legacy_wp_id` ou `slug_pt`; produtos entram em rascunho.
- [ ] **Step 3:** Planilha modelo em `docs/` para o cliente preencher (roadmap semana 2/9). Testes de importação com CSV pequeno.
- [ ] **Step 4: Commit** — `feat(api): adiciona importacao de produtos por planilha no painel`.

---

### Task 7: Consentimento de cookies e Google Tag Manager (site)

**Files:**

- Create: `web/src/lib/consent/store.ts`, `web/src/lib/consent/gtm.ts`, `web/src/components/consent/ConsentBanner.tsx`
- Modify: `web/src/app/[locale]/layout.tsx`, `web/src/lib/env.ts` (`NEXT_PUBLIC_GTM_ID`, opcional), `web/.env.example`, `web/src/styles/components.css` (`.consent-banner`), `web/messages/{pt,en}.json`
- Test: `web/src/lib/consent/store.test.ts`, `web/src/lib/consent/gtm.test.ts`, `web/src/components/consent/ConsentBanner.test.tsx`

**Interfaces:**

- `type ConsentChoice = 'granted' | 'denied'`; store `franccino.consent.v1` via `createLocalStore` (R11 do P4): `getConsent(): ConsentChoice | null`, `setConsent(choice)`, `subscribeConsent(listener)`.
- `gtmScriptSrc(id): string`; `loadGtm(id): void` (idempotente: injeta o script uma vez e inicializa `dataLayer`).
- `ConsentBanner()` — cliente; só aparece sem escolha; "Aceitar" e "Recusar" com o mesmo peso visual (LGPD), link para `/privacy`; com `granted` e `NEXT_PUBLIC_GTM_ID` definido chama `loadGtm`. Sem ID, o banner não aparece (nada a consentir).

- [ ] **Step 1: Testes que falham** — store (padrão `null`, grava e notifica, valor inválido vira `null`); `gtmScriptSrc('GTM-ABC')` = `https://www.googletagmanager.com/gtm.js?id=GTM-ABC`; `loadGtm` duas vezes injeta um script só; `ConsentBanner` renderiza os dois botões e o link da privacidade no servidor como placeholder vazio (sem piscar: o banner só monta no cliente, `useIsClient` do P4).
- [ ] **Step 2:** Implementar. O `ConsentBanner` entra no layout depois do rodapé. Estilo: faixa fixa no rodapé da tela, `--paper`, borda `--line`, botões `btn` e `btn--ghost` com 44 px, sem sombra (DESIGN.md), respeita `prefers-reduced-motion`.
- [ ] **Step 3: Mensagens** — `consent` pt: `{ "title": "Cookies", "body": "Usamos cookies de análise para entender como o site é usado. Você escolhe.", "accept": "Aceitar", "decline": "Recusar", "privacy": "Política de privacidade" }` · en: `{ "title": "Cookies", "body": "We use analytics cookies to understand how the site is used. It's your choice.", "accept": "Accept", "decline": "Decline", "privacy": "Privacy policy" }`. O texto final passa pela revisão jurídica da Franccino (C3); até lá é interface, não promessa.
- [ ] **Step 4:** Conferir no navegador: sem escolha nenhuma requisição ao Google; "Recusar" persiste e nunca carrega; "Aceitar" carrega o GTM. Gates verdes.
- [ ] **Step 5: Commit** — `feat(web): adiciona consentimento de cookies e carrega o Tag Manager so depois do aceite`.

---

### Task 8: Política de segurança de conteúdo (CSP) completa (depois da T7)

**Files:** Create `web/src/lib/security/csp.ts` (+ `csp.test.ts`); Modify `web/next.config.ts`, `web/src/lib/env.ts` (`NEXT_PUBLIC_MEDIA_URL`), `web/.env.example`, `docs/runbook-deploy.md`.

- [ ] **Step 1: Teste que falha** — `buildCsp({ apiUrl, mediaUrl, gtm, turnstile })` gera: `default-src 'self'`; `img-src 'self' data: blob: <media>`; `connect-src 'self' <api> <media>` (+ Google Analytics se `gtm`); `script-src 'self'` (+ `https://www.googletagmanager.com` se `gtm`, + `https://challenges.cloudflare.com` se `turnstile`); `frame-src https://challenges.cloudflare.com` só com Turnstile; `worker-src 'self' blob:` (model-viewer); `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`; sem `unsafe-eval`. Em desenvolvimento, `script-src` inclui `'unsafe-eval'` (exigência do Next em dev) — testado separado.
- [ ] **Step 2:** `next.config.ts` usa `buildCsp` no lugar do `frame-ancestors` isolado. Primeiro em **Report-Only** no staging por uma semana (header `Content-Security-Policy-Report-Only`), depois vira a política (decisão registrada no ledger).
- [ ] **Step 3:** Conferir no navegador: home, produto com 3D, formulário com Turnstile, GTM após aceite — console sem violação. Gates verdes.
- [ ] **Step 4: Commit** — `feat(web): adiciona a politica de seguranca de conteudo completa`.

---

### Task 9: Monitoramento de erro e backup (depende de C1 e C2)

- [ ] **Monitoramento:** com o serviço e o pacote aprovados, integrar API e site (captura de exceções em produção e staging, sem dados pessoais nos eventos, amostragem configurável por variável de ambiente). Teste: um erro forçado em staging chega ao painel do serviço. Variáveis no runbook e no `.env.example`.
- [ ] **Backup:** o que o tech lead aprovar — pacote (`spatie/laravel-backup`: banco diário, 30 dias de retenção, destino fora do servidor) ou backup do provedor. **Restauração testada uma vez** (checklist de go-live), com o passo a passo no runbook.
- [ ] **Commits:** `feat(api): …` / `feat(web): …` / `docs: …` conforme o caso.

---

### Task 10: Ambientes, deploy e borda (depende de C2; conduzida pelo tech lead)

- [ ] Staging (`develop`) e produção (`main`) da API e do site conforme o runbook: variáveis por ambiente (tabela do runbook), `SITE_ENV=staging` com autenticação HTTP e `noindex`, SSL e redirecionamento http→https.
- [ ] R2: bucket público de mídia com **CORS** para as origens do site (GLB do 3D) e bucket privado de downloads (URL assinada); domínio de mídia em `NEXT_PUBLIC_MEDIA_URL` (T8).
- [ ] Limite de requisições na borda para a busca, as listagens com `q` e a Server Action da sala (runbook, "Deploy do site").
- [ ] Worker da fila (`queue:work --tries=3`) e agendador rodando; revalidação do site testada (editar um banner em staging atualiza a home).
- [ ] Turnstile: chaves de staging e produção; formulários testados com envio real (e-mail transacional configurado; `contact_recipients` preenchido no painel).
- [ ] Runbook completado com o que foi escolhido (provedores, comandos, quem acessa o quê). Commit `docs: completa o runbook com os ambientes de staging e producao`.

---

### Task 11: Carga do catálogo real (depende de C3; roadmap semana 9)

- [ ] Rodar a migração (T4, e T5 com o dump) em staging; publicar o que o cliente conferir.
- [ ] Completar o que não veio: produtos restantes (planilha, T6, se aprovada), acabamentos e cartela, coleções, designers, lançamentos, projetos, lojas, banners e blocos da home, páginas institucionais (fábrica, corporativo, contato com FAQ, privacidade, termos), documentos do rodapé (PDFs legais), SEO por página.
- [ ] Arquivos técnicos (fichas, blocos 2D/3D) e modelos GLB onde houver; produtos sem GLB ficam com o 3D desligado (padrão do painel).
- [ ] Conteúdo em inglês conferido pelo tech lead (ou decisão C4c: lançar só em `pt` com `NEXT_PUBLIC_SITE_LOCALES=pt` e `APP_LOCALES=pt`).
- [ ] `php artisan franccino:redirects:generate` depois da carga; revisar no painel as linhas sem destino.
- [ ] Registrar no ledger o que ficou faltando (lacunas) e quem entrega.

---

### Task 12: Testes de ponta a ponta (depende de C1: `@playwright/test`)

**Files:** Create `e2e/` na raiz (`playwright.config.ts`, `tests/*.spec.ts`), script `pnpm e2e`, job opcional na CI contra o staging.

- [ ] Fluxos: home → produto → escolher acabamento → adicionar à lista → enviar orçamento (API de staging, Turnstile em modo de teste); sala para montar (pôr peça, mover pelo teclado, enviar para a lista); catálogo com filtro e visão técnica; troca de idioma mantendo a página; redirect antigo (`/produto/<slug>/`) chegando na página nova; banner de cookies (recusar não carrega GTM).
- [ ] Rodar em Chromium, WebKit e Firefox, desktop e celular.
- [ ] **Commit** — `test: adiciona testes de ponta a ponta dos fluxos principais`.

---

### Task 13: QA, performance e acessibilidade (depende da P5a e da T10)

- [ ] Testes cruzados (cada um testa o que não construiu): Chrome, Safari, Firefox e Edge, desktop e celular.
- [ ] Lighthouse oficial (modo mobile) na home, numa página de produto, na sala e na lista: LCP < 2,5 s, CLS < 0,1, acessibilidade sem falha. Corrigir o que falhar na task de origem (P4/P5a) com `fix(web): …`. Pendências conhecidas: LCP da home (medição aproximada da P4) e CLS da lista de orçamento.
- [ ] 3D em iPhone e Android reais; download técnico por URL assinada; formulário de contato e newsletter com envio real.
- [ ] Teste de carga básico nas listagens (roadmap semana 10) e revisão de segurança do painel (perfis, 2FA, políticas).
- [ ] Resultado no ledger com os números.

---

### Task 14: Go-live e aceite (tech lead; depende de tudo acima)

Checklist do roadmap (§7) e do runbook, marcado um a um no ledger:

- [ ] Redirects 301 de todas as URLs antigas testados (script que percorre o `sitemap_index.xml` antigo e confere o status de cada URL no site novo; lista de falhas corrigida no painel).
- [ ] Sitemap nos dois idiomas enviado ao Search Console; `hreflang` conferido; metadados preenchidos.
- [ ] `noindex` removido da produção e mantido em staging; SSL e https.
- [ ] Analytics e Tag Manager disparando (após consentimento); banner de cookies e política de privacidade publicados.
- [ ] Downloads, formulários e 3D conferidos em produção; backup e restauração testados; monitoramento recebendo eventos.
- [ ] Virada de DNS; acompanhar o Search Console por 30 dias (erros de rastreamento, cobertura, 404).
- [ ] Credenciais do painel para a equipe da Franccino; treinamento do painel gravado (com o Matheus).
- [ ] **Aceite formal por escrito** (libera a segunda parcela).

---

## Ordem sugerida

| Quando                                              | Tasks                                |
| --------------------------------------------------- | ------------------------------------ |
| Logo após #9 e #10 no `develop` (sem conta externa) | T1 (com C5), T2, T3, T4, T7          |
| Com o dump / a decisão da planilha                  | T5, T6                               |
| Com as contas (C2)                                  | T8 (Report-Only em staging), T9, T10 |
| Com o material do cliente (C3)                      | T11                                  |
| Com a P5a pronta                                    | T12, T13                             |
| Por último                                          | T14                                  |
