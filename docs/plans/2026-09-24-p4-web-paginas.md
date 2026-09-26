# P4 — Páginas do front no design system: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o protótipo aprovado (`design/prototype/`) em páginas de produção em `web/`, com o design system em tokens, dados reais da API e as funcionalidades de conversão (lista de orçamento, sala para montar, acabamentos, visão técnica e 3D sob demanda).

**Architecture:** Tokens do `DESIGN.md` viram variáveis CSS em `src/styles/tokens.css`, expostas ao Tailwind 4 por `@theme inline`; as classes de componente do protótipo são portadas para arquivos CSS por área, na camada `components`. Páginas são Server Components que leem a API pelo `src/lib/api` do P3; só o que tem estado ou evento de navegador é Client Component (lista de orçamento, sala, acabamentos, galeria/3D, menu, lojas). Lista de orçamento e planta vivem no `localStorage` (lojas externas lidas com `useSyncExternalStore`); o envio usa o `ContactForm` com `items`. Toda lógica (lista, geometria da planta, seleção de acabamentos, desenho de medidas, filtros) fica em módulos puros testados com Vitest.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, next-intl 4, zod, `next/font/google` (Archivo, eixo `wdth`), `@google/model-viewer` (já instalado no P3), Vitest + `react-dom/server` para testes de componente.

**Spec:** [docs/specs/2026-09-23-fundacao-design.md](../specs/2026-09-23-fundacao-design.md) (autoridade), contrato em [docs/api.md](../api.md). Fontes de design: [web/DESIGN.md](../../web/DESIGN.md), [web/.impeccable/design.json](../../web/.impeccable/design.json), protótipo aprovado em [design/prototype/](../../design/prototype/) (contrato de direção no comentário do `index.html`, comportamentos em `assets/app.js`, estilos em `assets/styles.css`; `assets/data.js` é ilustrativo e **não** é fonte de dados). Contexto de produto: [web/PRODUCT.md](../../web/PRODUCT.md). Base: [P3](2026-09-23-p3-web-base.md).

## Itens de aprovação do tech lead

| #   | Item                                                                                                                                                                                                                                                                                                                                   | Onde              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| A1  | **Adições de escopo** (PRODUCT.md): sala para montar, lista de orçamento, seletor de acabamentos, visão técnica do catálogo e a experiência 3D (alternância Fotos/3D). Precisam de aprovação antes do release. Cada uma fica isolada (rota própria, `?view=table`, componentes próprios) para poder ser desligada sem quebrar o resto. | Tasks 2, 5–10, 12 |
| A2  | **Dependências: nenhuma nova.** Usa o que o P3 instalou (`@google/model-viewer`, `zod`, `next-intl`) e `next/font/google` (parte do Next). Testes de componente com `react-dom/server` (já instalado), sem jsdom nem Testing Library. Se alguma task sentir falta de pacote, pare e peça aprovação.                                    | todas             |
| A3  | **Contrato:** (a) `items` em `POST /contact` precisa estar em `docs/api.md` (P2, Task 12) antes da Task 12 deste plano; (b) a forma de `GET /settings` não está descrita no contrato e o P3 a adivinhou diferente do P2 — a Task 4 espelha o P2 e documenta em `docs/api.md`.                                                          | Tasks 2, 4, 12    |
| A4  | **Proposta de contrato (não bloqueia):** incluir a medida principal (`dimensions`) no `ProductCard`. Sem isso, tabela técnica e sala buscam o detalhe de cada peça (até 24 por página, com cache por tag).                                                                                                                             | Tasks 6, 10       |
| A5  | **Fonte provisória:** Archivo via `next/font/google` (baixa no build: a CI precisa de rede). Troca pelo arquivo do manual de marca em um só módulo (`src/app/fonts.ts`).                                                                                                                                                               | Task 1            |

## Global Constraints

- **Pré-requisitos:** P3 completo (Tasks 1–6) na branch de trabalho; P2 Task 12 mergeada (contato aceita `items`). Se faltar algum, pare e registre no relatório.
- Trabalhar só em `web/` e, na Task 4, no trecho de `GET /settings` de `docs/api.md`. Não mexer em `api/`, `package.json` da raiz, `CLAUDE.md` da raiz nem em `design/`.
- Instalação sempre pela raiz (`pnpm install`); comandos do app com `pnpm --filter web <script>`.
- **Zero texto literal em JSX** (`react/jsx-no-literals`): todo texto visível em `messages/pt.json` **e** `messages/en.json`, inclusive rótulos ARIA, unidades (`cm`, `m`) e mensagens de erro. Separadores visuais (`·`, `/`) vêm do CSS ou da lista permitida do lint.
- Server Components por padrão. `"use client"` só em: lista de orçamento, sala para montar, seletor de acabamentos/quantidade, galeria e 3D, menu do header e contador da lista, seletor de idioma, lojas por estado, formulários, toast e botões de download/adicionar.
- **Nenhuma dependência nova** (ver A2).
- O front só fala com `/api/v1`: no servidor pelos módulos de `src/lib/api`; no navegador só por `src/lib/api/forms.ts` (contato, newsletter, link de download). A busca da sala usa uma Server Action que chama `src/lib/api` no servidor.
- Tipos espelham `docs/api.md` exatamente (e o que a Task 4 documentar para `/settings`).
- **Nunca inventar** preço, prazo, garantia, especificação, depoimento, contagem ou fato de marca. Seção da home sem dado da API é omitida. Textos de interface descrevem ações, não prometem serviço.
- Design system (DESIGN.md): cores, fontes, espaçamentos e sombras só por token (hex só em `src/styles/tokens.css`); cantos retos (`border-radius: 0`, exceto contador e ponto de área); plano em repouso (sombra só no hover do card de produto); madeira = Casa, verde = Giardini/sucesso, nenhum terceiro acento; metadados abaixo/ao lado do título, nunca "kicker" acima.
- WCAG 2.1 AA: foco visível, navegação por teclado em tudo (inclusive a planta), contraste de texto ≥ 4,5:1 e de bordas de controle ≥ 3:1, alvos ≥ 44 px, `prefers-reduced-motion` respeitado. LCP < 2,5 s e CLS < 0,1 em 4G: imagem do topo com `priority`, `width`/`height` sempre, fonte com `display: swap`, 3D e planta só nas rotas que usam.
- Build sem API: chamadas feitas durante o build (layout, home, sala, listas estáticas, `generateStaticParams`) passam por `withBuildFallback` (Task 4). Em produção o build continua falhando se a API cair (só `ALLOW_BUILD_WITHOUT_API=true` devolve vazio).
- Variáveis de ambiente nunca são lidas no import de módulo: use `serverEnv()` e `getPublicEnv()` dentro de funções (decisão do P3).
- Nomes públicos do P3 usados aqui (não renomear): `serverEnv`, `getPublicEnv`, `getSiteLocales`, `Locale`, `locales`, `defaultLocale`, `htmlLang`, `routing`, `pathnames`, `Link`, `getPathname`, `usePathname`, `apiGet`, `apiGetOrNull`, `ApiError` (em `src/lib/api/errors.ts`), `getProducts`, `getProductFacets`, `getProduct`, `getArea`, `getCategories`, `getCategory`, `getHome`, `getAreas`, `getDesigners`, `getDesigner`, `getLaunches`, `getLaunch`, `getStores`, `getPage`, `getSettings`, `submitContact`, `subscribeNewsletter`, `requestDownloadLink`, `mapValidationErrors`, `ApiImage`, `buildSrcSet`, `pickSource`, `formatDimension`, `RichText`, `buildMetadata`, `absoluteUrl`, `productJsonLd`, `breadcrumbJsonLd`, `organizationJsonLd`, `JsonLd`, `parseListingParams`, `resolveAlternateHref`, `Turnstile`.
- Onde este plano **reescreve** um arquivo do P3, a versão do plano vale; antes de apagar um export, `grep` por usos e ajuste-os na mesma task. Se uma API de pacote divergir do plano, siga a versão instalada (Next 16 traz docs em `node_modules/next/dist/docs/`) mantendo os nomes públicos daqui.
- Antes de cada commit: `pnpm --filter web lint`, `pnpm --filter web typecheck`, `pnpm --filter web test` e `ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` verdes.
- Commits Conventional em português, escopo `web`, sem acentos na mensagem (padrão do P3), terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Ambiente Windows + Git Bash.

## Conflitos entre as fontes e como este plano resolve

| #   | Conflito                                                                                                                                                                                                                              | Resolução                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Protótipo mostra medida no card, na tabela técnica e na biblioteca da sala; `ProductCard` da API não tem medidas nem arquivos.                                                                                                        | Card sem medida. Tabela técnica e sala buscam o `ProductDetail` de cada peça (`getProductDetails`, cache por tag, no máximo 24 por página). Proposta A4.                                                              |
| C2  | Protótipo pré-seleciona o primeiro acabamento e fala em "acabamento padrão"; a API não tem acabamento padrão.                                                                                                                         | Sem pré-seleção (exceto grupo com uma única opção). Item entra na lista como "acabamento a definir".                                                                                                                  |
| C3  | Amostras do protótipo usam cor hex + recorte de foto; a API entrega `swatch: Image \| null`.                                                                                                                                          | `ApiImage` da amostra; sem imagem, o código (ou as iniciais) em texto.                                                                                                                                                |
| C4  | Textos inventados no protótipo: "responde em até 1 dia útil", "16 designers" fixo, fatos da fábrica, modelo SheenChair, texto da peça, "Relatórios de transparência salarial", "Cancele quando quiser", "peças que chegaram em 2026". | Vêm da API (banner, `tagline`, página `factory`, `footer_documents`, total real de `getDesigners`) ou são omitidos. Newsletter sem promessa de descadastro (a API não tem essa rota).                                 |
| C5  | DESIGN.md cita "price cue" e numerais de preço.                                                                                                                                                                                       | Não há preço público (PRODUCT.md). `.num` só em medidas e contagens.                                                                                                                                                  |
| C6  | Borda de campo em `--line-strong` (#bdb9ae, 1,9:1 no branco) e campo do rodapé em #5a5953 (2,5:1 no ink) falham WCAG 1.4.11 (3:1). Linhas de cota do protótipo em #8a887f (`--ink-3`, "não canonizado").                              | Token novo `--line-field: #8a887f` (3,6:1 no branco, 5,0:1 no ink) nas bordas de campo e no campo do rodapé. Linhas de cota e da planta usam `--ink-muted`.                                                           |
| C7  | Navegação: protótipo (Indoor, Outdoor, …, Sala para montar, Área técnica), P3 (…, Projetos corporativos, Contato, Blocos 3D) e o pedido de áreas "Casa/Giardini".                                                                     | Header: Casa, Giardini, Lançamentos, Coleções, Designers, Projetos, Fábrica, Lojas, Sala para montar, Área técnica. Corporativo, Downloads e Contato vão para o rodapé.                                               |
| C8  | Protótipo trata "Lançamentos" como filtro `isNew` (`?novos=1`); a API tem a entidade Launch e o filtro `launch`, sem filtro `is_new`.                                                                                                 | `/lancamentos` lista lançamentos; o detalhe mostra as peças em grade/tabela; a home usa `current_launch`.                                                                                                             |
| C9  | Rotas do protótipo (`catalogo.html?area=casa`, `view=tabela`).                                                                                                                                                                        | Rotas do P3 (`/indoor`, `/outdoor`, categorias) + `?view=table`; "Área técnica" = `/produtos?view=table`; rotas novas `/lista-de-orcamento` (`/en/quote-list`) e `/sala-para-montar` (`/en/room-planner`).            |
| C10 | Lista do protótipo guarda slug e ids de `data.js`.                                                                                                                                                                                    | Snapshot por item (id, slug, idioma, nome, imagem, acabamentos com nome e código) em `franccino.quote.v1`, validado com zod; itens inválidos são descartados. Planta em `franccino.plan.v1` com snapshot das medidas. |
| C11 | Contato: API exige `message` (≤ 5000) e `consent`; protótipo tem "Observações" opcional, UF com "Outro" (inválido para `state` de 2 letras), profissões sem `other` e newsletter sem consentimento.                                   | Mensagem composta (observações + lista); 27 UFs; os 5 valores do enum de profissão; checkbox de consentimento também na newsletter.                                                                                   |
| C12 | `Settings` do P3 (`whatsapp`, `social_links`, `footer_documents{title,url}`) difere do que o P2 expõe (`quotes_whatsapp`, `assistance_whatsapp`, redes por campo, `footer_documents{label,url}`); `docs/api.md` não descreve.         | Task 4 espelha o P2, ajusta os usos do P3 e documenta em `docs/api.md` (A3).                                                                                                                                          |
| C13 | Protótipo carrega o model-viewer do CDN e um GLB de exemplo.                                                                                                                                                                          | Pacote npm do P3 com `import()` sob demanda, só `model_3d` da API; sem modelo, sem alternância. `?view=3d` lido no cliente para a página de produto seguir estática.                                                  |
| C14 | P3 põe formulário de orçamento na página de produto; o protótipo não.                                                                                                                                                                 | Mantido, recolhido ("Pedir orçamento só desta peça"), para a peça ter caminho de orçamento mesmo que a lista (A1) não seja aprovada.                                                                                  |
| C15 | Spec D4 fala em loader do `next/image`; o P3 decidiu `<img srcset>` nativo (`ApiImage`).                                                                                                                                              | Segue o P3.                                                                                                                                                                                                           |
| C16 | PRODUCT.md: "o logo atual permanece", mas o arquivo não foi entregue; protótipo usa o nome em texto.                                                                                                                                  | Wordmark tipográfico provisório (texto de `messages`, estilo por token). Troca pelo SVG quando chegar (P5).                                                                                                           |
| C17 | Teaser da sala na home mostra uma sala montada com peças do `data.js`.                                                                                                                                                                | Planta vazia de 5 × 4 m com grade e cotas: não inventa composição.                                                                                                                                                    |

## Mapa de arquivos (web/)

```
messages/{pt,en}.json                                   (todas as tasks)
src/
  app/
    fonts.ts                                            T1
    globals.css                                         T1 (+ imports nas T3–T12)
    [locale]/layout.tsx                                 T4
    [locale]/page.tsx                                   T11
    [locale]/products/page.tsx, products/[slug]/page.tsx       T6, T8
    [locale]/indoor/…, outdoor/… (4 páginas)            T6
    [locale]/launches/page.tsx, launches/[slug]/page.tsx       T6
    [locale]/room-planner/page.tsx                      T10
    [locale]/quote-list/page.tsx                        T12
    [locale]/contact/page.tsx                           T3 (troca de props)
  styles/
    tokens.css, base.css, components.css                T1
    forms.css T3 · chrome.css T4 · plates.css T5 · catalog.css T6 · product.css T7
    planner.css T9 · home.css T11 · quote.css T12
  components/
    ui/{Icon,AreaDot,Breadcrumbs,ToastRegion,QuantityStepper,SnapshotImage}.tsx
    layout/{SiteHeader,HeaderNav,QuoteListLink,LanguageSwitcher,SiteFooter}.tsx, nav.ts
    forms/{ContactForm,NewsletterForm}.tsx              (reescritos)
    products/{ProductPlate,QuickAddButton,ProductRail,ProductConfigurator,FinishSelector,
              DimensionsBlock,DimensionDrawing,ProductStage,ModelViewer,DownloadButton,
              ProductDownloads,DesignerStrip}.tsx
    catalog/{ProductGrid,CatalogListing,CatalogToolbar,ViewToggle,Pagination,TechTable,
             LaunchTile}.tsx, area-pages.tsx
    planner/{PlanSvg,RoomPlanner,PlannerLibrary}.tsx
    quote/QuoteListView.tsx
    home/{HeroSection,LaunchesSection,LinesSection,FeatureSection,PlannerTeaser,
          DesignersSection,FactorySection,TechnicalTeaser,StoresSection}.tsx
    stores/StoreFinder.tsx
  lib/
    api/{build-fallback,empty}.ts                       T4; catalog.ts, forms.ts, types.ts, content.ts (ajustes)
    catalog/{area,area-href,card,technical,view}.ts
    contact-links.ts                                    T2
    forms/contact.ts                                    T3
    format/{file-size}.ts; dimensions.ts (+formatCentimeters)
    planner/{types,geometry,plan,plan-store,product,query,data,actions}.ts
    product/{finish-selection,dimension-drawing,gallery}.ts
    quote/{types,list,store,hooks,message,snapshot}.ts
    settings.ts
    ui/{toast,roving,use-is-client}.ts
  test/{intl.tsx,navigation-mock.tsx,fixtures.ts}
  types/model-viewer.d.ts                               (reescrito)
```

---

### Task 1: Tokens, fonte provisória, estilos base e componentes de UI

**Files:**

- Create: `web/src/app/fonts.ts`, `web/src/styles/tokens.css`, `web/src/styles/base.css`, `web/src/styles/components.css`, `web/src/components/ui/Icon.tsx`, `web/src/components/ui/AreaDot.tsx`, `web/src/components/ui/Breadcrumbs.tsx`, `web/src/lib/catalog/area.ts`, `web/src/test/intl.tsx`, `web/src/test/navigation-mock.tsx`
- Modify: `web/src/app/globals.css` (substituir tudo), `web/src/app/[locale]/layout.tsx` (só a classe da fonte no `<html>`; o layout completo vem na Task 4), `web/src/i18n/navigation.ts` (tipo `AppHref`), `web/vitest.config.mts` (incluir `.test.tsx`), `web/messages/{pt,en}.json`, `web/CLAUDE.md`
- Test: `web/src/lib/catalog/area.test.ts`, `web/src/components/ui/Icon.test.tsx`, `web/src/components/ui/Breadcrumbs.test.tsx`

**Interfaces:**

- Consumes: `Link` de `@/i18n/navigation`; `AreaRef` de `@/lib/api/types`.
- Produces:
  - `archivo` (`next/font`, variável CSS `--font-brand`).
  - Tokens CSS (`:root`): `--stone --paper --ink --ink-muted --line --line-strong --line-field --wood --garden --alert`, `--footer-text --footer-muted --footer-rule`, `--hero-ground --portrait-ground --row-hover --status-ok-bg`, `--plan-floor --plan-grid-minor --plan-grid-major --plan-piece --plan-selected --plan-conflict`, `--font --wide --wordmark-wide --text --gutter --max --header --ease-out --t-fast --t-mid --shadow-plate`. Utilitários Tailwind `bg-stone`, `text-ink-muted`, `border-line` etc. (paleta padrão do Tailwind removida).
  - Classes: `wrap display lead meta num nowrap visually-hidden skip-link meta-inline btn btn--ghost btn--light btn--block btn--compact link-arrow section section--tight section--paper section-head chips chip tag tag--new area-dot area-dot--casa area-dot--giardini icon crumbs crumbs__list empty empty__actions field pair toast is-visible`.
  - `type IconName`; `Icon({ name: IconName; className?: string })`.
  - `AreaDot({ area: AreaRef['key'] })`.
  - `type AppHref = ComponentProps<typeof Link>['href']` (em `@/i18n/navigation`).
  - `type BreadcrumbItem = { label: string; href?: AppHref }`; `Breadcrumbs({ label: string; items: BreadcrumbItem[] })`.
  - `type AreaTone = 'casa' | 'giardini'`; `areaTone(key)`; `areaPath(key): '/indoor' | '/outdoor'`.
  - Testes: `renderWithIntl(ui, locale?)` (HTML estático com `NextIntlClientProvider`), `navigationMock` + `hrefToString(href)` para `vi.mock('@/i18n/navigation', …)`.
  - Mensagens: `common.breadcrumb`, `common.home`, `common.opensInNewWindow`.

- [ ] **Step 1: Testes que falham**

`web/vitest.config.mts` — trocar o `include` para:

```ts
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
```

`web/src/test/intl.tsx`:

```tsx
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import en from '../../messages/en.json';
import pt from '../../messages/pt.json';

/** Renderiza para HTML estático com as mensagens reais do idioma (testes de componente sem DOM). */
export function renderWithIntl(ui: ReactElement, locale: 'pt' | 'en' = 'pt'): string {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={locale === 'pt' ? pt : en} timeZone="America/Sao_Paulo">
      {ui}
    </NextIntlClientProvider>,
  );
}
```

`web/src/test/navigation-mock.tsx`:

```tsx
import type { AnchorHTMLAttributes } from 'react';

type HrefObject = {
  pathname: string;
  params?: Record<string, string | number>;
  query?: Record<string, string | number | undefined>;
};

type MockLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string | HrefObject;
  locale?: string;
};

/** Converte o href tipado do next-intl no caminho interno (sem idioma), para asserções. */
export function hrefToString(href: string | HrefObject): string {
  if (typeof href === 'string') {
    return href;
  }
  let path = href.pathname;
  for (const [key, value] of Object.entries(href.params ?? {})) {
    path = path.replace(`[${key}]`, String(value));
  }
  const query = new URLSearchParams(
    Object.entries(href.query ?? {})
      .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
      .map(([key, value]) => [key, String(value)]),
  ).toString();
  return query ? `${path}?${query}` : path;
}

function MockLink({ href, locale, children, ...rest }: MockLinkProps) {
  return (
    <a href={hrefToString(href)} data-locale={locale} {...rest}>
      {children}
    </a>
  );
}

export const navigationMock = {
  Link: MockLink,
  usePathname: () => '/',
  useRouter: () => ({ push: () => undefined, replace: () => undefined }),
  getPathname: ({ href }: { href: string | HrefObject }) => hrefToString(href),
  redirect: () => undefined,
};
```

`web/src/lib/catalog/area.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { areaPath, areaTone } from './area';

describe('area helpers', () => {
  it('maps the api area key to the brand tone', () => {
    expect(areaTone('indoor')).toBe('casa');
    expect(areaTone('outdoor')).toBe('giardini');
  });

  it('maps the api area key to the internal route', () => {
    expect(areaPath('indoor')).toBe('/indoor');
    expect(areaPath('outdoor')).toBe('/outdoor');
  });
});
```

`web/src/components/ui/Icon.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders a decorative svg with the icon class', () => {
    const html = renderToStaticMarkup(<Icon name="plus" className="extra" />);
    expect(html).toContain('class="icon extra"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('viewBox="0 0 24 24"');
  });
});
```

`web/src/components/ui/Breadcrumbs.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumbs } from './Breadcrumbs';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('Breadcrumbs', () => {
  it('links every item but the last, which is the current page', () => {
    const html = renderToStaticMarkup(
      <Breadcrumbs
        label="Você está em"
        items={[
          { label: 'Início', href: '/' },
          { label: 'Produtos', href: '/products' },
          { label: 'Cadeira Aura' },
        ]}
      />,
    );
    expect(html).toContain('aria-label="Você está em"');
    expect(html).toContain('<a href="/">Início</a>');
    expect(html).toContain('<a href="/products">Produtos</a>');
    expect(html).toContain('<span aria-current="page">Cadeira Aura</span>');
  });
});
```

Run: `pnpm --filter web test` → Expected: FAIL (módulos `./area`, `./Icon`, `./Breadcrumbs` inexistentes).

- [ ] **Step 2: Fonte e tokens**

`web/src/app/fonts.ts`:

```ts
import { Archivo } from 'next/font/google';

/**
 * Fonte provisória (stand-in) até o manual de marca (PRODUCT.md). Para trocar,
 * substitua esta chamada (ou use next/font/local) mantendo `variable: '--font-brand'`:
 * os tokens em src/styles/tokens.css só leem essa variável.
 */
export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-brand',
  display: 'swap',
});
```

`web/src/styles/tokens.css`:

```css
/*
  Tokens do design system (web/DESIGN.md). Único arquivo com valores de cor.
  Fonte, logo e imagens definitivas chegam com o manual de marca: troque aqui.
*/
:root {
  --stone: #f2f1ed;
  --paper: #ffffff;
  --ink: #171717;
  --ink-muted: #57564f;
  --line: #dcd9d1;
  --line-strong: #bdb9ae;
  /* Borda de controle com 3:1 (WCAG 1.4.11) no papel e no ink. */
  --line-field: #8a887f;
  --wood: #7b4b2a;
  --garden: #2e4a37;
  --alert: #9b2c1f;

  --footer-text: #d8d6cf;
  --footer-muted: #a6a49b;
  --footer-rule: #34342f;
  --hero-ground: #d9d3c7;
  --portrait-ground: #e4e1da;
  --row-hover: #fafaf8;
  --status-ok-bg: #f2f5f2;

  --plan-floor: #fdfcf9;
  --plan-grid-minor: #efece5;
  --plan-grid-major: #e1ddd3;
  --plan-piece: #fbfaf7;
  --plan-selected: #eef2ee;
  --plan-conflict: #f7e9e6;

  --font: var(--font-brand), 'Helvetica Neue', Arial, sans-serif;
  --wide: 118;
  --wordmark-wide: 125;
  --text: 100;

  --gutter: clamp(20px, 4vw, 56px);
  --max: 1560px;
  --header: 72px;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --t-fast: 180ms;
  --t-mid: 420ms;
  --shadow-plate: 0 18px 40px -28px rgba(23, 23, 23, 0.35);
}
```

`web/src/app/globals.css` (substitui o conteúdo do create-next-app, inclusive a fonte padrão):

```css
@import 'tailwindcss';
@import '../styles/tokens.css';
@import '../styles/base.css' layer(base);
@import '../styles/components.css' layer(components);

@theme inline {
  --color-*: initial;
  --color-stone: var(--stone);
  --color-paper: var(--paper);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-line-field: var(--line-field);
  --color-wood: var(--wood);
  --color-garden: var(--garden);
  --color-alert: var(--alert);
  --font-sans: var(--font);
  --breakpoint-*: initial;
  --breakpoint-sm: 35rem;
  --breakpoint-md: 56.25rem;
  --breakpoint-lg: 73.75rem;
  --breakpoint-xl: 75rem;
}
```

(As tasks seguintes acrescentam `@import '../styles/<arquivo>.css' layer(components);` logo abaixo do último `@import`. Se o Tailwind recusar os resets `--color-*: initial` / `--breakpoint-*: initial` dentro de `@theme inline`, mova essas duas linhas para um bloco `@theme { }` separado antes do `@theme inline`.)

- [ ] **Step 3: `base.css` e `components.css`**

`web/src/styles/base.css`:

```css
/* Base: reset, tipografia e utilitários. Portado de design/prototype/assets/styles.css (início e "tipografia"). */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--stone);
  color: var(--ink);
  font-family: var(--font);
  font-size: 16px;
  line-height: 1.6;
  font-variation-settings: 'wdth' var(--text);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

a {
  color: inherit;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.25em;
}

button,
input,
select,
textarea {
  font: inherit;
  color: inherit;
}

:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}

.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.skip-link {
  position: absolute;
  left: var(--gutter);
  top: 8px;
  z-index: 100;
  background: var(--ink);
  color: var(--paper);
  padding: 10px 16px;
  transform: translateY(-200%);
}

.skip-link:focus {
  transform: none;
}

.wrap {
  width: 100%;
  max-width: var(--max);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

.display,
h1,
h2,
h3 {
  margin: 0;
  font-weight: 400;
  font-variation-settings: 'wdth' var(--wide);
  letter-spacing: -0.015em;
  text-wrap: balance;
}

.display {
  font-size: clamp(2.5rem, 5.2vw, 4.9rem);
  line-height: 1.02;
  letter-spacing: -0.025em;
}

h1 {
  font-size: clamp(2.1rem, 3.6vw, 3.4rem);
  line-height: 1.05;
}

h2 {
  font-size: clamp(1.55rem, 2.4vw, 2.35rem);
  line-height: 1.1;
}

h3 {
  font-size: 1.125rem;
  line-height: 1.3;
  font-weight: 500;
  letter-spacing: -0.005em;
  font-variation-settings: 'wdth' var(--text);
}

p {
  margin: 0;
  max-width: 68ch;
}

.lead {
  font-size: clamp(1.05rem, 1.25vw, 1.2rem);
  line-height: 1.55;
  color: var(--ink-muted);
}

.meta {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--ink-muted);
  font-weight: 500;
}

.num {
  font-variant-numeric: tabular-nums lining-nums;
}

.nowrap {
  white-space: nowrap;
}

.meta-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  list-style: none;
  margin: 0;
  padding: 0;
}

.meta-inline > * + *::before {
  content: '·';
  margin-inline: 6px;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    transition-duration: 1ms !important;
    animation-duration: 1ms !important;
  }
}
```

`web/src/styles/components.css` — portar **literalmente** de `design/prototype/assets/styles.css` os blocos abaixo, na ordem, e depois aplicar as edições:

| Bloco no protótipo (comentário `/* ---------- … ---------- */`, linhas aproximadas) | Seletores                                                      |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `header`, só a regra `.icon` (272–281)                                              | `.icon`                                                        |
| `buttons` (331–409)                                                                 | `.btn*`, `.link-arrow*`                                        |
| `sections` (411–439)                                                                | `.section*`, `.section-head*`                                  |
| `product plates`, só `.tag*` e `.area-dot*` (585–598, 633–648)                      | `.tag`, `.tag--new`, `.area-dot*`                              |
| `areas`, só `.chips` e `.chip*` (689–713)                                           | `.chips`, `.chip`, `.chip:hover`, `.chip[aria-pressed='true']` |
| `breadcrumb` (1015–1032)                                                            | `.crumbs*`                                                     |
| `catalog`, só `.empty` (1444–1451)                                                  | `.empty`                                                       |
| `planner`, só `.field*` e `.pair` (1474–1520)                                       | `.field*`, `.pair`                                             |
| `misc`, só `.toast*` (1783–1810)                                                    | `.toast*`                                                      |
| `@media (max-width: 640px)`, só `.section-head` e `.btn` (1821–1830)                | idem                                                           |

Edições obrigatórias no que foi portado:

1. Todo `var(--ink-2)` vira `var(--ink-muted)`; `var(--ok)` vira `var(--garden)`. O `background: #000` do `.btn:hover` fica (é o hover do botão primário no DESIGN.md).
2. `.field input, .field select, .field textarea`: `border: 1px solid var(--line-field)` (C6).
3. `.chip`: acrescentar `.chip[aria-current='true']` ao seletor de `.chip[aria-pressed='true']`.
4. `.crumbs`: remover `display`, `gap` e `flex-wrap` da regra `.crumbs` e acrescentar:

```css
.crumbs__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.crumbs__list li + li::before {
  content: '/';
  margin-right: 8px;
  color: var(--ink-muted);
}
```

5. Acrescentar ao fim:

```css
.btn--compact {
  min-height: 38px;
  padding: 0 12px;
}

.empty__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
```

Run: `grep -nE "#[0-9a-fA-F]{3,6}\b" web/src/styles/components.css` → Expected: só `#000` (hover do botão primário). `grep -n "ink-2\|ink-3\|--ok" web/src/styles/*.css` → Expected: vazio.

- [ ] **Step 4: Componentes e helpers**

`web/src/i18n/navigation.ts` — acrescentar:

```ts
import type { ComponentProps } from 'react';

/** Href aceito pelo `Link` tipado (rota interna ou `{ pathname, params?, query? }`). */
export type AppHref = ComponentProps<typeof Link>['href'];
```

`web/src/lib/catalog/area.ts`:

```ts
import type { AreaRef } from '@/lib/api/types';

/** Identidade visual da área: madeira para Casa (indoor), verde para Giardini (outdoor). */
export type AreaTone = 'casa' | 'giardini';

export function areaTone(key: AreaRef['key']): AreaTone {
  return key === 'outdoor' ? 'giardini' : 'casa';
}

export function areaPath(key: AreaRef['key']): '/indoor' | '/outdoor' {
  return key === 'outdoor' ? '/outdoor' : '/indoor';
}
```

`web/src/components/ui/Icon.tsx` (traços do protótipo, `app.js`, objeto `paths`):

```tsx
import type { ReactNode } from 'react';

const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  list: (
    <>
      <path d="M9 5h11M9 12h11M9 19h11" />
      <path d="M4 5h.01M4 12h.01M4 19h.01" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chat: <path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.5Z" />,
  pin: (
    <>
      <path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  download: <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />,
  cube: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
  photo: (
    <>
      <rect x="3.5" y="5" width="17" height="14" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m20.5 16-5-5-8 8" />
    </>
  ),
  rotate: (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 4v5h-5" />
    </>
  ),
  trash: <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />,
  table: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" />
      <path d="M3.5 9.5h17M3.5 14.5h17M9.5 9.5v10" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </>
  ),
  ruler: (
    <>
      <path d="M3 17 17 3l4 4L7 21Z" />
      <path d="m7 13 2 2M10 10l2 2M13 7l2 2" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

/** Ícone de traço único (1,5), sempre decorativo: o rótulo acessível fica no controle. */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
```

`web/src/components/ui/AreaDot.tsx`:

```tsx
import type { AreaRef } from '@/lib/api/types';
import { areaTone } from '@/lib/catalog/area';

export function AreaDot({ area }: { area: AreaRef['key'] }) {
  return <span className={`area-dot area-dot--${areaTone(area)}`} aria-hidden="true" />;
}
```

`web/src/components/ui/Breadcrumbs.tsx`:

```tsx
import { Link, type AppHref } from '@/i18n/navigation';

export type BreadcrumbItem = { label: string; href?: AppHref };

export function Breadcrumbs({ label, items }: { label: string; items: BreadcrumbItem[] }) {
  return (
    <nav className="crumbs" aria-label={label}>
      <ol className="crumbs__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${index}-${item.label}`}>
              {item.href && !last ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

`web/src/app/[locale]/layout.tsx` — importar `import { archivo } from '@/app/fonts';` e trocar `<html lang={…}>` por `<html lang={…} className={archivo.variable}>` (o resto do layout do P3 fica até a Task 4).

- [ ] **Step 5: Mensagens e `web/CLAUDE.md`**

`messages/pt.json`, dentro de `common`:

```json
"breadcrumb": "Você está em",
"home": "Início",
"opensInNewWindow": "(abre em nova janela)"
```

`messages/en.json`, dentro de `common`:

```json
"breadcrumb": "You are here",
"home": "Home",
"opensInNewWindow": "(opens in a new window)"
```

`web/CLAUDE.md` — substituir a regra "Nada de design elaborado neste plano…" por:

```markdown
- Design system: `DESIGN.md` (nesta pasta). Valores só por token (`src/styles/tokens.css`; hex só
  ali); utilitários Tailwind usam os tokens (`bg-stone`, `text-ink-muted`…), a paleta padrão do
  Tailwind está desligada. Classes de componente por área em `src/styles/*.css`, portadas do
  protótipo aprovado (`design/prototype/`).
- Cantos retos, sem sombra em repouso (só no hover do card de produto), madeira = Casa,
  verde = Giardini/sucesso, metadado nunca acima do título.
- Fonte provisória em `src/app/fonts.ts` (troca pelo manual de marca só ali).
- Lógica de estado (lista de orçamento, planta, acabamentos) em módulos puros de `src/lib/*`
  com testes; componentes só ligam estado a markup.
- Nunca inventar preço, prazo, contagem ou especificação: sem dado da API, a seção some.
```

- [ ] **Step 6: Rodar e commitar**

Run: `pnpm --filter web test` → Expected: PASS nos três testes novos e nos do P3.
Run: `pnpm --filter web lint && pnpm --filter web typecheck && ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` → Expected: verde. Com `pnpm --filter web dev`, `/pt` aparece em fundo pedra e texto em Archivo.

```bash
git add web
git commit -m "feat(web): adiciona tokens do design system, fonte provisoria e componentes base

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 2: Lista de orçamento no navegador (lógica pura)

**Files:**

- Create: `web/src/lib/quote/{types,list,store,hooks,message,snapshot}.ts`, `web/src/lib/contact-links.ts`, `web/src/lib/ui/toast.ts`, `web/src/lib/ui/use-is-client.ts`, `web/src/test/fixtures.ts`
- Modify: `web/src/lib/api/forms.ts` (tipo `ContactItem` e `items` em `ContactPayload`)
- Test: `web/src/lib/quote/{list,store,message,snapshot}.test.ts`, `web/src/lib/contact-links.test.ts`, `web/src/lib/ui/toast.test.ts`

**Interfaces:**

- Consumes: `pickSource(image, width)`; tipos `Image`, `ProductCard`, `ProductDetail`; `Locale`.
- Produces:
  - `forms.ts`: `type ContactItem = { product_id: number; quantity: number; finish_ids?: number[]; note?: string }`; `ContactPayload.items?: ContactItem[]`.
  - `quote/types.ts`: `QUOTE_STORAGE_KEY = 'franccino.quote.v1'`, `MAX_QUOTE_ITEMS = 50`, `MAX_QUANTITY = 99`, `MAX_FINISHES = 10`, `MAX_NOTE_LENGTH = 500`, `MAX_MESSAGE_LENGTH = 5000`; `QuoteFinish = { id: number; group: string; name: string; code: string | null }`; `QuoteImage = { src: string; alt: string }`; `QuoteItem = { productId; slug; locale; name; image: QuoteImage | null; finishes: QuoteFinish[]; quantity; note }`; `QuoteItemInput = Omit<QuoteItem, 'quantity' | 'note'> & { quantity?: number; note?: string }`.
  - `quote/list.ts`: `quoteItemKey(item): string`, `clampQuantity(n): number`, `type AddStatus = 'added' | 'merged' | 'full'`, `addItem(items, input): { items: QuoteItem[]; status: AddStatus }`, `setItemQuantity(items, key, quantity)`, `removeItem(items, key)`, `totalQuantity(items)`, `parseStoredItems(raw: string | null): QuoteItem[]`.
  - `quote/store.ts` (navegador): `getQuoteItems()`, `getServerQuoteItems()`, `subscribeQuote(listener): () => void`, `quoteActions.{ add(input): AddStatus; setQuantity(key, quantity): void; remove(key): QuoteItem | null; clear(): void }`, `resetQuoteStoreForTests()`.
  - `quote/hooks.ts`: `useQuoteItems(): QuoteItem[]`, `useQuoteCount(): number`.
  - `quote/message.ts`: `formatFinishes(finishes, pendingLabel)`, `quoteLine(item, pendingLabel)`, `buildWhatsAppText(items, intro, pendingLabel)`, `buildQuoteMessage(items, typed, heading, pendingLabel)`, `toContactItems(items): ContactItem[]`.
  - `quote/snapshot.ts`: `SNAPSHOT_IMAGE_WIDTH = 480`, `toQuoteSnapshot(product: ProductCard, locale, finishes?): QuoteItemInput`.
  - `contact-links.ts`: `whatsappUrl(phone, text?): string | null`, `telHref(phone): string`.
  - `ui/toast.ts`: `type ToastData = { id: number; text: string; quoteLink: boolean }`, `showToast({ text, quoteLink? })`, `onToast(listener): () => void`.
  - `ui/use-is-client.ts`: `useIsClient(): boolean` (`false` no servidor e na hidratação).
  - `test/fixtures.ts`: `image(overrides?)`, `productCard(overrides?)`, `productDetail(overrides?)`.

- [ ] **Step 1: Fixtures e testes que falham**

`web/src/test/fixtures.ts`:

```ts
import type { Image, ProductCard, ProductDetail } from '@/lib/api/types';

export function image(overrides: Partial<Image> = {}): Image {
  return {
    id: 1,
    alt: 'Cadeira Aura em fundo branco',
    width: 1600,
    height: 1200,
    src: 'https://cdn.test/aura-1600.webp',
    srcset: [
      { width: 480, url: 'https://cdn.test/aura-480.webp' },
      { width: 960, url: 'https://cdn.test/aura-960.webp' },
      { width: 1600, url: 'https://cdn.test/aura-1600.webp' },
    ],
    blur_data_url: null,
    ...overrides,
  };
}

export function productCard(overrides: Partial<ProductCard> = {}): ProductCard {
  return {
    id: 12,
    slug: 'cadeira-aura',
    name: 'Cadeira Aura',
    area: { key: 'indoor', name: 'Indoor', brand_name: 'Franccino Casa' },
    category: { id: 3, slug: 'cadeiras', name: 'Cadeiras', singular_name: 'Cadeira' },
    designer: { id: 5, slug: 'daniela-ferro', name: 'Daniela Ferro' },
    cover: image(),
    is_new: true,
    ...overrides,
  };
}

export function productDetail(overrides: Partial<ProductDetail> = {}): ProductDetail {
  return {
    ...productCard(),
    slugs: { pt: 'cadeira-aura', en: 'aura-chair' },
    sku: 'CA-01',
    tagline: null,
    description: null,
    line: null,
    collections: [],
    dimensions: [{ label: null, width: 520, depth: 560, height: 800, seat_height: 460, diameter: null }],
    materials: null,
    finishes_note: null,
    finishes: [
      {
        group: 'Madeira',
        items: [
          { id: 101, name: 'Nogueira', code: 'MD-05', swatch: null },
          { id: 102, name: 'Freijó', code: 'MD-02', swatch: null },
        ],
      },
      { group: 'Tecido', items: [{ id: 201, name: 'Linho cru', code: 'TC-110', swatch: null }] },
    ],
    gallery: [],
    model_3d: null,
    files: [],
    line_products: [],
    related: [],
    seo: { title: null, description: null, image: null },
    locale_fallback: false,
    ...overrides,
  };
}
```

`web/src/lib/quote/list.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  addItem,
  clampQuantity,
  parseStoredItems,
  quoteItemKey,
  removeItem,
  setItemQuantity,
  totalQuantity,
} from './list';
import type { QuoteItem, QuoteItemInput } from './types';

const nogueira = { id: 101, group: 'Madeira', name: 'Nogueira', code: 'MD-05' };
const linho = { id: 201, group: 'Tecido', name: 'Linho cru', code: 'TC-110' };

const input = (overrides: Partial<QuoteItemInput> = {}): QuoteItemInput => ({
  productId: 12,
  slug: 'cadeira-aura',
  locale: 'pt',
  name: 'Cadeira Aura',
  image: null,
  finishes: [nogueira, linho],
  ...overrides,
});

describe('quote list', () => {
  it('adds a new item with quantity 1 and an empty note', () => {
    const { items, status } = addItem([], input());
    expect(status).toBe('added');
    expect(items).toEqual([{ ...input(), quantity: 1, note: '' }]);
  });

  it('merges the same product and finishes regardless of finish order', () => {
    const first = addItem([], input({ quantity: 2, note: 'Sala 5 × 4 m' })).items;
    const { items, status } = addItem(first, input({ finishes: [linho, nogueira], quantity: 3 }));
    expect(status).toBe('merged');
    expect(items).toHaveLength(1);
    expect(items[0]!.quantity).toBe(5);
    expect(items[0]!.note).toBe('Sala 5 × 4 m');
  });

  it('replaces the note when a new one is given and caps the merged quantity', () => {
    const first = addItem([], input({ quantity: 98 })).items;
    const { items } = addItem(first, input({ quantity: 5, note: 'Varanda' }));
    expect(items[0]!.quantity).toBe(99);
    expect(items[0]!.note).toBe('Varanda');
  });

  it('keeps different finishes as separate items', () => {
    const first = addItem([], input()).items;
    const { items } = addItem(first, input({ finishes: [] }));
    expect(items).toHaveLength(2);
  });

  it('refuses the 51st item', () => {
    const full: QuoteItem[] = Array.from({ length: 50 }, (_, index) => ({
      ...input({ productId: index + 1 }),
      quantity: 1,
      note: '',
    }));
    const { items, status } = addItem(full, input({ productId: 999 }));
    expect(status).toBe('full');
    expect(items).toBe(full);
  });

  it('clamps quantities to 1..99 integers', () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(150)).toBe(99);
    expect(clampQuantity(2.7)).toBe(2);
    expect(clampQuantity(Number.NaN)).toBe(1);
  });

  it('updates, removes and totals by key', () => {
    const items = addItem(addItem([], input()).items, input({ productId: 13, finishes: [] })).items;
    const key = quoteItemKey(items[0]!);
    expect(key).toBe('12:101,201');
    expect(setItemQuantity(items, key, 4)[0]!.quantity).toBe(4);
    expect(removeItem(items, key)).toHaveLength(1);
    expect(totalQuantity(setItemQuantity(items, key, 4))).toBe(5);
  });

  it('parses stored items and drops anything invalid', () => {
    const valid = { ...input(), quantity: 2, note: '' };
    const raw = JSON.stringify([valid, { slug: 'cadeira-aura', finishes: { madeira: 'nogueira' }, qty: 6 }]);
    expect(parseStoredItems(raw)).toEqual([valid]);
    expect(parseStoredItems('not json')).toEqual([]);
    expect(parseStoredItems(null)).toEqual([]);
    expect(parseStoredItems('{"a":1}')).toEqual([]);
  });
});
```

`web/src/lib/quote/store.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getQuoteItems, quoteActions, resetQuoteStoreForTests, subscribeQuote } from './store';
import { QUOTE_STORAGE_KEY } from './types';

class MemoryStorage {
  private readonly map = new Map<string, string>();
  constructor(private readonly failOnWrite = false) {}
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failOnWrite) {
      throw new Error('QuotaExceededError');
    }
    this.map.set(key, value);
  }
}

function installWindow(storage: MemoryStorage) {
  const target = new EventTarget();
  vi.stubGlobal('window', Object.assign(target, { localStorage: storage }));
  return target;
}

const aura = {
  productId: 12,
  slug: 'cadeira-aura',
  locale: 'pt' as const,
  name: 'Cadeira Aura',
  image: null,
  finishes: [],
};

describe('quote store', () => {
  beforeEach(() => resetQuoteStoreForTests());
  afterEach(() => vi.unstubAllGlobals());

  it('persists to localStorage and notifies subscribers', () => {
    const storage = new MemoryStorage();
    installWindow(storage);
    const listener = vi.fn();
    const unsubscribe = subscribeQuote(listener);

    expect(quoteActions.add(aura)).toBe('added');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storage.getItem(QUOTE_STORAGE_KEY)!)).toHaveLength(1);

    unsubscribe();
    quoteActions.clear();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('returns the same array while storage is unchanged', () => {
    installWindow(new MemoryStorage());
    quoteActions.add(aura);
    expect(getQuoteItems()).toBe(getQuoteItems());
  });

  it('falls back to memory when storage refuses writes', () => {
    installWindow(new MemoryStorage(true));
    quoteActions.add(aura);
    expect(getQuoteItems()).toHaveLength(1);
  });

  it('reacts to storage events from other tabs', () => {
    const target = installWindow(new MemoryStorage());
    const listener = vi.fn();
    subscribeQuote(listener);
    target.dispatchEvent(Object.assign(new Event('storage'), { key: QUOTE_STORAGE_KEY }));
    target.dispatchEvent(Object.assign(new Event('storage'), { key: 'other' }));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('removes by key and returns the removed item', () => {
    installWindow(new MemoryStorage());
    quoteActions.add(aura);
    expect(quoteActions.remove('12:')?.name).toBe('Cadeira Aura');
    expect(getQuoteItems()).toEqual([]);
    expect(quoteActions.remove('12:')).toBeNull();
  });
});
```

`web/src/lib/quote/message.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildQuoteMessage, buildWhatsAppText, formatFinishes, quoteLine, toContactItems } from './message';
import type { QuoteItem } from './types';

const item = (overrides: Partial<QuoteItem> = {}): QuoteItem => ({
  productId: 12,
  slug: 'cadeira-aura',
  locale: 'pt',
  name: 'Cadeira Aura',
  image: null,
  finishes: [
    { id: 101, group: 'Madeira', name: 'Nogueira', code: 'MD-05' },
    { id: 201, group: 'Tecido', name: 'Linho cru', code: null },
  ],
  quantity: 6,
  note: '',
  ...overrides,
});

describe('quote messages', () => {
  it('formats finishes with codes, or the pending label', () => {
    expect(formatFinishes(item().finishes, 'a definir')).toBe('Nogueira (MD-05) · Linho cru');
    expect(formatFinishes([], 'a definir')).toBe('a definir');
  });

  it('builds one line per item with the note', () => {
    expect(quoteLine(item({ note: 'Sala 5,0 × 4,0 m' }), 'a definir')).toBe(
      '6 × Cadeira Aura (Nogueira (MD-05) · Linho cru) — Sala 5,0 × 4,0 m',
    );
  });

  it('builds the whatsapp text with an intro and bullets', () => {
    const items = [item(), item({ name: 'Sofá Majestic', quantity: 1, finishes: [] })];
    expect(buildWhatsAppText(items, 'Olá!', 'a definir')).toBe(
      'Olá!\n• 6 × Cadeira Aura (Nogueira (MD-05) · Linho cru)\n• 1 × Sofá Majestic (a definir)',
    );
  });

  it('puts the typed notes before the list and caps the size', () => {
    expect(buildQuoteMessage([item()], '  Entrega em BH  ', 'Peças:', 'a definir')).toBe(
      'Entrega em BH\n\nPeças:\n• 6 × Cadeira Aura (Nogueira (MD-05) · Linho cru)',
    );
    expect(buildQuoteMessage([item()], '', 'Peças:', 'a definir')).toBe(
      'Peças:\n• 6 × Cadeira Aura (Nogueira (MD-05) · Linho cru)',
    );
    expect(buildQuoteMessage([item()], 'x'.repeat(6000), 'Peças:', 'a definir')).toHaveLength(5000);
  });

  it('maps items to the contact payload', () => {
    expect(
      toContactItems([item({ note: 'Varanda' }), item({ productId: 13, finishes: [], quantity: 1 })]),
    ).toEqual([
      { product_id: 12, quantity: 6, finish_ids: [101, 201], note: 'Varanda' },
      { product_id: 13, quantity: 1 },
    ]);
  });
});
```

`web/src/lib/quote/snapshot.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { productCard } from '@/test/fixtures';
import { toQuoteSnapshot } from './snapshot';

describe('toQuoteSnapshot', () => {
  it('keeps what the list needs to render without the api', () => {
    const finish = { id: 101, group: 'Madeira', name: 'Nogueira', code: 'MD-05' };
    expect(toQuoteSnapshot(productCard(), 'en', [finish])).toEqual({
      productId: 12,
      slug: 'cadeira-aura',
      locale: 'en',
      name: 'Cadeira Aura',
      image: { src: 'https://cdn.test/aura-480.webp', alt: 'Cadeira Aura em fundo branco' },
      finishes: [finish],
    });
  });

  it('handles products without a cover', () => {
    expect(toQuoteSnapshot(productCard({ cover: null }), 'pt').image).toBeNull();
  });
});
```

`web/src/lib/contact-links.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { telHref, whatsappUrl } from './contact-links';

describe('contact links', () => {
  it('builds wa.me links with digits only and encoded text', () => {
    expect(whatsappUrl('5511942900080')).toBe('https://wa.me/5511942900080');
    expect(whatsappUrl('+55 (11) 94290-0080', 'Olá! 2 × Aura')).toBe(
      'https://wa.me/5511942900080?text=Ol%C3%A1!%202%20%C3%97%20Aura',
    );
    expect(whatsappUrl(null)).toBeNull();
    expect(whatsappUrl('')).toBeNull();
  });

  it('builds tel links with the Brazilian prefix when missing', () => {
    expect(telHref('(37) 3381-4204')).toBe('tel:+553733814204');
    expect(telHref('(11) 98604-5126')).toBe('tel:+5511986045126');
    expect(telHref('+1 212 555 0100')).toBe('tel:+12125550100');
  });
});
```

`web/src/lib/ui/toast.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { onToast, showToast } from './toast';

describe('toast bus', () => {
  it('delivers toasts to listeners until they unsubscribe', () => {
    const listener = vi.fn();
    const off = onToast(listener);
    showToast({ text: 'Na lista', quoteLink: true });
    off();
    showToast({ text: 'Ignorado' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]![0]).toMatchObject({ text: 'Na lista', quoteLink: true });
  });
});
```

Run: `pnpm --filter web test` → Expected: FAIL (módulos inexistentes).

- [ ] **Step 2: Implementação**

`web/src/lib/api/forms.ts` — acrescentar antes de `ContactPayload`:

```ts
/** Item da lista de orçamento (`docs/api.md`, POST /contact, `items`: até 50). */
export type ContactItem = {
  product_id: number;
  /** 1–99. */
  quantity: number;
  /** Ids de acabamentos existentes, até 10. */
  finish_ids?: number[];
  /** Até 500 caracteres. */
  note?: string;
};
```

e, dentro de `ContactPayload`, logo depois de `product_id?: number;`:

```ts
  items?: ContactItem[];
```

`web/src/lib/quote/types.ts`:

```ts
import type { Locale } from '@/i18n/config';

export const QUOTE_STORAGE_KEY = 'franccino.quote.v1';
/** Limites do contrato (`POST /contact`, `items`). */
export const MAX_QUOTE_ITEMS = 50;
export const MAX_QUANTITY = 99;
export const MAX_FINISHES = 10;
export const MAX_NOTE_LENGTH = 500;
export const MAX_MESSAGE_LENGTH = 5000;

export type QuoteFinish = { id: number; group: string; name: string; code: string | null };
export type QuoteImage = { src: string; alt: string };

/**
 * Item salvo no navegador: um retrato da peça no momento em que entrou na lista, para a
 * página da lista renderizar sem chamar a API. `locale` é o idioma do slug e do nome.
 */
export type QuoteItem = {
  productId: number;
  slug: string;
  locale: Locale;
  name: string;
  image: QuoteImage | null;
  finishes: QuoteFinish[];
  quantity: number;
  note: string;
};

export type QuoteItemInput = Omit<QuoteItem, 'quantity' | 'note'> & { quantity?: number; note?: string };
```

`web/src/lib/quote/list.ts`:

```ts
import { z } from 'zod';
import {
  MAX_FINISHES,
  MAX_NOTE_LENGTH,
  MAX_QUANTITY,
  MAX_QUOTE_ITEMS,
  type QuoteItem,
  type QuoteItemInput,
} from './types';

export type AddStatus = 'added' | 'merged' | 'full';
export type AddResult = { items: QuoteItem[]; status: AddStatus };

/** Mesma peça com os mesmos acabamentos (em qualquer ordem) é o mesmo item. */
export function quoteItemKey(item: Pick<QuoteItem, 'productId' | 'finishes'>): string {
  const ids = item.finishes.map((finish) => finish.id).sort((a, b) => a - b);
  return `${item.productId}:${ids.join(',')}`;
}

export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(value)));
}

export function addItem(items: QuoteItem[], input: QuoteItemInput): AddResult {
  const finishes = input.finishes.slice(0, MAX_FINISHES);
  const quantity = clampQuantity(input.quantity ?? 1);
  const note = (input.note ?? '').trim().slice(0, MAX_NOTE_LENGTH);
  const key = quoteItemKey({ productId: input.productId, finishes });
  const index = items.findIndex((item) => quoteItemKey(item) === key);

  if (index >= 0) {
    return {
      status: 'merged',
      items: items.map((item, i) =>
        i === index
          ? { ...item, quantity: clampQuantity(item.quantity + quantity), note: note || item.note }
          : item,
      ),
    };
  }

  if (items.length >= MAX_QUOTE_ITEMS) {
    return { items, status: 'full' };
  }

  const added: QuoteItem = {
    productId: input.productId,
    slug: input.slug,
    locale: input.locale,
    name: input.name,
    image: input.image,
    finishes,
    quantity,
    note,
  };
  return { status: 'added', items: [...items, added] };
}

export function setItemQuantity(items: QuoteItem[], key: string, quantity: number): QuoteItem[] {
  return items.map((item) =>
    quoteItemKey(item) === key ? { ...item, quantity: clampQuantity(quantity) } : item,
  );
}

export function removeItem(items: QuoteItem[], key: string): QuoteItem[] {
  return items.filter((item) => quoteItemKey(item) !== key);
}

export function totalQuantity(items: QuoteItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

const itemSchema = z.object({
  productId: z.number().int().positive(),
  slug: z.string().min(1),
  locale: z.enum(['pt', 'en']),
  name: z.string().min(1),
  image: z.object({ src: z.string(), alt: z.string() }).nullable(),
  finishes: z
    .array(
      z.object({ id: z.number().int(), group: z.string(), name: z.string(), code: z.string().nullable() }),
    )
    .max(MAX_FINISHES),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
  note: z.string().max(MAX_NOTE_LENGTH),
});

/** Lê o que está salvo, descartando entradas inválidas (inclusive o formato do protótipo). */
export function parseStoredItems(raw: string | null): QuoteItem[] {
  if (!raw) {
    return [];
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) {
    return [];
  }
  const items: QuoteItem[] = [];
  for (const entry of data) {
    const parsed = itemSchema.safeParse(entry);
    if (parsed.success) {
      items.push(parsed.data);
    }
  }
  return items.slice(0, MAX_QUOTE_ITEMS);
}
```

`web/src/lib/quote/store.ts`:

```ts
/**
 * Loja externa da lista de orçamento (localStorage), no formato que o
 * `useSyncExternalStore` espera. Só roda no navegador.
 */
import { addItem, parseStoredItems, quoteItemKey, removeItem, setItemQuantity, type AddStatus } from './list';
import { QUOTE_STORAGE_KEY, type QuoteItem, type QuoteItemInput } from './types';

const CHANGE_EVENT = 'franccino:quote-change';
const EMPTY: QuoteItem[] = [];

/** Definido quando o localStorage falha (navegação privada, cota cheia): a lista vive só na página. */
let memoryRaw: string | null | undefined;
let cachedRaw: string | null | undefined;
let cachedItems: QuoteItem[] = EMPTY;

function readRaw(): string | null {
  if (memoryRaw !== undefined) {
    return memoryRaw;
  }
  try {
    return window.localStorage.getItem(QUOTE_STORAGE_KEY);
  } catch {
    memoryRaw = null;
    return null;
  }
}

function writeItems(items: QuoteItem[]): void {
  const raw = JSON.stringify(items);
  if (memoryRaw === undefined) {
    try {
      window.localStorage.setItem(QUOTE_STORAGE_KEY, raw);
    } catch {
      memoryRaw = raw;
    }
  } else {
    memoryRaw = raw;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Snapshot estável: mesma referência enquanto o texto salvo não muda. */
export function getQuoteItems(): QuoteItem[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parseStoredItems(raw);
  }
  return cachedItems;
}

export function getServerQuoteItems(): QuoteItem[] {
  return EMPTY;
}

export function subscribeQuote(listener: () => void): () => void {
  const onStorage = (event: Event) => {
    const key = (event as StorageEvent).key;
    if (key === null || key === undefined || key === QUOTE_STORAGE_KEY) {
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

export const quoteActions = {
  add(input: QuoteItemInput): AddStatus {
    const result = addItem(getQuoteItems(), input);
    if (result.status !== 'full') {
      writeItems(result.items);
    }
    return result.status;
  },
  setQuantity(key: string, quantity: number): void {
    writeItems(setItemQuantity(getQuoteItems(), key, quantity));
  },
  remove(key: string): QuoteItem | null {
    const items = getQuoteItems();
    const removed = items.find((item) => quoteItemKey(item) === key) ?? null;
    if (removed) {
      writeItems(removeItem(items, key));
    }
    return removed;
  },
  clear(): void {
    writeItems([]);
  },
};

/** Só para testes: zera o estado do módulo. */
export function resetQuoteStoreForTests(): void {
  memoryRaw = undefined;
  cachedRaw = undefined;
  cachedItems = EMPTY;
}
```

`web/src/lib/quote/hooks.ts`:

```ts
import { useSyncExternalStore } from 'react';
import { totalQuantity } from './list';
import { getQuoteItems, getServerQuoteItems, subscribeQuote } from './store';
import type { QuoteItem } from './types';

/** Itens da lista; vazio no servidor e na hidratação (use `useIsClient` para não piscar o vazio). */
export function useQuoteItems(): QuoteItem[] {
  return useSyncExternalStore(subscribeQuote, getQuoteItems, getServerQuoteItems);
}

export function useQuoteCount(): number {
  return totalQuantity(useQuoteItems());
}
```

`web/src/lib/ui/use-is-client.ts`:

```ts
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** `false` no servidor e durante a hidratação; `true` depois, sem efeito nem re-render extra. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
```

`web/src/lib/quote/message.ts`:

```ts
import type { ContactItem } from '@/lib/api/forms';
import { MAX_MESSAGE_LENGTH, type QuoteFinish, type QuoteItem } from './types';

export function formatFinishes(finishes: QuoteFinish[], pendingLabel: string): string {
  if (finishes.length === 0) {
    return pendingLabel;
  }
  return finishes
    .map((finish) => (finish.code ? `${finish.name} (${finish.code})` : finish.name))
    .join(' · ');
}

export function quoteLine(item: QuoteItem, pendingLabel: string): string {
  const line = `${item.quantity} × ${item.name} (${formatFinishes(item.finishes, pendingLabel)})`;
  return item.note ? `${line} — ${item.note}` : line;
}

export function buildWhatsAppText(items: QuoteItem[], intro: string, pendingLabel: string): string {
  return [intro, ...items.map((item) => `• ${quoteLine(item, pendingLabel)}`)].join('\n');
}

/** `message` do contato (obrigatório na API): observações digitadas + a lista legível no e-mail. */
export function buildQuoteMessage(
  items: QuoteItem[],
  typed: string,
  heading: string,
  pendingLabel: string,
): string {
  const list = [heading, ...items.map((item) => `• ${quoteLine(item, pendingLabel)}`)].join('\n');
  const notes = typed.trim();
  const text = notes ? `${notes}\n\n${list}` : list;
  return text.length > MAX_MESSAGE_LENGTH ? `${text.slice(0, MAX_MESSAGE_LENGTH - 1)}…` : text;
}

export function toContactItems(items: QuoteItem[]): ContactItem[] {
  return items.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
    ...(item.finishes.length > 0 ? { finish_ids: item.finishes.map((finish) => finish.id) } : {}),
    ...(item.note ? { note: item.note } : {}),
  }));
}
```

`web/src/lib/quote/snapshot.ts`:

```ts
import type { Locale } from '@/i18n/config';
import type { ProductCard } from '@/lib/api/types';
import { pickSource } from '@/lib/images/srcset';
import type { QuoteFinish, QuoteItemInput } from './types';

/** Largura da conversão guardada para miniaturas da lista e da sala. */
export const SNAPSHOT_IMAGE_WIDTH = 480;

export function toQuoteSnapshot(
  product: ProductCard,
  locale: Locale,
  finishes: QuoteFinish[] = [],
): QuoteItemInput {
  return {
    productId: product.id,
    slug: product.slug,
    locale,
    name: product.name,
    image: product.cover
      ? { src: pickSource(product.cover, SNAPSHOT_IMAGE_WIDTH), alt: product.cover.alt }
      : null,
    finishes,
  };
}
```

`web/src/lib/contact-links.ts`:

```ts
/** Link do WhatsApp (wa.me) com texto opcional; `null` quando não há número. */
export function whatsappUrl(phone: string | null | undefined, text?: string): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (!digits) {
    return null;
  }
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}

/** `tel:` em formato internacional; números brasileiros sem DDI ganham +55. */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.trim().startsWith('+')) {
    return `tel:+${digits}`;
  }
  if (digits.length === 10 || digits.length === 11) {
    return `tel:+55${digits}`;
  }
  return `tel:${digits}`;
}
```

`web/src/lib/ui/toast.ts`:

```ts
export type ToastData = { id: number; text: string; quoteLink: boolean };
type Listener = (toast: ToastData) => void;

const listeners = new Set<Listener>();
let nextId = 1;

/** Aviso curto e não bloqueante (região `role="status"` montada no layout, Task 4). */
export function showToast(input: { text: string; quoteLink?: boolean }): void {
  const toast: ToastData = { id: nextId++, text: input.text, quoteLink: input.quoteLink ?? false };
  listeners.forEach((listener) => listener(toast));
}

export function onToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
```

- [ ] **Step 3: Rodar e commitar**

Run: `pnpm --filter web test` → Expected: PASS.
Run: `pnpm --filter web lint && pnpm --filter web typecheck && ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` → Expected: verde.

```bash
git add web
git commit -m "feat(web): adiciona lista de orcamento no navegador, links de contato e avisos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 3: Formulários no design system (contato com `items`, newsletter)

**Files:**

- Create: `web/src/lib/forms/contact.ts`, `web/src/styles/forms.css`
- Modify (reescrever): `web/src/components/forms/ContactForm.tsx`, `web/src/components/forms/NewsletterForm.tsx`
- Modify: `web/src/app/[locale]/contact/page.tsx` e `web/src/app/[locale]/products/[slug]/page.tsx` (só a chamada do `ContactForm`), `web/src/app/globals.css`, `web/messages/{pt,en}.json`
- Test: `web/src/lib/forms/contact.test.ts`, `web/src/components/forms/ContactForm.test.tsx`, `web/src/components/forms/NewsletterForm.test.tsx`

**Interfaces:**

- Consumes: `submitContact`, `subscribeNewsletter`, `ContactPayload`, `ContactItem` (Task 2), `Turnstile` (P3; lê a chave pública sozinho e não renderiza nada sem ela), `Link`, `Icon`.
- Produces:
  - `lib/forms/contact.ts`: `CONTACT_TYPES`, `PROFESSIONS`, `BRAZIL_STATES` (tuplas `as const`), `type ContactType`, `type Profession`, `type ContactFormValues`, `type ContactField`, `type ContactFieldError = 'required' | 'invalidEmail' | 'tooLong' | 'consent'`, `type ContactErrors`, `EMAIL_PATTERN`, `readContactForm(form: FormData, fallbackType)`, `validateContact(values, { messageRequired })`, `firstInvalidField(errors)`, `buildContactPayload(values, options): ContactPayload`, `fieldFromServer(key): ContactField | null`.
  - `ContactForm(props: ContactFormProps)` com `ContactFormProps = { type?: ContactType; typeSelectable?: boolean; productId?: number; items?: ContactItem[]; composeMessage?: (typed: string) => string; messageRequired?: boolean; messageLabel?: string; messagePlaceholder?: string; submitLabel?: string; successMessage?: string; onSuccess?: () => void }`.
  - `NewsletterForm({ source?: string })`.
  - Classes: `form`, `req`, `form-error`, `consent`, `form-status`.

- [ ] **Step 1: Testes que falham**

`web/src/lib/forms/contact.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  buildContactPayload,
  fieldFromServer,
  firstInvalidField,
  readContactForm,
  validateContact,
  type ContactFormValues,
} from './contact';

const form = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    data.set(key, value);
  }
  return data;
};

const values = (overrides: Partial<ContactFormValues> = {}): ContactFormValues => ({
  type: 'quote',
  name: 'Ana',
  email: 'ana@exemplo.com',
  phone: '',
  company: '',
  profession: '',
  city: '',
  state: '',
  message: '',
  consent: true,
  ...overrides,
});

describe('contact form helpers', () => {
  it('reads the form and drops values outside the enums', () => {
    const read = readContactForm(
      form({ type: 'spam', name: 'Ana', profession: 'astronaut', state: 'Outro', consent: 'on' }),
      'quote',
    );
    expect(read).toMatchObject({ type: 'quote', name: 'Ana', profession: '', state: '', consent: true });
    expect(readContactForm(form({ profession: 'architect', state: 'MG' }), 'other')).toMatchObject({
      type: 'other',
      profession: 'architect',
      state: 'MG',
      consent: false,
    });
  });

  it('validates required fields, email, consent and lengths', () => {
    expect(
      validateContact(values({ name: ' ', email: '', consent: false }), { messageRequired: true }),
    ).toEqual({
      name: 'required',
      email: 'required',
      message: 'required',
      consent: 'consent',
    });
    expect(validateContact(values({ email: 'ana@' }), { messageRequired: false })).toEqual({
      email: 'invalidEmail',
    });
    expect(validateContact(values({ name: 'a'.repeat(121) }), { messageRequired: false })).toEqual({
      name: 'tooLong',
    });
    expect(validateContact(values(), { messageRequired: false })).toEqual({});
  });

  it('points to the first invalid field in form order', () => {
    expect(firstInvalidField({ consent: 'consent', email: 'required' })).toBe('email');
    expect(firstInvalidField({})).toBeNull();
  });

  it('builds the payload with nulls, composed message and items', () => {
    const payload = buildContactPayload(
      values({ phone: ' ', city: ' Belo Horizonte ', message: 'Entrega em BH' }),
      {
        locale: 'pt',
        sourceUrl: 'https://franccino.com.br/pt/lista-de-orcamento',
        items: [{ product_id: 12, quantity: 6, finish_ids: [101] }],
        composeMessage: (typed) => `${typed}\n\nPeças:`,
        turnstileToken: 'token',
      },
    );
    expect(payload).toEqual({
      type: 'quote',
      name: 'Ana',
      email: 'ana@exemplo.com',
      phone: null,
      company: null,
      profession: null,
      city: 'Belo Horizonte',
      state: null,
      message: 'Entrega em BH\n\nPeças:',
      items: [{ product_id: 12, quantity: 6, finish_ids: [101] }],
      locale: 'pt',
      source_url: 'https://franccino.com.br/pt/lista-de-orcamento',
      consent: true,
      turnstile_token: 'token',
    });
  });

  it('omits empty items and adds the product id', () => {
    const payload = buildContactPayload(values({ message: 'Oi' }), {
      locale: 'en',
      sourceUrl: 'https://x',
      productId: 12,
      items: [],
    });
    expect(payload).not.toHaveProperty('items');
    expect(payload).not.toHaveProperty('turnstile_token');
    expect(payload.product_id).toBe(12);
  });

  it('maps server error keys to form fields', () => {
    expect(fieldFromServer('email')).toBe('email');
    expect(fieldFromServer('items.0.quantity')).toBeNull();
    expect(fieldFromServer('turnstile_token')).toBeNull();
  });
});
```

`web/src/components/forms/ContactForm.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { ContactForm } from './ContactForm';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);
vi.mock('@/components/forms/Turnstile', () => ({ Turnstile: () => null }));

describe('ContactForm', () => {
  it('shows the subject select only when selectable', () => {
    expect(renderWithIntl(<ContactForm typeSelectable />)).toContain('name="type"');
    expect(renderWithIntl(<ContactForm type="quote" />)).not.toContain('name="type"');
  });

  it('links the consent to the privacy page', () => {
    expect(renderWithIntl(<ContactForm />)).toContain('href="/privacy"');
  });

  it('does not require the message when the quote list composes it', () => {
    const html = renderWithIntl(
      <ContactForm type="quote" messageRequired={false} messageLabel="Observações" />,
    );
    const textarea = html.match(/<textarea[^>]*>/)?.[0] ?? '';
    expect(textarea).toContain('name="message"');
    expect(textarea).not.toContain('required');
    expect(html).toContain('Observações');
  });

  it('offers all Brazilian states and every profession of the contract', () => {
    const html = renderWithIntl(<ContactForm />);
    expect(html.match(/<option value="[A-Z]{2}">/g)).toHaveLength(27);
    for (const value of ['architect', 'interior_designer', 'retailer', 'end_customer', 'other']) {
      expect(html).toContain(`value="${value}"`);
    }
  });
});
```

`web/src/components/forms/NewsletterForm.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { NewsletterForm } from './NewsletterForm';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);
vi.mock('@/components/forms/Turnstile', () => ({ Turnstile: () => null }));

describe('NewsletterForm', () => {
  it('asks for consent, as the api requires it', () => {
    const html = renderWithIntl(<NewsletterForm />);
    expect(html).toContain('name="consent"');
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('type="email"');
  });
});
```

Run: `pnpm --filter web test` → Expected: FAIL.

- [ ] **Step 2: `lib/forms/contact.ts`**

```ts
import type { Locale } from '@/i18n/config';
import type { ContactItem, ContactPayload } from '@/lib/api/forms';

export const CONTACT_TYPES = ['quote', 'assistance', 'partnership', 'press', 'other'] as const;
export const PROFESSIONS = ['architect', 'interior_designer', 'retailer', 'end_customer', 'other'] as const;
export const BRAZIL_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

export type ContactType = (typeof CONTACT_TYPES)[number];
export type Profession = (typeof PROFESSIONS)[number];

export type ContactFormValues = {
  type: ContactType;
  name: string;
  email: string;
  phone: string;
  company: string;
  profession: Profession | '';
  city: string;
  state: string;
  message: string;
  consent: boolean;
};

export type ContactField = keyof ContactFormValues;
export type ContactFieldError = 'required' | 'invalidEmail' | 'tooLong' | 'consent';
export type ContactErrors = Partial<Record<ContactField, ContactFieldError>>;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Limites do `ContactRequest` da API (P2, Task 12). */
const MAX_LENGTH: Partial<Record<ContactField, number>> = {
  name: 120,
  email: 190,
  phone: 40,
  company: 120,
  city: 120,
  message: 5000,
};

const FIELD_ORDER: ContactField[] = [
  'type',
  'name',
  'email',
  'phone',
  'company',
  'city',
  'state',
  'profession',
  'message',
  'consent',
];

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value : '';
}

function isOneOf<T extends string>(list: readonly T[], value: string): value is T {
  return (list as readonly string[]).includes(value);
}

export function readContactForm(form: FormData, fallbackType: ContactType): ContactFormValues {
  const type = text(form, 'type');
  const profession = text(form, 'profession');
  const state = text(form, 'state');
  return {
    type: isOneOf(CONTACT_TYPES, type) ? type : fallbackType,
    name: text(form, 'name'),
    email: text(form, 'email'),
    phone: text(form, 'phone'),
    company: text(form, 'company'),
    profession: isOneOf(PROFESSIONS, profession) ? profession : '',
    city: text(form, 'city'),
    state: isOneOf(BRAZIL_STATES, state) ? state : '',
    message: text(form, 'message'),
    consent: form.get('consent') === 'on',
  };
}

export function validateContact(
  values: ContactFormValues,
  options: { messageRequired: boolean },
): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.name.trim()) {
    errors.name = 'required';
  }
  if (!values.email.trim()) {
    errors.email = 'required';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'invalidEmail';
  }
  if (options.messageRequired && !values.message.trim()) {
    errors.message = 'required';
  }
  if (!values.consent) {
    errors.consent = 'consent';
  }
  for (const [field, max] of Object.entries(MAX_LENGTH) as [ContactField, number][]) {
    const value = values[field];
    if (typeof value === 'string' && value.trim().length > max && !errors[field]) {
      errors[field] = 'tooLong';
    }
  }
  return errors;
}

export function firstInvalidField(errors: Partial<Record<ContactField, unknown>>): ContactField | null {
  return FIELD_ORDER.find((field) => errors[field]) ?? null;
}

export type ContactPayloadOptions = {
  locale: Locale;
  sourceUrl: string;
  productId?: number;
  items?: ContactItem[];
  composeMessage?: (typed: string) => string;
  turnstileToken?: string | null;
};

export function buildContactPayload(
  values: ContactFormValues,
  options: ContactPayloadOptions,
): ContactPayload {
  const optional = (value: string) => value.trim() || null;
  return {
    type: values.type,
    name: values.name.trim(),
    email: values.email.trim(),
    phone: optional(values.phone),
    company: optional(values.company),
    profession: values.profession || null,
    city: optional(values.city),
    state: values.state || null,
    message: options.composeMessage ? options.composeMessage(values.message) : values.message.trim(),
    ...(options.productId ? { product_id: options.productId } : {}),
    ...(options.items && options.items.length > 0 ? { items: options.items } : {}),
    locale: options.locale,
    source_url: options.sourceUrl,
    consent: values.consent,
    ...(options.turnstileToken ? { turnstile_token: options.turnstileToken } : {}),
  };
}

/** Chave de erro da API → campo do formulário (`items.*` e `turnstile_token` viram erro geral). */
export function fieldFromServer(key: string): ContactField | null {
  return (FIELD_ORDER as string[]).includes(key) ? (key as ContactField) : null;
}
```

(O Prettier pode reformatar as tuplas de UFs e de campos; tudo bem.)

- [ ] **Step 3: `ContactForm` e `NewsletterForm`**

`web/src/components/forms/ContactForm.tsx` (substitui o do P3):

```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { Turnstile } from '@/components/forms/Turnstile';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { submitContact, type ContactItem } from '@/lib/api/forms';
import {
  BRAZIL_STATES,
  buildContactPayload,
  CONTACT_TYPES,
  fieldFromServer,
  firstInvalidField,
  PROFESSIONS,
  readContactForm,
  validateContact,
  type ContactField,
  type ContactFieldError,
  type ContactType,
} from '@/lib/forms/contact';

type Status = 'idle' | 'sending' | 'success' | 'failed' | 'rateLimited';

export type ContactFormProps = {
  type?: ContactType;
  typeSelectable?: boolean;
  productId?: number;
  items?: ContactItem[];
  composeMessage?: (typed: string) => string;
  messageRequired?: boolean;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  successMessage?: string;
  onSuccess?: () => void;
};

function FieldShell(props: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  errorId: string;
  children: ReactNode;
}) {
  const t = useTranslations('contactForm');
  return (
    <div className="field">
      <label htmlFor={props.id}>
        {props.label}
        {props.required ? (
          <span className="req" aria-hidden="true">
            {t('requiredMark')}
          </span>
        ) : null}
      </label>
      {props.children}
      {props.error ? (
        <p className="error" id={props.errorId}>
          {props.error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm({
  type = 'other',
  typeSelectable = false,
  productId,
  items,
  composeMessage,
  messageRequired = true,
  messageLabel,
  messagePlaceholder,
  submitLabel,
  successMessage,
  onSuccess,
}: ContactFormProps) {
  const t = useTranslations('contactForm');
  const locale = useLocale() as Locale;
  const baseId = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const fieldId = (field: ContactField) => `${baseId}-${field}`;
  const errorId = (field: ContactField) => `${baseId}-${field}-error`;
  const aria = (field: ContactField) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? errorId(field) : undefined,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = readContactForm(data, type);
    const found = validateContact(values, { messageRequired });

    const messages: Partial<Record<ContactField, string>> = {};
    for (const [field, code] of Object.entries(found) as [ContactField, ContactFieldError][]) {
      messages[field] = t(`errors.${code}`);
    }
    setErrors(messages);
    setServerMessage(null);

    const first = firstInvalidField(found);
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus('sending');
    const token = data.get('cf-turnstile-response');
    const result = await submitContact(
      buildContactPayload(values, {
        locale,
        sourceUrl: window.location.href,
        productId,
        items,
        composeMessage,
        turnstileToken: typeof token === 'string' ? token : null,
      }),
    );

    if (result.ok) {
      form.reset();
      setStatus('success');
      onSuccess?.();
      return;
    }
    if (result.status === 429) {
      setStatus('rateLimited');
      return;
    }
    const mapped: Partial<Record<ContactField, string>> = {};
    for (const [key, message] of Object.entries(result.fieldErrors)) {
      const field = fieldFromServer(key);
      if (field) {
        mapped[field] = message;
      }
    }
    setErrors(mapped);
    setServerMessage(Object.keys(mapped).length === 0 ? (result.message ?? null) : null);
    setStatus('failed');
  }

  if (status === 'success') {
    return (
      <div className="form-status" role="status">
        <strong>{successMessage ?? t('success')}</strong>
      </div>
    );
  }

  const hasFieldErrors = Object.keys(errors).length > 0;
  const alert =
    status === 'rateLimited'
      ? t('rateLimited')
      : hasFieldErrors
        ? t('errorSummary')
        : status === 'failed'
          ? (serverMessage ?? t('failed'))
          : null;

  return (
    <form className="form" noValidate onSubmit={handleSubmit}>
      <p className="meta">{t('requiredHint')}</p>

      {typeSelectable ? (
        <FieldShell id={fieldId('type')} label={t('type')} errorId={errorId('type')}>
          <select id={fieldId('type')} name="type" defaultValue={type}>
            {CONTACT_TYPES.map((value) => (
              <option key={value} value={value}>
                {t(`types.${value}`)}
              </option>
            ))}
          </select>
        </FieldShell>
      ) : null}

      <FieldShell
        id={fieldId('name')}
        label={t('name')}
        required
        error={errors.name}
        errorId={errorId('name')}
      >
        <input
          id={fieldId('name')}
          name="name"
          autoComplete="name"
          required
          maxLength={120}
          {...aria('name')}
        />
      </FieldShell>

      <div className="pair">
        <FieldShell
          id={fieldId('email')}
          label={t('email')}
          required
          error={errors.email}
          errorId={errorId('email')}
        >
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={190}
            {...aria('email')}
          />
        </FieldShell>
        <FieldShell id={fieldId('phone')} label={t('phone')} error={errors.phone} errorId={errorId('phone')}>
          <input
            id={fieldId('phone')}
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            {...aria('phone')}
          />
        </FieldShell>
      </div>

      <FieldShell
        id={fieldId('company')}
        label={t('company')}
        error={errors.company}
        errorId={errorId('company')}
      >
        <input
          id={fieldId('company')}
          name="company"
          autoComplete="organization"
          maxLength={120}
          {...aria('company')}
        />
      </FieldShell>

      <div className="pair">
        <FieldShell id={fieldId('city')} label={t('city')} error={errors.city} errorId={errorId('city')}>
          <input
            id={fieldId('city')}
            name="city"
            autoComplete="address-level2"
            maxLength={120}
            {...aria('city')}
          />
        </FieldShell>
        <FieldShell id={fieldId('state')} label={t('state')} error={errors.state} errorId={errorId('state')}>
          <select
            id={fieldId('state')}
            name="state"
            autoComplete="address-level1"
            defaultValue=""
            {...aria('state')}
          >
            <option value="">{t('statePlaceholder')}</option>
            {BRAZIL_STATES.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </FieldShell>
      </div>

      <FieldShell
        id={fieldId('profession')}
        label={t('profession')}
        error={errors.profession}
        errorId={errorId('profession')}
      >
        <select id={fieldId('profession')} name="profession" defaultValue="" {...aria('profession')}>
          <option value="">{t('professionPlaceholder')}</option>
          {PROFESSIONS.map((value) => (
            <option key={value} value={value}>
              {t(`professions.${value}`)}
            </option>
          ))}
        </select>
      </FieldShell>

      <FieldShell
        id={fieldId('message')}
        label={messageLabel ?? t('message')}
        required={messageRequired}
        error={errors.message}
        errorId={errorId('message')}
      >
        <textarea
          id={fieldId('message')}
          name="message"
          rows={4}
          maxLength={5000}
          required={messageRequired}
          placeholder={messagePlaceholder}
          {...aria('message')}
        />
      </FieldShell>

      <div className="field">
        <label className="consent">
          <input type="checkbox" name="consent" required {...aria('consent')} />
          <span>{t.rich('consent', { privacy: (chunks) => <Link href="/privacy">{chunks}</Link> })}</span>
        </label>
        {errors.consent ? (
          <p className="error" id={errorId('consent')}>
            {errors.consent}
          </p>
        ) : null}
      </div>

      <Turnstile />

      {alert ? (
        <p className="form-error" role="alert">
          {alert}
        </p>
      ) : null}

      <button
        className="btn btn--block"
        type="submit"
        disabled={status === 'sending'}
        aria-busy={status === 'sending'}
      >
        {status === 'sending' ? t('sending') : (submitLabel ?? t('submit'))}
      </button>
    </form>
  );
}
```

`web/src/components/forms/NewsletterForm.tsx` (substitui o do P3):

```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useId, useState, type FormEvent } from 'react';
import { Turnstile } from '@/components/forms/Turnstile';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { subscribeNewsletter } from '@/lib/api/forms';
import { EMAIL_PATTERN } from '@/lib/forms/contact';

type NewsletterStatus = 'idle' | 'sending' | 'success' | 'invalid' | 'failed' | 'rateLimited';

export function NewsletterForm({ source = 'footer' }: { source?: string }) {
  const t = useTranslations('newsletter');
  const locale = useLocale() as Locale;
  const baseId = useId();
  const [status, setStatus] = useState<NewsletterStatus>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '').trim();
    if (!EMAIL_PATTERN.test(email) || data.get('consent') !== 'on') {
      setStatus('invalid');
      return;
    }
    setStatus('sending');
    const token = data.get('cf-turnstile-response');
    const result = await subscribeNewsletter({
      email,
      locale,
      source,
      consent: true,
      ...(typeof token === 'string' && token ? { turnstile_token: token } : {}),
    });
    if (result.ok) {
      form.reset();
      setStatus('success');
      return;
    }
    setStatus(result.status === 429 ? 'rateLimited' : 'failed');
  }

  const message =
    status === 'idle'
      ? null
      : status === 'sending'
        ? t('status.sending')
        : status === 'success'
          ? t('status.success')
          : status === 'invalid'
            ? t('status.invalid')
            : status === 'rateLimited'
              ? t('status.rateLimited')
              : t('status.failed');

  return (
    <form className="newsletter-form" noValidate onSubmit={handleSubmit}>
      <p className="footer-muted">{t('intro')}</p>
      <div className="newsletter">
        <label className="visually-hidden" htmlFor={`${baseId}-email`}>
          {t('emailLabel')}
        </label>
        <input
          id={`${baseId}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t('placeholder')}
          aria-invalid={status === 'invalid' ? true : undefined}
          aria-describedby={`${baseId}-status`}
        />
        <button type="submit" aria-label={t('submit')} disabled={status === 'sending'}>
          <Icon name="arrow" />
        </button>
      </div>
      <label className="newsletter__consent">
        <input type="checkbox" name="consent" required />
        <span>{t.rich('consent', { privacy: (chunks) => <Link href="/privacy">{chunks}</Link> })}</span>
      </label>
      <Turnstile />
      <p className="newsletter__status" id={`${baseId}-status`} role="status">
        {message}
      </p>
    </form>
  );
}
```

(Se o `Turnstile` do P3 exigir props, passe as mesmas que os formulários do P3 passavam.)

Chamadas do P3 — `grep -rn "<ContactForm" web/src/app` e trocar: em `contact/page.tsx` por `<ContactForm typeSelectable />`; em `products/[slug]/page.tsx` por `<ContactForm type="quote" productId={product.id} />` (a página inteira é reescrita na Task 8).

- [ ] **Step 4: CSS e mensagens**

`web/src/styles/forms.css` — portar de `design/prototype/assets/styles.css`, bloco `quote list page`, só `.consent`, `.consent input` e `.form-status` (≈1733–1756), trocando `var(--ink-2)` por `var(--ink-muted)` e `#f2f5f2` por `var(--status-ok-bg)`; acrescentar:

```css
.form {
  display: grid;
  gap: 14px;
}

.req {
  margin-left: 2px;
  color: var(--alert);
}

.form-error {
  font-size: 0.875rem;
  color: var(--alert);
  border: 1px solid var(--alert);
  background: var(--paper);
  padding: 10px 12px;
}

.consent a {
  color: var(--ink);
}
```

`web/src/app/globals.css` — acrescentar abaixo do último `@import`: `@import '../styles/forms.css' layer(components);`

`messages/pt.json`:

```json
"contactForm": {
  "requiredHint": "Campos com * são obrigatórios.",
  "requiredMark": "*",
  "type": "Assunto",
  "types": {
    "quote": "Orçamento",
    "assistance": "Assistência técnica",
    "partnership": "Seja um parceiro",
    "press": "Imprensa",
    "other": "Outro assunto"
  },
  "name": "Nome",
  "email": "E-mail",
  "phone": "Telefone",
  "company": "Empresa",
  "city": "Cidade",
  "state": "UF",
  "statePlaceholder": "Selecione",
  "profession": "Você é",
  "professionPlaceholder": "Selecione",
  "professions": {
    "architect": "Arquiteto(a)",
    "interior_designer": "Designer de interiores",
    "retailer": "Lojista",
    "end_customer": "Cliente final",
    "other": "Outro"
  },
  "message": "Mensagem",
  "consent": "Concordo com a <privacy>política de privacidade</privacy> e com o contato da Franccino sobre esta mensagem.",
  "submit": "Enviar",
  "sending": "Enviando…",
  "success": "Mensagem recebida. A equipe da Franccino responde pelo e-mail informado.",
  "errorSummary": "Confira os campos destacados.",
  "failed": "Não foi possível enviar agora. Tente novamente em instantes.",
  "rateLimited": "Muitos envios seguidos. Aguarde um minuto e tente de novo.",
  "errors": {
    "required": "Campo obrigatório.",
    "invalidEmail": "Informe um e-mail válido.",
    "tooLong": "Texto maior que o permitido.",
    "consent": "É preciso aceitar a política de privacidade."
  }
},
"newsletter": {
  "intro": "Receba os lançamentos da Franccino por e-mail.",
  "emailLabel": "Seu e-mail",
  "placeholder": "Seu e-mail",
  "submit": "Inscrever",
  "consent": "Aceito a <privacy>política de privacidade</privacy>.",
  "status": {
    "sending": "Enviando…",
    "success": "Inscrição recebida.",
    "invalid": "Informe um e-mail válido e aceite a política de privacidade.",
    "failed": "Não foi possível inscrever agora. Tente novamente.",
    "rateLimited": "Muitas tentativas seguidas. Aguarde um minuto."
  }
}
```

`messages/en.json`:

```json
"contactForm": {
  "requiredHint": "Fields marked * are required.",
  "requiredMark": "*",
  "type": "Subject",
  "types": {
    "quote": "Quote",
    "assistance": "Technical assistance",
    "partnership": "Become a partner",
    "press": "Press",
    "other": "Something else"
  },
  "name": "Name",
  "email": "Email",
  "phone": "Phone",
  "company": "Company",
  "city": "City",
  "state": "State (Brazil)",
  "statePlaceholder": "Select",
  "profession": "You are",
  "professionPlaceholder": "Select",
  "professions": {
    "architect": "Architect",
    "interior_designer": "Interior designer",
    "retailer": "Retailer",
    "end_customer": "Home owner",
    "other": "Other"
  },
  "message": "Message",
  "consent": "I agree to the <privacy>privacy policy</privacy> and to being contacted by Franccino about this message.",
  "submit": "Send",
  "sending": "Sending…",
  "success": "Message received. The Franccino team will reply to the email you provided.",
  "errorSummary": "Please check the highlighted fields.",
  "failed": "We could not send it right now. Please try again shortly.",
  "rateLimited": "Too many attempts in a row. Wait a minute and try again.",
  "errors": {
    "required": "This field is required.",
    "invalidEmail": "Enter a valid email address.",
    "tooLong": "This text is longer than allowed.",
    "consent": "You need to accept the privacy policy."
  }
},
"newsletter": {
  "intro": "Get Franccino launches by email.",
  "emailLabel": "Your email",
  "placeholder": "Your email",
  "submit": "Subscribe",
  "consent": "I accept the <privacy>privacy policy</privacy>.",
  "status": {
    "sending": "Sending…",
    "success": "Subscription received.",
    "invalid": "Enter a valid email and accept the privacy policy.",
    "failed": "We could not subscribe you right now. Please try again.",
    "rateLimited": "Too many attempts in a row. Wait a minute."
  }
}
```

- [ ] **Step 5: Rodar e commitar**

Run: `pnpm --filter web test` → Expected: PASS.
Run: lint + typecheck + `ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` → Expected: verde. Com a API local no ar, enviar uma mensagem por `/pt/contato` e conferir no Mailpit (`http://localhost:8025`).

```bash
git add web
git commit -m "feat(web): aplica o design system aos formularios e envia itens no contato

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 4: Cabeçalho, rodapé, layout e rotas novas

**Files:**

- Create: `web/src/lib/api/build-fallback.ts`, `web/src/lib/api/empty.ts`, `web/src/lib/settings.ts`, `web/src/components/layout/nav.ts`, `web/src/components/layout/HeaderNav.tsx`, `web/src/components/layout/QuoteListLink.tsx`, `web/src/components/ui/ToastRegion.tsx`, `web/src/styles/chrome.css`
- Modify (reescrever): `web/src/components/layout/SiteHeader.tsx`, `web/src/components/layout/SiteFooter.tsx`, `web/src/components/layout/LanguageSwitcher.tsx`, `web/src/app/[locale]/layout.tsx`
- Modify: `web/src/i18n/routing.ts` (2 rotas), `web/src/lib/api/types.ts` (`Settings`), `web/src/lib/seo/jsonld.ts` (`organizationJsonLd`), `docs/api.md` (forma de `GET /settings`), `web/src/app/globals.css`, `web/messages/{pt,en}.json`
- Test: `web/src/i18n/routing.test.ts` (casos novos), `web/src/lib/api/build-fallback.test.ts`, `web/src/lib/settings.test.ts`, `web/src/components/layout/nav.test.ts`, `web/src/components/layout/SiteFooter.test.tsx`

**Interfaces:**

- Consumes: `serverEnv`, `ApiError`, `getSettings`, `locales`, `htmlLang`, `resolveAlternateHref` (P3), `NewsletterForm` (Task 3), `useQuoteCount`, `onToast`, `whatsappUrl`, `telHref` (Task 2), `Icon` (Task 1).
- Produces:
  - Rotas internas `'/quote-list'` (`/pt/lista-de-orcamento`, `/en/quote-list`) e `'/room-planner'` (`/pt/sala-para-montar`, `/en/room-planner`).
  - `withBuildFallback<T>(promise: Promise<T>, empty: T): Promise<T>`.
  - `emptyPage<T>(): Paginated<T>`, `EMPTY_HOME: Home`.
  - `Settings` = forma do P2 (abaixo); `EMPTY_SETTINGS`, `type SocialPlatform`, `socialLinks(settings): { platform: SocialPlatform; url: string }[]`.
  - `NAV_ITEMS`, `type NavKey`, `activeNavKey(pathname): NavKey | null`.
  - `SiteHeader()`, `HeaderNav()`, `QuoteListLink()`, `LanguageSwitcher()`, `SiteFooter({ settings })`, `ToastRegion()`.
  - Layout com link "pular para o conteúdo" apontando para `#conteudo`, JSON-LD Organization, header, footer e região de avisos.

- [ ] **Step 1: Testes que falham**

`web/src/i18n/routing.test.ts` — acrescentar ao `it.each`:

```ts
    [{ pathname: '/quote-list' }, 'pt', '/pt/lista-de-orcamento'],
    [{ pathname: '/quote-list' }, 'en', '/en/quote-list'],
    [{ pathname: '/room-planner' }, 'pt', '/pt/sala-para-montar'],
    [{ pathname: '/room-planner' }, 'en', '/en/room-planner'],
```

`web/src/lib/api/build-fallback.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { withBuildFallback } from './build-fallback';
import { ApiError } from './errors';

describe('withBuildFallback', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns the resolved value', async () => {
    await expect(withBuildFallback(Promise.resolve([1]), [])).resolves.toEqual([1]);
  });

  it('uses the empty value on network errors only when the flag is set', async () => {
    const failing = () => Promise.reject(new TypeError('fetch failed'));
    await expect(withBuildFallback(failing(), [])).rejects.toThrow('fetch failed');
    vi.stubEnv('ALLOW_BUILD_WITHOUT_API', 'true');
    await expect(withBuildFallback(failing(), [])).resolves.toEqual([]);
  });

  it('never hides api errors', async () => {
    vi.stubEnv('ALLOW_BUILD_WITHOUT_API', 'true');
    await expect(withBuildFallback(Promise.reject(new ApiError(500, null)), [])).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
```

`web/src/lib/settings.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { EMPTY_SETTINGS, socialLinks } from './settings';

describe('settings helpers', () => {
  it('lists only the social networks that have a url', () => {
    expect(
      socialLinks({
        ...EMPTY_SETTINGS,
        instagram_url: 'https://www.instagram.com/franccino/',
        youtube_url: '',
        facebook_url: 'https://www.facebook.com/franccino',
      }),
    ).toEqual([
      { platform: 'instagram', url: 'https://www.instagram.com/franccino/' },
      { platform: 'facebook', url: 'https://www.facebook.com/franccino' },
    ]);
    expect(socialLinks(EMPTY_SETTINGS)).toEqual([]);
  });
});
```

`web/src/components/layout/nav.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { activeNavKey, NAV_ITEMS } from './nav';

describe('main navigation', () => {
  it('keeps the approved order', () => {
    expect(NAV_ITEMS.map((item) => item.key)).toEqual([
      'indoor',
      'outdoor',
      'launches',
      'collections',
      'designers',
      'projects',
      'factory',
      'stores',
      'planner',
      'technical',
    ]);
  });

  it('marks the section of the current internal pathname', () => {
    expect(activeNavKey('/indoor')).toBe('indoor');
    expect(activeNavKey('/outdoor/[category]')).toBe('outdoor');
    expect(activeNavKey('/launches/[slug]')).toBe('launches');
    expect(activeNavKey('/room-planner')).toBe('planner');
    expect(activeNavKey('/products/[slug]')).toBeNull();
    expect(activeNavKey('/')).toBeNull();
  });
});
```

`web/src/components/layout/SiteFooter.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { EMPTY_SETTINGS } from '@/lib/settings';
import { renderWithIntl } from '@/test/intl';
import { SiteFooter } from './SiteFooter';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);
vi.mock('@/components/forms/Turnstile', () => ({ Turnstile: () => null }));

describe('SiteFooter', () => {
  it('renders contacts and documents from settings only', () => {
    const html = renderWithIntl(
      <SiteFooter
        settings={{
          ...EMPTY_SETTINGS,
          contact_phone: '(37) 3381-4204',
          quotes_whatsapp: '5511942900080',
          footer_documents: [{ label: 'Relatório de transparência', url: 'https://cdn.test/relatorio.pdf' }],
        }}
      />,
    );
    expect(html).toContain('href="tel:+553733814204"');
    expect(html).toContain('href="https://wa.me/5511942900080"');
    expect(html).not.toContain('wa.me/"');
    expect(html).toContain('Relatório de transparência');
    expect(html).toContain('href="/privacy"');
  });

  it('omits whatsapp links when there is no number', () => {
    expect(renderWithIntl(<SiteFooter settings={EMPTY_SETTINGS} />)).not.toContain('wa.me');
  });
});
```

Run: `pnpm --filter web test` → Expected: FAIL.

- [ ] **Step 2: Rotas, `Settings` e helpers de build**

`web/src/i18n/routing.ts` — acrescentar ao mapa `pathnames`, depois de `'/terms'`:

```ts
  '/quote-list': { pt: '/lista-de-orcamento', en: '/quote-list' },
  '/room-planner': { pt: '/sala-para-montar', en: '/room-planner' },
```

`web/src/lib/api/types.ts` — substituir o tipo `Settings` (e seu comentário) por:

```ts
/**
 * Configurações públicas (`GET /settings`): `GeneralSettings` do P2 sem
 * `contact_recipients`. Documentado em `docs/api.md` na Task 4 do P4.
 */
export type Settings = {
  company_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  factory_address: string | null;
  /** Só dígitos, com DDI (ex.: "5511942900080"). */
  quotes_whatsapp: string | null;
  assistance_whatsapp: string | null;
  assistance_phone: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  pinterest_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  /** Rótulo no idioma pedido e URL absoluta. */
  footer_documents: { label: string; url: string }[];
};
```

Se a API do P2 (worktree `api`) já estiver expondo outra forma em `SettingsResource`, espelhe a forma real e registre no relatório.

`docs/api.md` — se o contrato ainda não descrever `/settings`, acrescentar depois do parágrafo de `Store`:

```markdown
`Settings` (`GET /settings`): `company_name`, `contact_email`, `contact_phone`, `factory_address`,
`quotes_whatsapp`, `assistance_whatsapp` (só dígitos, com DDI), `assistance_phone`, `instagram_url`,
`facebook_url`, `pinterest_url`, `linkedin_url`, `youtube_url` (string ou `null`) e
`footer_documents: { label, url }[]` (rótulo no idioma pedido, URL absoluta). `contact_recipients` não é exposto.
```

`web/src/lib/settings.ts`:

```ts
import type { Settings } from '@/lib/api/types';

/** Usado só quando o build roda sem API (`withBuildFallback`). */
export const EMPTY_SETTINGS: Settings = {
  company_name: 'Franccino',
  contact_email: null,
  contact_phone: null,
  factory_address: null,
  quotes_whatsapp: null,
  assistance_whatsapp: null,
  assistance_phone: null,
  instagram_url: null,
  facebook_url: null,
  pinterest_url: null,
  linkedin_url: null,
  youtube_url: null,
  footer_documents: [],
};

export type SocialPlatform = 'instagram' | 'facebook' | 'pinterest' | 'linkedin' | 'youtube';

const SOCIAL_FIELDS: [SocialPlatform, keyof Settings][] = [
  ['instagram', 'instagram_url'],
  ['facebook', 'facebook_url'],
  ['pinterest', 'pinterest_url'],
  ['linkedin', 'linkedin_url'],
  ['youtube', 'youtube_url'],
];

export function socialLinks(settings: Settings): { platform: SocialPlatform; url: string }[] {
  return SOCIAL_FIELDS.flatMap(([platform, field]) => {
    const url = settings[field];
    return typeof url === 'string' && url ? [{ platform, url }] : [];
  });
}
```

`web/src/lib/seo/jsonld.ts` — em `organizationJsonLd`, trocar o que lia campos antigos de `Settings` (`whatsapp`, `social_links`) por:

```ts
export function organizationJsonLd(settings: Settings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.company_name,
    url: absoluteUrl('/'),
    ...(settings.contact_email ? { email: settings.contact_email } : {}),
    ...(settings.contact_phone ? { telephone: settings.contact_phone } : {}),
    sameAs: socialLinks(settings).map((link) => link.url),
  };
}
```

(com `import { socialLinks } from '@/lib/settings';`; se a versão do P3 tiver outros campos, como `logo`, mantenha-os). Depois: `grep -rn "social_links\|\.whatsapp\b\|footer_documents" web/src` e corrigir qualquer outro uso.

`web/src/lib/api/build-fallback.ts`:

```ts
import { serverEnv } from '@/lib/env';
import { ApiError } from './errors';

/**
 * Para chamadas feitas durante o build (layout, home, sala, listas estáticas,
 * generateStaticParams): se a API estiver fora do ar **e** `ALLOW_BUILD_WITHOUT_API`
 * estiver ligado (CI), devolve `empty`. Resposta de erro da API (`ApiError`) nunca é escondida.
 */
export async function withBuildFallback<T>(promise: Promise<T>, empty: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (!(error instanceof ApiError) && serverEnv().ALLOW_BUILD_WITHOUT_API) {
      return empty;
    }
    throw error;
  }
}
```

`web/src/lib/api/empty.ts`:

```ts
import type { Home, Paginated } from './types';

export function emptyPage<T>(): Paginated<T> {
  return {
    data: [],
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: 1, last_page: 1, per_page: 24, total: 0 },
  };
}

export const EMPTY_HOME: Home = {
  banners: [],
  featured_products: [],
  featured_collections: [],
  current_launch: null,
  designers: [],
};
```

- [ ] **Step 3: Navegação e cabeçalho**

`web/src/components/layout/nav.ts`:

```ts
/** Ordem aprovada (conflito C7 do plano P4). Corporativo, Downloads e Contato ficam no rodapé. */
export const NAV_ITEMS = [
  { key: 'indoor', href: '/indoor' },
  { key: 'outdoor', href: '/outdoor' },
  { key: 'launches', href: '/launches' },
  { key: 'collections', href: '/collections' },
  { key: 'designers', href: '/designers' },
  { key: 'projects', href: '/projects' },
  { key: 'factory', href: '/factory' },
  { key: 'stores', href: '/stores' },
  { key: 'planner', href: '/room-planner' },
  { key: 'technical', href: { pathname: '/products', query: { view: 'table' } } },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]['key'];

const PREFIXES: [string, NavKey][] = [
  ['/indoor', 'indoor'],
  ['/outdoor', 'outdoor'],
  ['/launches', 'launches'],
  ['/collections', 'collections'],
  ['/designers', 'designers'],
  ['/projects', 'projects'],
  ['/factory', 'factory'],
  ['/stores', 'stores'],
  ['/room-planner', 'planner'],
];

/** Recebe o pathname interno do next-intl (ex.: `/indoor/[category]`). */
export function activeNavKey(pathname: string): NavKey | null {
  for (const [prefix, key] of PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return key;
    }
  }
  return null;
}
```

`web/src/components/layout/QuoteListLink.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import { useQuoteCount } from '@/lib/quote/hooks';

export function QuoteListLink() {
  const t = useTranslations('header');
  const count = useQuoteCount();
  return (
    <Link href="/quote-list" aria-label={t('quoteList', { count })}>
      <Icon name="list" />
      <span className="label-optional" aria-hidden="true">
        {t('quoteListShort')}
      </span>
      {/* key: remonta o contador a cada mudança para reiniciar a animação de destaque. */}
      <span key={count} className="list-count num" data-empty={count === 0} aria-hidden="true">
        {count}
      </span>
    </Link>
  );
}
```

`web/src/components/layout/LanguageSwitcher.tsx` (substitui o do P3; `resolveAlternateHref` continua no módulo onde o P3 o criou — se estiver dentro deste arquivo, mova-o para `web/src/components/layout/language-switch.ts` e ajuste o import do teste do P3):

```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';
import { htmlLang, locales, type Locale } from '@/i18n/config';
import { getPathname } from '@/i18n/navigation';
import { resolveAlternateHref } from './language-switch';

export function LanguageSwitcher() {
  const t = useTranslations('language');
  const current = useLocale() as Locale;

  if (locales.length < 2) {
    return null;
  }

  // Vai para a página equivalente (hreflang do <head>, gerado por buildMetadata); sem ela, a home do idioma.
  function handleClick(event: MouseEvent<HTMLAnchorElement>, target: Locale) {
    const links = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]'),
      (link) => ({
        hreflang: link.hreflang,
        href: link.href,
      }),
    );
    const href = resolveAlternateHref(links, target);
    if (href) {
      event.preventDefault();
      window.location.assign(href);
    }
  }

  return (
    <nav className="lang" aria-label={t('label')}>
      {locales.map((locale) =>
        locale === current ? (
          <strong key={locale} aria-current="true" lang={htmlLang(locale)}>
            {t(`short.${locale}`)}
          </strong>
        ) : (
          <a
            key={locale}
            href={getPathname({ href: '/', locale })}
            hrefLang={htmlLang(locale)}
            lang={htmlLang(locale)}
            aria-label={t(locale)}
            onClick={(event) => handleClick(event, locale)}
          >
            {t(`short.${locale}`)}
          </a>
        ),
      )}
    </nav>
  );
}
```

`web/src/components/layout/HeaderNav.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Link, usePathname } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { activeNavKey, NAV_ITEMS } from './nav';
import { QuoteListLink } from './QuoteListLink';

export function HeaderNav() {
  const t = useTranslations('header');
  const nav = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const active = activeNavKey(pathname);

  return (
    <>
      <nav
        id="site-nav"
        className={open ? 'nav is-open' : 'nav'}
        aria-label={t('navLabel')}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && open) {
            setOpen(false);
            toggleRef.current?.focus();
          }
        }}
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.key === active ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            {nav(item.key)}
          </Link>
        ))}
      </nav>
      <div className="tools">
        <Link href="/search" aria-label={t('search')}>
          <Icon name="search" />
        </Link>
        <LanguageSwitcher />
        <QuoteListLink />
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-controls="site-nav"
          aria-expanded={open}
          aria-label={open ? t('closeMenu') : t('openMenu')}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>
    </>
  );
}
```

`web/src/components/layout/SiteHeader.tsx` (substitui o do P3):

```tsx
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HeaderNav } from './HeaderNav';

export function SiteHeader() {
  const t = useTranslations('header');
  return (
    <header className="site-header">
      <div className="wrap site-header__bar">
        <Link className="wordmark" href="/" aria-label={t('homeLabel')}>
          {t('wordmark')}
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Rodapé, avisos e layout**

`web/src/components/layout/SiteFooter.tsx` (substitui o do P3):

```tsx
import { useTranslations } from 'next-intl';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { Link } from '@/i18n/navigation';
import type { Settings } from '@/lib/api/types';
import { telHref, whatsappUrl } from '@/lib/contact-links';
import { socialLinks } from '@/lib/settings';

export function SiteFooter({ settings }: { settings: Settings }) {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const common = useTranslations('common');
  const quotes = whatsappUrl(settings.quotes_whatsapp);
  const assistance = whatsappUrl(settings.assistance_whatsapp);
  // String: como número, o ICU formataria "2.026" em pt-BR.
  const year = String(new Date().getFullYear());

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="wordmark" href="/">
              {t('wordmark')}
            </Link>
            {settings.factory_address ? (
              <p className="footer-muted">{t('factory', { address: settings.factory_address })}</p>
            ) : null}
            <p className="footer-contacts">
              {settings.contact_phone ? (
                <a href={telHref(settings.contact_phone)}>{settings.contact_phone}</a>
              ) : null}
              {settings.contact_email ? (
                <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
              ) : null}
            </p>
          </div>

          <div>
            <h2 className="footer-title">{t('catalog')}</h2>
            <ul>
              <li>
                <Link href="/indoor">{nav('indoor')}</Link>
              </li>
              <li>
                <Link href="/outdoor">{nav('outdoor')}</Link>
              </li>
              <li>
                <Link href="/launches">{nav('launches')}</Link>
              </li>
              <li>
                <Link href="/collections">{nav('collections')}</Link>
              </li>
              <li>
                <Link href="/room-planner">{nav('planner')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer-title">{t('service')}</h2>
            <ul>
              {quotes ? (
                <li>
                  <a href={quotes} target="_blank" rel="noopener noreferrer">
                    {t('quotesWhatsapp')}
                    <span className="visually-hidden">{common('opensInNewWindow')}</span>
                  </a>
                </li>
              ) : null}
              {assistance ? (
                <li>
                  <a href={assistance} target="_blank" rel="noopener noreferrer">
                    {t('assistanceWhatsapp')}
                    <span className="visually-hidden">{common('opensInNewWindow')}</span>
                  </a>
                </li>
              ) : null}
              <li>
                <Link href="/stores">{t('whereToFind')}</Link>
              </li>
              <li>
                <Link href={{ pathname: '/products', query: { view: 'table' } }}>{nav('technical')}</Link>
              </li>
              <li>
                <Link href="/downloads">{nav('downloads')}</Link>
              </li>
              <li>
                <Link href="/corporate">{nav('corporate')}</Link>
              </li>
              <li>
                <Link href="/contact">{nav('contact')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer-title">{t('newsletter')}</h2>
            <NewsletterForm />
          </div>
        </div>

        <div className="footer-base">
          <span>{t('copyright', { year, company: settings.company_name })}</span>
          <ul className="footer-legal" aria-label={t('legal')}>
            <li>
              <Link href="/privacy">{t('privacy')}</Link>
            </li>
            <li>
              <Link href="/terms">{t('terms')}</Link>
            </li>
            {settings.footer_documents.map((document) => (
              <li key={document.url}>
                <a href={document.url}>{document.label}</a>
              </li>
            ))}
            {socialLinks(settings).map((link) => (
              <li key={link.platform}>
                <a href={link.url} rel="noopener noreferrer" target="_blank">
                  {t(`social.${link.platform}`)}
                  <span className="visually-hidden">{common('opensInNewWindow')}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
```

`web/src/components/ui/ToastRegion.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { onToast, type ToastData } from '@/lib/ui/toast';

const VISIBLE_MS = 3600;

/** Região única de avisos (role="status"), montada uma vez no layout. */
export function ToastRegion() {
  const t = useTranslations('quote');
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const off = onToast((next) => {
      setToast(next);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), VISIBLE_MS);
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={toast ? 'toast is-visible' : 'toast'} role="status" aria-live="polite">
      {toast ? <span>{toast.text}</span> : null}
      {toast?.quoteLink ? <Link href="/quote-list">{t('viewList')}</Link> : null}
    </div>
  );
}
```

`web/src/app/[locale]/layout.tsx` (substitui o do P3; `metadata` vira `generateMetadata` para não ler env no import):

```tsx
import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { archivo } from '@/app/fonts';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { ToastRegion } from '@/components/ui/ToastRegion';
import { htmlLang, locales } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import { withBuildFallback } from '@/lib/api/build-fallback';
import { getSettings } from '@/lib/api/content';
import { serverEnv } from '@/lib/env';
import { organizationJsonLd } from '@/lib/seo/jsonld';
import { EMPTY_SETTINGS } from '@/lib/settings';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(serverEnv().SITE_URL),
    title: { template: '%s | Franccino', default: 'Franccino' },
  };
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    withBuildFallback(getSettings(locale), EMPTY_SETTINGS),
  ]);

  return (
    <html lang={htmlLang(locale)} className={archivo.variable}>
      <body>
        <NextIntlClientProvider>
          <a className="skip-link" href="#conteudo">
            {t('skipToContent')}
          </a>
          <JsonLd data={organizationJsonLd(settings)} />
          <SiteHeader />
          <div id="conteudo" tabIndex={-1}>
            {children}
          </div>
          <SiteFooter settings={settings} />
          <ToastRegion />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: CSS e mensagens**

`web/src/styles/chrome.css` — portar de `design/prototype/assets/styles.css` os blocos `header` (165–329, sem a regra `.icon`, que já está em `components.css`) e `footer` (927–1013), com as edições:

1. `var(--ink-2)` → `var(--ink-muted)`.
2. `.wordmark`: `font-variation-settings: 'wdth' var(--wordmark-wide);` e acrescentar `text-transform: uppercase;`.
3. Trocar `.list-count.is-bumped { transform: scale(1.28); }` por:

```css
.list-count {
  animation: count-bump var(--t-mid) var(--ease-out);
}

@keyframes count-bump {
  50% {
    transform: scale(1.28);
  }
}
```

4. Trocar as regras `.lang` e `.lang strong` por:

```css
.lang {
  display: inline-flex;
  align-items: center;
  color: var(--ink-muted);
}

.lang > * + *::before {
  content: '/';
  margin-inline: 6px;
  color: var(--ink-muted);
}

.lang strong {
  color: var(--ink);
  font-weight: 600;
}
```

5. Rodapé: `#d8d6cf` → `var(--footer-text)`, `#f2f1ed` → `var(--stone)`, `#a6a49b` → `var(--footer-muted)`, `#34342f` → `var(--footer-rule)`, `#5a5953` → `var(--line-field)` (C6). O seletor `.footer-grid h3` vira `.footer-title` e ganha `font-weight: 500; font-variation-settings: 'wdth' var(--text);`.
6. Acrescentar ao fim:

```css
.site-footer :focus-visible {
  outline-color: var(--stone);
}

.footer-brand {
  display: grid;
  gap: 12px;
  align-content: start;
}

.footer-muted {
  color: var(--footer-muted);
}

.footer-contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
}

.footer-legal {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.newsletter-form {
  display: grid;
  gap: 12px;
}

.newsletter__consent {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  font-size: 0.8125rem;
  color: var(--footer-muted);
}

.newsletter__consent input {
  margin-top: 3px;
  accent-color: var(--stone);
}

.newsletter__status {
  min-height: 1.4em;
  font-size: 0.8125rem;
  color: var(--footer-text);
}
```

`web/src/app/globals.css`: `@import '../styles/chrome.css' layer(components);`

`messages/pt.json`:

- em `nav`: `"indoor": "Casa"`, `"outdoor": "Giardini"`, e acrescentar `"planner": "Sala para montar"`, `"technical": "Área técnica"`;
- em `language`: `"short": { "pt": "PT", "en": "EN" }`;
- em `footer` (mantendo `privacy`, `terms`, `rightsReserved`):

```json
"wordmark": "Franccino",
"factory": "Fábrica: {address}",
"catalog": "Catálogo",
"service": "Atendimento",
"newsletter": "Novidades por e-mail",
"quotesWhatsapp": "WhatsApp de orçamentos",
"assistanceWhatsapp": "Assistência técnica",
"whereToFind": "Onde encontrar",
"copyright": "© {year} {company}.",
"legal": "Informações legais",
"social": {
  "instagram": "Instagram",
  "facebook": "Facebook",
  "pinterest": "Pinterest",
  "linkedin": "LinkedIn",
  "youtube": "YouTube"
}
```

- namespaces novos:

```json
"header": {
  "homeLabel": "Franccino, página inicial",
  "wordmark": "Franccino",
  "navLabel": "Principal",
  "search": "Buscar",
  "openMenu": "Abrir menu",
  "closeMenu": "Fechar menu",
  "quoteList": "Lista de orçamento, {count, plural, =0 {vazia} one {# peça} other {# peças}}",
  "quoteListShort": "Lista"
},
"quote": {
  "viewList": "Ver lista"
}
```

`messages/en.json`:

- em `nav`: `"indoor": "Casa"`, `"outdoor": "Giardini"`, `"planner": "Room planner"`, `"technical": "Technical area"`;
- em `language`: `"short": { "pt": "PT", "en": "EN" }`;
- em `footer`:

```json
"wordmark": "Franccino",
"factory": "Factory: {address}",
"catalog": "Catalogue",
"service": "Customer care",
"newsletter": "News by email",
"quotesWhatsapp": "WhatsApp for quotes",
"assistanceWhatsapp": "Technical assistance",
"whereToFind": "Where to find us",
"copyright": "© {year} {company}.",
"legal": "Legal information",
"social": {
  "instagram": "Instagram",
  "facebook": "Facebook",
  "pinterest": "Pinterest",
  "linkedin": "LinkedIn",
  "youtube": "YouTube"
}
```

- namespaces novos:

```json
"header": {
  "homeLabel": "Franccino, home page",
  "wordmark": "Franccino",
  "navLabel": "Main",
  "search": "Search",
  "openMenu": "Open menu",
  "closeMenu": "Close menu",
  "quoteList": "Quote list, {count, plural, =0 {empty} one {# piece} other {# pieces}}",
  "quoteListShort": "List"
},
"quote": {
  "viewList": "View list"
}
```

- [ ] **Step 6: Rodar e commitar**

Run: `pnpm --filter web test` → Expected: PASS.
Run: lint + typecheck + `ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` → Expected: verde. No navegador (`pnpm --filter web dev`): header fixo translúcido; abaixo de 1180 px o menu abre e fecha pelo botão e pelo Esc; Tab a partir do topo mostra o "pular para o conteúdo"; contador da lista vazio (anel) no header; rodapé escuro com foco visível.

```bash
git add web docs/api.md
git commit -m "feat(web): aplica o design system ao cabecalho, rodape e layout

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 5: Card de produto ("prancha"), adicionar à lista e trilho

**Files:**

- Create: `web/src/components/products/ProductPlate.tsx`, `web/src/components/products/QuickAddButton.tsx`, `web/src/components/products/ProductRail.tsx`, `web/src/styles/plates.css`
- Modify (reescrever): `web/src/components/catalog/ProductGrid.tsx`
- Modify: `web/src/app/globals.css`, `web/messages/{pt,en}.json`
- Test: `web/src/components/products/ProductPlate.test.tsx`

**Interfaces:**

- Consumes: `ApiImage`, `Link`, `AreaDot`, `Icon` (Task 1), `quoteActions`, `toQuoteSnapshot`, `showToast` (Task 2).
- Produces:
  - `PLATE_SIZES` (atributo `sizes` padrão das pranchas).
  - `ProductPlate({ product: ProductCard; showNew?: boolean; sizes?: string; priority?: boolean })`.
  - `type QuickAddVariant = 'plate' | 'table' | 'button'`; `QuickAddButton({ product: ProductCard; variant?: QuickAddVariant })` — adiciona 1 unidade com "acabamento a definir" e mostra aviso com link para a lista.
  - `ProductRail({ label: string; products: ProductCard[]; showNew?: boolean })`.
  - `ProductGrid({ products: ProductCard[]; showNew?: boolean; priorityCount?: number })`.
  - Classes: `plate plate__link plate__media plate__media--empty plate__media--cover plate__body plate__row plate__name plate__tags quick-add rail grid-plates`.
  - Mensagens: `catalog.newTag`, `quote.quickAdd`, `quote.addedPendingFinish`, `quote.listFull`, `quote.inList`, `quote.addShort`.

- [ ] **Step 1: Teste que falha**

`web/src/components/products/ProductPlate.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { productCard } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { ProductPlate } from './ProductPlate';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('ProductPlate', () => {
  it('links to the product and shows designer, category and area identity', () => {
    const html = renderWithIntl(
      <ProductPlate
        product={productCard({ area: { key: 'outdoor', name: 'Outdoor', brand_name: 'Franccino Giardini' } })}
      />,
    );
    expect(html).toContain('href="/products/cadeira-aura"');
    expect(html).toContain('Cadeira Aura');
    expect(html).toContain('Daniela Ferro');
    expect(html).toContain('Cadeiras');
    expect(html).toContain('area-dot--giardini');
  });

  it('shows the new tag only when asked and the product is new', () => {
    expect(renderWithIntl(<ProductPlate product={productCard()} showNew />)).toContain('tag--new');
    expect(renderWithIntl(<ProductPlate product={productCard()} />)).not.toContain('tag--new');
    expect(renderWithIntl(<ProductPlate product={productCard({ is_new: false })} showNew />)).not.toContain(
      'tag--new',
    );
  });

  it('has a labelled quick add button and survives a missing cover', () => {
    const html = renderWithIntl(<ProductPlate product={productCard({ cover: null, designer: null })} />);
    expect(html).toContain('aria-label="Adicionar Cadeira Aura à lista de orçamento"');
    expect(html).toContain('plate__media--empty');
  });
});
```

Run: `pnpm --filter web test` → Expected: FAIL.

- [ ] **Step 2: Componentes**

`web/src/components/products/QuickAddButton.tsx`:

```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import type { ProductCard } from '@/lib/api/types';
import { toQuoteSnapshot } from '@/lib/quote/snapshot';
import { quoteActions } from '@/lib/quote/store';
import { showToast } from '@/lib/ui/toast';

export type QuickAddVariant = 'plate' | 'table' | 'button';

const CLASS_BY_VARIANT: Record<QuickAddVariant, string> = {
  plate: 'quick-add',
  table: 'btn btn--ghost btn--compact',
  button: 'btn btn--ghost',
};

/** Adiciona 1 unidade sem acabamento escolhido ("a definir", conflito C2). */
export function QuickAddButton({
  product,
  variant = 'plate',
}: {
  product: ProductCard;
  variant?: QuickAddVariant;
}) {
  const t = useTranslations('quote');
  const locale = useLocale() as Locale;
  const [added, setAdded] = useState(false);

  function handleClick() {
    const status = quoteActions.add(toQuoteSnapshot(product, locale));
    if (status === 'full') {
      showToast({ text: t('listFull'), quoteLink: true });
      return;
    }
    setAdded(true);
    showToast({ text: t('addedPendingFinish', { name: product.name }), quoteLink: true });
  }

  const base = CLASS_BY_VARIANT[variant];
  return (
    <button
      type="button"
      className={added ? `${base} is-added` : base}
      aria-label={variant === 'button' ? undefined : t('quickAdd', { name: product.name })}
      onClick={handleClick}
    >
      <Icon name={added ? 'check' : 'plus'} />
      {variant === 'button' ? <span>{added ? t('inList') : t('addShort')}</span> : null}
    </button>
  );
}
```

`web/src/components/products/ProductPlate.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { AreaDot } from '@/components/ui/AreaDot';
import { Link } from '@/i18n/navigation';
import type { ProductCard } from '@/lib/api/types';
import { QuickAddButton } from './QuickAddButton';

/** Larguras reais da prancha: 1 coluna no celular, 2 no tablet, ~4 no desktop. */
export const PLATE_SIZES = '(max-width: 35rem) 100vw, (max-width: 73.75rem) 50vw, 25vw';

type ProductPlateProps = {
  product: ProductCard;
  showNew?: boolean;
  sizes?: string;
  priority?: boolean;
};

export function ProductPlate({
  product,
  showNew = false,
  sizes = PLATE_SIZES,
  priority = false,
}: ProductPlateProps) {
  const t = useTranslations('catalog');
  return (
    <article className="plate">
      <Link className="plate__link" href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}>
        <div className={product.cover ? 'plate__media' : 'plate__media plate__media--empty'}>
          {product.cover ? <ApiImage image={product.cover} sizes={sizes} priority={priority} /> : null}
        </div>
        <div className="plate__body">
          <h3 className="plate__name">{product.name}</h3>
          <div className="plate__row">
            {product.designer ? <span className="meta">{product.designer.name}</span> : <span />}
            <span className="meta">
              <AreaDot area={product.area.key} />
              {product.category.name}
            </span>
          </div>
        </div>
      </Link>
      {showNew && product.is_new ? (
        <div className="plate__tags">
          <span className="tag tag--new">{t('newTag')}</span>
        </div>
      ) : null}
      <QuickAddButton product={product} />
    </article>
  );
}
```

`web/src/components/products/ProductRail.tsx`:

```tsx
import type { ProductCard } from '@/lib/api/types';
import { ProductPlate } from './ProductPlate';

/** Trilho horizontal com rolagem por teclado (região focável, rótulo obrigatório). */
export function ProductRail({
  label,
  products,
  showNew = false,
}: {
  label: string;
  products: ProductCard[];
  showNew?: boolean;
}) {
  return (
    <div className="rail" role="region" aria-label={label} tabIndex={0}>
      {products.map((product) => (
        <ProductPlate
          key={product.id}
          product={product}
          showNew={showNew}
          sizes="(max-width: 35rem) 80vw, 340px"
        />
      ))}
    </div>
  );
}
```

`web/src/components/catalog/ProductGrid.tsx` (substitui o do P3):

```tsx
import { ProductPlate } from '@/components/products/ProductPlate';
import type { ProductCard } from '@/lib/api/types';

type ProductGridProps = {
  products: ProductCard[];
  showNew?: boolean;
  /** Quantas primeiras imagens carregam com prioridade (LCP das listagens). */
  priorityCount?: number;
};

export function ProductGrid({ products, showNew = false, priorityCount = 0 }: ProductGridProps) {
  return (
    <div className="grid-plates">
      {products.map((product, index) => (
        <ProductPlate key={product.id} product={product} showNew={showNew} priority={index < priorityCount} />
      ))}
    </div>
  );
}
```

`grep -rn "ProductGrid" web/src` — ajustar chamadas do P3 que passavam outras props (as páginas de listagem são reescritas na Task 6).

- [ ] **Step 3: CSS e mensagens**

`web/src/styles/plates.css` — portar de `design/prototype/assets/styles.css` o bloco `product plates` (508–631: `.rail`, `.grid-plates`, `.plate*`, `.quick-add*` e o `@media (hover: none)`), **sem** `.tag*` e `.area-dot*` (já em `components.css`), com as edições:

1. `.plate { grid-template-rows: auto 1fr; }` vira `grid-template-rows: 1fr;` e `box-shadow` do hover vira `var(--shadow-plate)`.
2. Acrescentar:

```css
.plate__link {
  display: grid;
  grid-template-rows: auto 1fr;
  color: inherit;
  text-decoration: none;
}

.plate:focus-within {
  box-shadow: var(--shadow-plate);
}

.plate__media--empty {
  background: var(--stone);
}

.plate__media--cover img {
  object-fit: cover;
}

.plate__name {
  font-size: 1rem;
  font-weight: 500;
}

.quick-add .icon {
  width: 18px;
  height: 18px;
}
```

`web/src/app/globals.css`: `@import '../styles/plates.css' layer(components);`

`messages/pt.json`: em `catalog` (criar o namespace) `"newTag": "Novo"`; em `quote`:

```json
"quickAdd": "Adicionar {name} à lista de orçamento",
"addedPendingFinish": "{name} está na lista, com acabamento a definir.",
"listFull": "A lista chegou ao limite de 50 itens. Envie esta lista antes de montar outra.",
"inList": "Na lista",
"addShort": "Pôr na lista"
```

`messages/en.json`: `catalog.newTag` = `"New"`; em `quote`:

```json
"quickAdd": "Add {name} to the quote list",
"addedPendingFinish": "{name} is on your list; finish to be defined.",
"listFull": "The list reached its 50-item limit. Send this list before starting another.",
"inList": "On the list",
"addShort": "Add to list"
```

- [ ] **Step 4: Rodar e commitar**

Run: `pnpm --filter web test` → Expected: PASS.
Run: lint + typecheck + `ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` → Expected: verde.

```bash
git add web
git commit -m "feat(web): adiciona card de produto com adicionar a lista e trilho de pecas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 6: Catálogo, lançamentos e tabela técnica

**Files:**

- Create: `web/src/lib/catalog/{view,area-href,card,technical}.ts`, `web/src/lib/format/file-size.ts`, `web/src/components/catalog/{CatalogListing,CatalogToolbar,ViewToggle,Pagination,TechTable,LaunchTile}.tsx`, `web/src/components/catalog/area-pages.tsx`, `web/src/styles/catalog.css`
- Modify (reescrever): `web/src/components/products/DownloadButton.tsx`, `web/src/app/[locale]/products/page.tsx`, `web/src/app/[locale]/indoor/page.tsx`, `web/src/app/[locale]/outdoor/page.tsx`, `web/src/app/[locale]/indoor/[category]/page.tsx`, `web/src/app/[locale]/outdoor/[category]/page.tsx`, `web/src/app/[locale]/launches/page.tsx`, `web/src/app/[locale]/launches/[slug]/page.tsx`
- Modify: `web/src/lib/api/catalog.ts` (`getProductDetails`), `web/src/app/globals.css`, `web/messages/{pt,en}.json`
- Delete: `web/src/components/catalog/AreaListing.tsx` (substituído por `area-pages.tsx`; antes, `grep -rn AreaListing web/src`)
- Test: `web/src/lib/catalog/{view,area-href,technical}.test.ts`, `web/src/lib/format/file-size.test.ts`, `web/src/lib/api/catalog.test.ts`, `web/src/components/catalog/TechTable.test.tsx`

**Interfaces:**

- Consumes: `getProducts`, `getProductFacets`, `getProduct`, `getArea`, `getCategory`, `getCategories`, `getLaunches`, `getLaunch`, `ProductListParams`, `ProductFacetsParams`, `ProductSort`, `parseListingParams`, `formatDimension`, `buildMetadata`, `getPathname`, `RichText`, `requestDownloadLink`, `ApiError` (P3); `ProductGrid`, `QuickAddButton`, `PLATE_SIZES` (Task 5); `Breadcrumbs`, `AreaDot`, `Icon`, `AppHref` (Task 1); `withBuildFallback` (Task 4).
- Produces:
  - `lib/catalog/view.ts`: `type CatalogView = 'grid' | 'table'`, `parseCatalogView(value)`, `type ListingPatch = { category?; designer?; q?; sort?; page?; view? }`, `listingQuery(params, view, patch?): Record<string, string>` (troca de filtro volta à página 1; `view=table` só quando tabela), `type FacetOption`, `type FilterOption = { value: string; label: string; count: number | null }`, `toFilterOption(option)`.
  - `lib/catalog/area-href.ts`: `productsListingHref(params, view)` e `areaListingHref(area, params, view)` → `(patch: ListingPatch) => AppHref` (na área, categoria vira rota `/indoor/[category]`).
  - `lib/catalog/card.ts`: `toProductCard(detail): ProductCard`.
  - `lib/catalog/technical.ts`: `primaryDimension(dimensions): Dimension | null`, `type TechnicalRow = { product: ProductCard; dimension: Dimension | null; files: DownloadFile[] }`, `toTechnicalRow(detail)`.
  - `lib/format/file-size.ts`: `formatFileSize(bytes, locale)`.
  - `catalog.ts`: `getProductDetails(locale, slugs): Promise<ProductDetail[]>` (ordem mantida, 404 descartado).
  - `DownloadButton({ file: DownloadFile; variant?: 'card' | 'link' })`.
  - `TechTable({ rows: TechnicalRow[] })`, `ViewToggle({ view, hrefFor: (view) => AppHref })`, `CatalogToolbar(…)`, `Pagination({ meta, hrefFor: (page) => AppHref, label })`, `LaunchTile({ launch })`.
  - `CatalogListing(props: CatalogListingProps)` (Server Component assíncrono).
  - `area-pages.tsx`: `type SearchParams`, `areaMetadata(area, locale)`, `AreaPage({ area, locale, searchParams })`, `areaCategoryMetadata(area, locale, slug)`, `AreaCategoryPage({ area, locale, slug, searchParams })`, `areaCategoryStaticParams(area, locale)`.

- [ ] **Step 1: Testes que falham**

`web/src/lib/catalog/view.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { listingQuery, parseCatalogView, toFilterOption } from './view';

describe('catalog view and query', () => {
  it('parses the view', () => {
    expect(parseCatalogView('table')).toBe('table');
    expect(parseCatalogView(undefined)).toBe('grid');
    expect(parseCatalogView(['table'])).toBe('grid');
  });

  it('keeps filters and page, and adds the table view', () => {
    const params = { category: 'cadeiras', designer: 'sergio-matos', page: 3 };
    expect(listingQuery(params, 'grid')).toEqual({
      category: 'cadeiras',
      designer: 'sergio-matos',
      page: '3',
    });
    expect(listingQuery(params, 'table', { page: 4 })).toEqual({
      category: 'cadeiras',
      designer: 'sergio-matos',
      page: '4',
      view: 'table',
    });
    expect(listingQuery(params, 'table', { view: 'grid' })).not.toHaveProperty('view');
  });

  it('goes back to the first page when a filter changes and drops empty values', () => {
    expect(listingQuery({ category: 'cadeiras', page: 3 }, 'grid', { designer: 'la-mamba' })).toEqual({
      category: 'cadeiras',
      designer: 'la-mamba',
    });
    expect(listingQuery({ category: 'cadeiras', q: '' }, 'grid', { category: undefined })).toEqual({});
  });

  it('normalizes facet options by slug or id', () => {
    expect(toFilterOption({ slug: 'cadeiras', name: 'Cadeiras', count: 12 })).toEqual({
      value: 'cadeiras',
      label: 'Cadeiras',
      count: 12,
    });
    expect(toFilterOption({ id: 4, name: 'Madeiras', count: 3 })).toEqual({
      value: '4',
      label: 'Madeiras',
      count: 3,
    });
  });
});
```

`web/src/lib/catalog/area-href.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { areaListingHref, productsListingHref } from './area-href';

describe('listing hrefs', () => {
  it('keeps /products and moves filters to the query', () => {
    const hrefFor = productsListingHref({ designer: 'la-mamba', page: 2 }, 'grid');
    expect(hrefFor({ page: 3 })).toEqual({
      pathname: '/products',
      query: { designer: 'la-mamba', page: '3' },
    });
    expect(hrefFor({ category: 'mesas' })).toEqual({
      pathname: '/products',
      query: { category: 'mesas', designer: 'la-mamba' },
    });
  });

  it('turns the category into the area category route', () => {
    const hrefFor = areaListingHref('outdoor', { category: 'poltronas', page: 3 }, 'table');
    expect(hrefFor({ page: 4 })).toEqual({
      pathname: '/outdoor/[category]',
      params: { category: 'poltronas' },
      query: { page: '4', view: 'table' },
    });
    expect(hrefFor({ category: 'sofas' })).toEqual({
      pathname: '/outdoor/[category]',
      params: { category: 'sofas' },
      query: { view: 'table' },
    });
    expect(hrefFor({ category: undefined })).toEqual({ pathname: '/outdoor', query: { view: 'table' } });
    expect(areaListingHref('indoor', {}, 'grid')({ view: 'table' })).toEqual({
      pathname: '/indoor',
      query: { view: 'table' },
    });
  });
});
```

`web/src/lib/catalog/technical.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { productDetail } from '@/test/fixtures';
import { toProductCard } from './card';
import { primaryDimension, toTechnicalRow } from './technical';

describe('technical rows', () => {
  it('picks the first dimension that has a value', () => {
    const empty = {
      label: 'Base',
      width: null,
      depth: null,
      height: null,
      seat_height: null,
      diameter: null,
    };
    const round = { label: null, width: null, depth: null, height: 750, seat_height: null, diameter: 1300 };
    expect(primaryDimension([empty, round])).toBe(round);
    expect(primaryDimension([empty])).toBeNull();
  });

  it('keeps only card fields, the main dimension and the files', () => {
    const file = {
      id: 9,
      type: 'technical_sheet' as const,
      title: 'Ficha técnica',
      format: 'PDF',
      size: 1_200_000,
    };
    const detail = productDetail({ files: [file] });
    expect(toProductCard(detail)).toEqual({
      id: 12,
      slug: 'cadeira-aura',
      name: 'Cadeira Aura',
      area: detail.area,
      category: detail.category,
      designer: detail.designer,
      cover: detail.cover,
      is_new: true,
    });
    expect(toTechnicalRow(detail)).toEqual({
      product: toProductCard(detail),
      dimension: detail.dimensions[0],
      files: [file],
    });
  });
});
```

`web/src/lib/format/file-size.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatFileSize } from './file-size';

describe('formatFileSize', () => {
  it('uses KB below one megabyte and MB with one decimal above', () => {
    expect(formatFileSize(880_640, 'pt')).toBe('860 KB');
    expect(formatFileSize(1_258_291, 'pt')).toBe('1,2 MB');
    expect(formatFileSize(1_258_291, 'en')).toBe('1.2 MB');
    expect(formatFileSize(500, 'en')).toBe('1 KB');
  });
});
```

`web/src/lib/api/catalog.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { productDetail } from '@/test/fixtures';
import { getProductDetails } from './catalog';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('getProductDetails', () => {
  afterEach(() => vi.restoreAllMocks());

  it('fetches each slug, keeps the order and drops the missing ones', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const slug = /\/products\/([^?]+)/.exec(String(input))?.[1] ?? '';
      return slug === 'sumida'
        ? json({ message: 'Not found.' }, 404)
        : json({ data: productDetail({ slug, name: slug }) });
    });
    const details = await getProductDetails('pt', ['b', 'sumida', 'a']);
    expect(details.map((detail) => detail.slug)).toEqual(['b', 'a']);
  });
});
```

`web/src/components/catalog/TechTable.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { productCard } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { TechTable } from './TechTable';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('TechTable', () => {
  it('renders dimensions, files and the add button per row', () => {
    const html = renderWithIntl(
      <TechTable
        rows={[
          {
            product: productCard(),
            dimension: {
              label: null,
              width: 520,
              depth: 560,
              height: 800,
              seat_height: null,
              diameter: null,
            },
            files: [{ id: 9, type: 'block_2d', title: 'Bloco 2D', format: 'DWG', size: 880_640 }],
          },
          {
            product: productCard({ id: 13, slug: 'mesa-joey', name: 'Mesa Joey' }),
            dimension: null,
            files: [],
          },
        ]}
      />,
    );
    expect(html).toContain('<caption');
    expect(html).toContain('scope="col"');
    expect(html).toContain('L 52 × P 56 × A 80 cm');
    expect(html).toContain('DWG');
    expect(html).toContain('aria-label="Baixar Bloco 2D (DWG)"');
    expect(html).toContain('aria-label="Adicionar Mesa Joey à lista de orçamento"');
  });
});
```

Run: `pnpm --filter web test` → Expected: FAIL.

- [ ] **Step 2: Módulos puros e API**

`web/src/lib/catalog/view.ts`:

```ts
import type { ProductListParams, ProductSort } from '@/lib/api/catalog';
import type { Facets } from '@/lib/api/types';

export type CatalogView = 'grid' | 'table';

export function parseCatalogView(value: string | string[] | undefined): CatalogView {
  return value === 'table' ? 'table' : 'grid';
}

export type ListingPatch = {
  category?: string;
  designer?: string;
  q?: string;
  sort?: ProductSort;
  page?: number;
  view?: CatalogView;
};

const QUERY_KEYS = ['category', 'designer', 'collection', 'line', 'finish', 'q', 'sort'] as const;

/** Query da listagem (sem `area`, que está na rota). Trocar filtro volta para a página 1. */
export function listingQuery(
  params: ProductListParams,
  view: CatalogView,
  patch: ListingPatch = {},
): Record<string, string> {
  const merged: ProductListParams = { ...params };
  let filtersChanged = false;
  if ('category' in patch) {
    merged.category = patch.category;
    filtersChanged = true;
  }
  if ('designer' in patch) {
    merged.designer = patch.designer;
    filtersChanged = true;
  }
  if ('q' in patch) {
    merged.q = patch.q;
    filtersChanged = true;
  }
  if ('sort' in patch) {
    merged.sort = patch.sort;
    filtersChanged = true;
  }
  if ('page' in patch) {
    merged.page = patch.page;
  } else if (filtersChanged) {
    merged.page = undefined;
  }

  const query: Record<string, string> = {};
  for (const key of QUERY_KEYS) {
    const value = merged[key];
    if (value !== undefined && value !== '') {
      query[key] = String(value);
    }
  }
  if (merged.page !== undefined && merged.page > 1) {
    query.page = String(merged.page);
  }
  if ((patch.view ?? view) === 'table') {
    query.view = 'table';
  }
  return query;
}

export type FacetOption = Facets['categories'][number];
export type FilterOption = { value: string; label: string; count: number | null };

export function toFilterOption(option: FacetOption): FilterOption {
  return {
    value: 'slug' in option ? option.slug : String(option.id),
    label: option.name,
    count: option.count,
  };
}
```

`web/src/lib/catalog/area-href.ts`:

```ts
import type { AppHref } from '@/i18n/navigation';
import type { ProductListParams } from '@/lib/api/catalog';
import type { AreaRef } from '@/lib/api/types';
import { listingQuery, type CatalogView, type ListingPatch } from './view';

export function productsListingHref(params: ProductListParams, view: CatalogView) {
  return (patch: ListingPatch): AppHref => ({
    pathname: '/products',
    query: listingQuery(params, view, patch),
  });
}

/** Na área, a categoria é rota (`/indoor/[category]`), não query. */
export function areaListingHref(area: AreaRef['key'], params: ProductListParams, view: CatalogView) {
  return (patch: ListingPatch): AppHref => {
    const category = 'category' in patch ? patch.category : params.category;
    const rest: ListingPatch = { ...patch };
    delete rest.category;
    if ('category' in patch && !('page' in patch)) {
      rest.page = undefined;
    }
    const query = listingQuery({ ...params, category: undefined }, view, rest);
    if (area === 'outdoor') {
      return category
        ? { pathname: '/outdoor/[category]', params: { category }, query }
        : { pathname: '/outdoor', query };
    }
    return category
      ? { pathname: '/indoor/[category]', params: { category }, query }
      : { pathname: '/indoor', query };
  };
}
```

`web/src/lib/catalog/card.ts`:

```ts
import type { ProductCard, ProductDetail } from '@/lib/api/types';

/** Recorta o detalhe para o formato de card (props enxutas para Client Components). */
export function toProductCard(detail: ProductDetail): ProductCard {
  const { id, slug, name, area, category, designer, cover, is_new } = detail;
  return { id, slug, name, area, category, designer, cover, is_new };
}
```

`web/src/lib/catalog/technical.ts`:

```ts
import type { Dimension, DownloadFile, ProductCard, ProductDetail } from '@/lib/api/types';
import { toProductCard } from './card';

export function primaryDimension(dimensions: Dimension[]): Dimension | null {
  return (
    dimensions.find((dimension) =>
      [dimension.width, dimension.depth, dimension.height, dimension.diameter].some(
        (value) => value !== null,
      ),
    ) ?? null
  );
}

export type TechnicalRow = { product: ProductCard; dimension: Dimension | null; files: DownloadFile[] };

export function toTechnicalRow(detail: ProductDetail): TechnicalRow {
  return {
    product: toProductCard(detail),
    dimension: primaryDimension(detail.dimensions),
    files: detail.files,
  };
}
```

`web/src/lib/format/file-size.ts`:

```ts
import type { Locale } from '@/i18n/config';

const MB = 1024 * 1024;

export function formatFileSize(bytes: number, locale: Locale): string {
  const tag = locale === 'pt' ? 'pt-BR' : 'en';
  if (bytes < MB) {
    const kb = Math.max(1, Math.round(bytes / 1024));
    return `${new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }).format(kb)} KB`;
  }
  return `${new Intl.NumberFormat(tag, { maximumFractionDigits: 1 }).format(bytes / MB)} MB`;
}
```

`web/src/lib/api/catalog.ts` — acrescentar ao fim:

```ts
/**
 * Detalhe de várias peças (tabela técnica e sala: o `ProductCard` não traz medidas nem
 * arquivos — proposta A4 do plano P4). Cada busca usa o cache por tag de `getProduct`.
 */
export async function getProductDetails(locale: Locale, slugs: string[]): Promise<ProductDetail[]> {
  const details = await Promise.all(slugs.map((slug) => getProduct(locale, slug)));
  return details.filter((detail): detail is ProductDetail => detail !== null);
}
```

- [ ] **Step 3: Componentes**

`web/src/components/products/DownloadButton.tsx` (substitui o do P3):

```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { ApiError } from '@/lib/api/errors';
import { requestDownloadLink } from '@/lib/api/forms';
import type { DownloadFile } from '@/lib/api/types';
import { formatFileSize } from '@/lib/format/file-size';

type State = 'idle' | 'loading' | 'failed' | 'rateLimited' | 'unavailable';

export function DownloadButton({
  file,
  variant = 'card',
}: {
  file: DownloadFile;
  variant?: 'card' | 'link';
}) {
  const t = useTranslations('downloads');
  const locale = useLocale() as Locale;
  const [state, setState] = useState<State>('idle');

  async function handleClick() {
    setState('loading');
    try {
      const { url } = await requestDownloadLink(file.id);
      setState('idle');
      window.location.assign(url);
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setState('rateLimited');
      } else if (error instanceof ApiError && error.status === 404) {
        setState('unavailable');
      } else {
        setState('failed');
      }
    }
  }

  const busy = state === 'loading';
  const message =
    state === 'failed'
      ? t('failed')
      : state === 'rateLimited'
        ? t('rateLimited')
        : state === 'unavailable'
          ? t('unavailable')
          : null;

  if (variant === 'link') {
    return (
      <span className="download-link">
        <button
          type="button"
          className="file-link"
          onClick={handleClick}
          disabled={busy}
          aria-busy={busy}
          aria-label={t('linkLabel', { title: file.title, format: file.format })}
        >
          {file.format}
        </button>
        {message ? (
          <span className="download-error" role="alert">
            {message}
          </span>
        ) : null}
      </span>
    );
  }

  const size = file.size ? formatFileSize(file.size, locale) : null;
  return (
    <div className="download">
      <button type="button" onClick={handleClick} disabled={busy} aria-busy={busy}>
        <Icon name="download" />
        <strong>{file.title}</strong>
        <small>{size ? t('formatAndSize', { format: file.format, size }) : file.format}</small>
      </button>
      {message ? (
        <p className="download-error" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
```

`web/src/components/catalog/TechTable.tsx`:

```tsx
import { useLocale, useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { DownloadButton } from '@/components/products/DownloadButton';
import { QuickAddButton } from '@/components/products/QuickAddButton';
import { AreaDot } from '@/components/ui/AreaDot';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import type { TechnicalRow } from '@/lib/catalog/technical';
import { formatDimension } from '@/lib/format/dimensions';

/** Assinatura do DESIGN.md para arquitetos: densa, com rolagem horizontal própria. */
export function TechTable({ rows }: { rows: TechnicalRow[] }) {
  const t = useTranslations('catalog.table');
  const locale = useLocale() as Locale;
  return (
    <div className="table-scroll" role="region" aria-label={t('label')} tabIndex={0}>
      <table className="tech-table">
        <caption className="visually-hidden">{t('caption')}</caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">{t('image')}</span>
            </th>
            <th scope="col">{t('piece')}</th>
            <th scope="col">{t('area')}</th>
            <th scope="col">{t('designer')}</th>
            <th scope="col">{t('dimensions')}</th>
            <th scope="col">{t('files')}</th>
            <th scope="col">
              <span className="visually-hidden">{t('list')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ product, dimension, files }) => (
            <tr key={product.id}>
              <td>
                {product.cover ? <ApiImage image={product.cover} sizes="64px" className="thumb" /> : null}
              </td>
              <th scope="row">
                <Link href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}>
                  <strong>{product.name}</strong>
                </Link>
                <div className="meta">{product.category.name}</div>
              </th>
              <td>
                <AreaDot area={product.area.key} />
                {product.area.brand_name}
              </td>
              <td>{product.designer?.name}</td>
              <td className="num nowrap">{dimension ? formatDimension(dimension, locale) : t('empty')}</td>
              <td>
                {files.length > 0 ? (
                  <div className="file-links">
                    {files.map((file) => (
                      <DownloadButton key={file.id} file={file} variant="link" />
                    ))}
                  </div>
                ) : (
                  t('empty')
                )}
              </td>
              <td>
                <QuickAddButton product={product} variant="table" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

`web/src/components/catalog/ViewToggle.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { Link, type AppHref } from '@/i18n/navigation';
import type { CatalogView } from '@/lib/catalog/view';

export function ViewToggle({
  view,
  hrefFor,
}: {
  view: CatalogView;
  hrefFor: (view: CatalogView) => AppHref;
}) {
  const t = useTranslations('catalog.view');
  return (
    <div className="view-toggle" role="group" aria-label={t('label')}>
      <Link href={hrefFor('grid')} scroll={false} aria-current={view === 'grid' ? 'true' : undefined}>
        <Icon name="grid" />
        <span>{t('grid')}</span>
      </Link>
      <Link href={hrefFor('table')} scroll={false} aria-current={view === 'table' ? 'true' : undefined}>
        <Icon name="table" />
        <span>{t('table')}</span>
      </Link>
    </div>
  );
}
```

`web/src/components/catalog/CatalogToolbar.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { Link, type AppHref } from '@/i18n/navigation';
import type { CatalogView, FilterOption, ListingPatch } from '@/lib/catalog/view';
import { ViewToggle } from './ViewToggle';

type CatalogToolbarProps = {
  view: CatalogView;
  hrefFor: (patch: ListingPatch) => AppHref;
  categoryOptions: FilterOption[];
  activeCategory?: string;
  designerOptions: FilterOption[];
  activeDesigner?: string;
  /** Caminho público da listagem (form GET do filtro de designer, sem JS). */
  formAction: string;
  /** Demais filtros da URL, preservados no envio do form. */
  hiddenQuery: Record<string, string>;
};

export function CatalogToolbar(props: CatalogToolbarProps) {
  const t = useTranslations('catalog.filters');
  return (
    <div className="toolbar">
      {props.categoryOptions.length > 0 ? (
        <nav className="chips" aria-label={t('categories')}>
          <Link
            className="chip"
            href={props.hrefFor({ category: undefined })}
            scroll={false}
            aria-current={props.activeCategory ? undefined : 'true'}
          >
            {t('all')}
          </Link>
          {props.categoryOptions.map((option) => (
            <Link
              key={option.value}
              className="chip"
              href={props.hrefFor({ category: option.value })}
              scroll={false}
              aria-current={option.value === props.activeCategory ? 'true' : undefined}
            >
              {option.label}
            </Link>
          ))}
        </nav>
      ) : (
        <span />
      )}
      <div className="toolbar__end">
        {props.designerOptions.length > 0 ? (
          <form className="filter-form" action={props.formAction} method="get">
            {Object.entries(props.hiddenQuery).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <label className="visually-hidden" htmlFor="designer-filter">
              {t('designer')}
            </label>
            <select id="designer-filter" name="designer" defaultValue={props.activeDesigner ?? ''}>
              <option value="">{t('allDesigners')}</option>
              {props.designerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.count === null
                    ? option.label
                    : t('facetOption', { name: option.label, count: option.count })}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn--ghost btn--compact">
              {t('apply')}
            </button>
          </form>
        ) : null}
        <ViewToggle view={props.view} hrefFor={(next) => props.hrefFor({ view: next })} />
      </div>
    </div>
  );
}
```

(O filtro de designer usa form com botão "Filtrar" em vez de navegar ao mudar o `<select>`: mudar de contexto no `change` falha WCAG 3.2.2.)

`web/src/components/catalog/Pagination.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { Link, type AppHref } from '@/i18n/navigation';
import type { Paginated } from '@/lib/api/types';

type PaginationProps = {
  meta: Paginated<unknown>['meta'];
  hrefFor: (page: number) => AppHref;
  label: string;
};

export function Pagination({ meta, hrefFor, label }: PaginationProps) {
  const t = useTranslations('catalog.pagination');
  if (meta.last_page <= 1) {
    return null;
  }
  const current = meta.current_page;
  const last = meta.last_page;
  return (
    <nav className="pagination" aria-label={label}>
      {current > 1 ? (
        <Link className="link-arrow" href={hrefFor(current - 1)} rel="prev">
          {t('previous')}
        </Link>
      ) : (
        <span />
      )}
      <span className="meta num">{t('status', { current, last })}</span>
      {current < last ? (
        <Link className="link-arrow" href={hrefFor(current + 1)} rel="next">
          {t('next')}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
```

`web/src/components/catalog/LaunchTile.tsx`:

```tsx
import { ApiImage } from '@/components/media/ApiImage';
import { PLATE_SIZES } from '@/components/products/ProductPlate';
import { Link } from '@/i18n/navigation';
import type { LaunchCard } from '@/lib/api/types';

export function LaunchTile({ launch }: { launch: LaunchCard }) {
  return (
    <article className="plate">
      <Link className="plate__link" href={{ pathname: '/launches/[slug]', params: { slug: launch.slug } }}>
        <div
          className={launch.cover ? 'plate__media plate__media--cover' : 'plate__media plate__media--empty'}
        >
          {launch.cover ? <ApiImage image={launch.cover} sizes={PLATE_SIZES} /> : null}
        </div>
        <div className="plate__body">
          <h2 className="plate__name">{launch.title}</h2>
          {launch.year ? <p className="meta num">{launch.year}</p> : null}
          {launch.summary ? <p className="meta">{launch.summary}</p> : null}
        </div>
      </Link>
    </article>
  );
}
```

`web/src/components/catalog/CatalogListing.tsx`:

```tsx
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import type { Locale } from '@/i18n/config';
import { Link, type AppHref } from '@/i18n/navigation';
import {
  getProductDetails,
  getProductFacets,
  getProducts,
  type ProductFacetsParams,
  type ProductListParams,
} from '@/lib/api/catalog';
import { toTechnicalRow } from '@/lib/catalog/technical';
import {
  listingQuery,
  toFilterOption,
  type CatalogView,
  type FilterOption,
  type ListingPatch,
} from '@/lib/catalog/view';
import { CatalogToolbar } from './CatalogToolbar';
import { Pagination } from './Pagination';
import { ProductGrid } from './ProductGrid';
import { TechTable } from './TechTable';

export type CatalogListingProps = {
  locale: Locale;
  title: string;
  intro: ReactNode;
  crumbs: BreadcrumbItem[];
  /** Filtros fixos da rota (ex.: `{ area: 'indoor' }`). */
  apiParams: ProductListParams;
  /** Filtros vindos da URL. */
  params: ProductListParams;
  view: CatalogView;
  hrefFor: (patch: ListingPatch) => AppHref;
  formAction: string;
  /** Sem valor: categorias das facetas. */
  categoryOptions?: FilterOption[];
  /** A categoria já está no caminho (páginas de categoria): não repetir na query do form. */
  categoryInPath?: boolean;
  facetsParams: ProductFacetsParams;
};

const PER_PAGE = 24;

export async function CatalogListing(props: CatalogListingProps) {
  const { locale, params, view, hrefFor } = props;
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: 'catalog' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const query: ProductListParams = { ...props.apiParams, ...params, per_page: PER_PAGE };
  if (!query.designer) {
    delete query.designer;
  }
  const [page, facets] = await Promise.all([
    getProducts(locale, query),
    getProductFacets(locale, props.facetsParams),
  ]);
  const rows =
    view === 'table'
      ? (
          await getProductDetails(
            locale,
            page.data.map((product) => product.slug),
          )
        ).map(toTechnicalRow)
      : [];

  const hiddenQuery = listingQuery(props.categoryInPath ? { ...params, category: undefined } : params, view, {
    designer: undefined,
  });

  return (
    <main className="wrap catalog">
      <Breadcrumbs label={common('breadcrumb')} items={props.crumbs} />
      <div className="catalog-head">
        <div className="catalog-head__copy">
          <h1>{props.title}</h1>
          {props.intro}
        </div>
        <p className="meta num">{t('count', { count: page.meta.total })}</p>
      </div>
      <CatalogToolbar
        view={view}
        hrefFor={hrefFor}
        categoryOptions={props.categoryOptions ?? facets.categories.map(toFilterOption)}
        activeCategory={params.category}
        designerOptions={facets.designers.map(toFilterOption)}
        activeDesigner={params.designer}
        formAction={props.formAction}
        hiddenQuery={hiddenQuery}
      />
      <section className="catalog-results" aria-label={t('resultsLabel')}>
        {page.data.length === 0 ? (
          <div className="empty">
            <h2>{t('empty.title')}</h2>
            <p className="lead">{t('empty.body')}</p>
            <Link
              className="btn btn--ghost"
              href={hrefFor({ category: undefined, designer: undefined, q: undefined })}
            >
              {t('empty.clear')}
            </Link>
          </div>
        ) : view === 'table' ? (
          <TechTable rows={rows} />
        ) : (
          <ProductGrid products={page.data} priorityCount={4} />
        )}
      </section>
      <Pagination
        meta={page.meta}
        hrefFor={(next) => hrefFor({ page: next })}
        label={t('pagination.label')}
      />
    </main>
  );
}
```

`web/src/components/catalog/area-pages.tsx`:

```tsx
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { RichText } from '@/components/content/RichText';
import type { Locale } from '@/i18n/config';
import { getPathname } from '@/i18n/navigation';
import { withBuildFallback } from '@/lib/api/build-fallback';
import { getArea, getCategories, getCategory } from '@/lib/api/catalog';
import { parseListingParams } from '@/lib/api/listing-params';
import type { AreaRef } from '@/lib/api/types';
import { areaListingHref } from '@/lib/catalog/area-href';
import { parseCatalogView } from '@/lib/catalog/view';
import { buildMetadata } from '@/lib/seo/metadata';
import { CatalogListing } from './CatalogListing';

type AreaKey = AreaRef['key'];
export type SearchParams = Record<string, string | string[] | undefined>;

function areaHref(area: AreaKey) {
  return area === 'outdoor' ? ({ pathname: '/outdoor' } as const) : ({ pathname: '/indoor' } as const);
}

function categoryHref(area: AreaKey, category: string) {
  return area === 'outdoor'
    ? ({ pathname: '/outdoor/[category]', params: { category } } as const)
    : ({ pathname: '/indoor/[category]', params: { category } } as const);
}

export async function areaMetadata(area: AreaKey, locale: Locale): Promise<Metadata> {
  const [detail, t] = await Promise.all([
    getArea(locale, area),
    getTranslations({ locale, namespace: 'pages' }),
  ]);
  const href = areaHref(area);
  return buildMetadata({
    locale,
    href,
    title: detail?.seo.title ?? detail?.brand_name ?? t(`${area}.title`),
    description: detail?.seo.description ?? null,
    image: detail?.seo.image ?? detail?.cover ?? null,
    alternates: { pt: href, en: href },
  });
}

export async function AreaPage({
  area,
  locale,
  searchParams,
}: {
  area: AreaKey;
  locale: Locale;
  searchParams: SearchParams;
}) {
  const detail = await getArea(locale, area);
  if (!detail) {
    notFound();
  }
  const common = await getTranslations({ locale, namespace: 'common' });
  const params = parseListingParams(searchParams);
  const view = parseCatalogView(searchParams.view);
  return (
    <CatalogListing
      locale={locale}
      title={detail.brand_name}
      intro={<RichText html={detail.description} className="lead" />}
      crumbs={[{ label: common('home'), href: '/' }, { label: detail.brand_name }]}
      apiParams={{ area }}
      params={params}
      view={view}
      hrefFor={areaListingHref(area, params, view)}
      formAction={getPathname({ href: areaHref(area), locale })}
      categoryOptions={detail.categories.map((category) => ({
        value: category.slug,
        label: category.name,
        count: category.product_count,
      }))}
      facetsParams={{ area, category: params.category }}
    />
  );
}

export async function areaCategoryMetadata(area: AreaKey, locale: Locale, slug: string): Promise<Metadata> {
  const category = await getCategory(locale, slug);
  if (!category) {
    return {};
  }
  return buildMetadata({
    locale,
    href: categoryHref(area, slug),
    title: category.seo.title ?? category.name,
    description: category.seo.description,
    image: category.seo.image ?? category.cover,
    alternates: {
      pt: category.slugs.pt ? categoryHref(area, category.slugs.pt) : null,
      en: category.slugs.en ? categoryHref(area, category.slugs.en) : null,
    },
  });
}

export async function AreaCategoryPage(props: {
  area: AreaKey;
  locale: Locale;
  slug: string;
  searchParams: SearchParams;
}) {
  const { area, locale, slug, searchParams } = props;
  const [detail, category] = await Promise.all([getArea(locale, area), getCategory(locale, slug)]);
  if (!detail || !category) {
    notFound();
  }
  const common = await getTranslations({ locale, namespace: 'common' });
  const params = { ...parseListingParams(searchParams), category: slug };
  const view = parseCatalogView(searchParams.view);
  return (
    <CatalogListing
      locale={locale}
      title={category.name}
      intro={<RichText html={category.description} className="lead" />}
      crumbs={[
        { label: common('home'), href: '/' },
        { label: detail.brand_name, href: areaHref(area) },
        { label: category.name },
      ]}
      apiParams={{ area }}
      params={params}
      view={view}
      hrefFor={areaListingHref(area, params, view)}
      formAction={getPathname({ href: categoryHref(area, slug), locale })}
      categoryOptions={detail.categories.map((item) => ({
        value: item.slug,
        label: item.name,
        count: item.product_count,
      }))}
      categoryInPath
      facetsParams={{ area, category: slug }}
    />
  );
}

export async function areaCategoryStaticParams(
  area: AreaKey,
  locale: Locale,
): Promise<{ category: string }[]> {
  const categories = await withBuildFallback(getCategories(locale, { area }), []);
  return categories.map((category) => ({ category: category.slug }));
}
```

(Se `RichText` do P3 não aceitar `html={null}`, use `{detail.description ? <RichText … /> : null}`.)

- [ ] **Step 4: Páginas**

`web/src/app/[locale]/products/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CatalogListing } from '@/components/catalog/CatalogListing';
import type { SearchParams } from '@/components/catalog/area-pages';
import type { Locale } from '@/i18n/config';
import { getPathname } from '@/i18n/navigation';
import { parseListingParams } from '@/lib/api/listing-params';
import { productsListingHref } from '@/lib/catalog/area-href';
import { parseCatalogView } from '@/lib/catalog/view';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const view = parseCatalogView((await searchParams).view);
  const t = await getTranslations({ locale, namespace: 'catalog' });
  const key = view === 'table' ? 'technical' : 'products';
  const href = { pathname: '/products' } as const;
  return buildMetadata({
    locale: locale as Locale,
    href,
    title: t(`${key}.title`),
    description: t(`${key}.intro`),
    alternates: { pt: href, en: href },
  });
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const search = await searchParams;
  const listing = parseListingParams(search);
  const view = parseCatalogView(search.view);
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: 'catalog' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
  const key = view === 'table' ? 'technical' : 'products';
  return (
    <CatalogListing
      locale={locale}
      title={t(`${key}.title`)}
      intro={<p className="lead">{t(`${key}.intro`)}</p>}
      crumbs={[{ label: common('home'), href: '/' }, { label: t(`${key}.title`) }]}
      apiParams={{}}
      params={listing}
      view={view}
      hrefFor={productsListingHref(listing, view)}
      formAction={getPathname({ href: '/products', locale })}
      facetsParams={{ q: listing.q }}
    />
  );
}
```

`web/src/app/[locale]/indoor/page.tsx` (e `outdoor/page.tsx` igual, trocando `'indoor'` por `'outdoor'` e o nome da função para `OutdoorPage`):

```tsx
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AreaPage, areaMetadata, type SearchParams } from '@/components/catalog/area-pages';
import type { Locale } from '@/i18n/config';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return areaMetadata('indoor', locale as Locale);
}

export default async function IndoorPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AreaPage area="indoor" locale={locale as Locale} searchParams={await searchParams} />;
}
```

`web/src/app/[locale]/indoor/[category]/page.tsx` (e `outdoor/[category]/page.tsx` igual, com `'outdoor'` e `OutdoorCategoryPage`):

```tsx
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import {
  AreaCategoryPage,
  areaCategoryMetadata,
  areaCategoryStaticParams,
  type SearchParams,
} from '@/components/catalog/area-pages';
import type { Locale } from '@/i18n/config';

type Props = { params: Promise<{ locale: string; category: string }>; searchParams: Promise<SearchParams> };

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return areaCategoryStaticParams('indoor', params.locale as Locale);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  return areaCategoryMetadata('indoor', locale as Locale, category);
}

export default async function IndoorCategoryPage({ params, searchParams }: Props) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  return (
    <AreaCategoryPage
      area="indoor"
      locale={locale as Locale}
      slug={category}
      searchParams={await searchParams}
    />
  );
}
```

`web/src/app/[locale]/launches/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LaunchTile } from '@/components/catalog/LaunchTile';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import type { Locale } from '@/i18n/config';
import { withBuildFallback } from '@/lib/api/build-fallback';
import { getLaunches } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'catalog.launches' });
  const href = { pathname: '/launches' } as const;
  return buildMetadata({
    locale: locale as Locale,
    href,
    title: t('title'),
    description: t('intro'),
    alternates: { pt: href, en: href },
  });
}

export default async function LaunchesPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, launches] = await Promise.all([
    getTranslations({ locale, namespace: 'catalog.launches' }),
    getTranslations({ locale, namespace: 'common' }),
    withBuildFallback(getLaunches(locale), []),
  ]);
  return (
    <main className="wrap catalog">
      <Breadcrumbs
        label={common('breadcrumb')}
        items={[{ label: common('home'), href: '/' }, { label: t('title') }]}
      />
      <div className="catalog-head">
        <div className="catalog-head__copy">
          <h1>{t('title')}</h1>
          <p className="lead">{t('intro')}</p>
        </div>
      </div>
      {launches.length > 0 ? (
        <div className="grid-plates catalog-results">
          {launches.map((launch) => (
            <LaunchTile key={launch.id} launch={launch} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p className="lead">{t('empty')}</p>
        </div>
      )}
    </main>
  );
}
```

`web/src/app/[locale]/launches/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { SearchParams } from '@/components/catalog/area-pages';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { TechTable } from '@/components/catalog/TechTable';
import { ViewToggle } from '@/components/catalog/ViewToggle';
import { RichText } from '@/components/content/RichText';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import type { Locale } from '@/i18n/config';
import { withBuildFallback } from '@/lib/api/build-fallback';
import { getProductDetails } from '@/lib/api/catalog';
import { getLaunch, getLaunches } from '@/lib/api/content';
import { toTechnicalRow } from '@/lib/catalog/technical';
import { parseCatalogView } from '@/lib/catalog/view';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<SearchParams> };

const launchHref = (slug: string) => ({ pathname: '/launches/[slug]', params: { slug } }) as const;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const launches = await withBuildFallback(getLaunches(params.locale as Locale), []);
  return launches.map((launch) => ({ slug: launch.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const launch = await getLaunch(locale as Locale, slug);
  if (!launch) {
    return {};
  }
  return buildMetadata({
    locale: locale as Locale,
    href: launchHref(slug),
    title: launch.seo.title ?? launch.title,
    description: launch.seo.description ?? launch.summary,
    image: launch.seo.image ?? launch.cover,
    alternates: {
      pt: launch.slugs.pt ? launchHref(launch.slugs.pt) : null,
      en: launch.slugs.en ? launchHref(launch.slugs.en) : null,
    },
  });
}

export default async function LaunchPage({ params, searchParams }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const launch = await getLaunch(locale, slug);
  if (!launch) {
    notFound();
  }
  const view = parseCatalogView((await searchParams).view);
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: 'catalog' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
  const rows =
    view === 'table'
      ? (
          await getProductDetails(
            locale,
            launch.products.map((product) => product.slug),
          )
        ).map(toTechnicalRow)
      : [];

  return (
    <main className="wrap catalog">
      <Breadcrumbs
        label={common('breadcrumb')}
        items={[
          { label: common('home'), href: '/' },
          { label: t('launches.title'), href: '/launches' },
          { label: launch.title },
        ]}
      />
      <div className="catalog-head">
        <div className="catalog-head__copy">
          <h1>{launch.title}</h1>
          {launch.year ? <p className="meta num">{launch.year}</p> : null}
          {launch.summary ? <p className="lead">{launch.summary}</p> : null}
        </div>
        <p className="meta num">{t('count', { count: launch.products.length })}</p>
      </div>
      {launch.description ? <RichText html={launch.description} className="catalog-description" /> : null}
      <div className="toolbar toolbar--end">
        <ViewToggle
          view={view}
          hrefFor={(next) => ({ ...launchHref(slug), query: next === 'table' ? { view: 'table' } : {} })}
        />
      </div>
      <section className="catalog-results" aria-label={t('resultsLabel')}>
        {view === 'table' ? (
          <TechTable rows={rows} />
        ) : (
          <ProductGrid products={launch.products} showNew priorityCount={4} />
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 5: CSS e mensagens**

`web/src/styles/catalog.css` — portar de `design/prototype/assets/styles.css` os blocos `technical table` (836–887) e `catalog` até `.view-toggle button[aria-pressed='true']` (1390–1442), com as edições:

1. `var(--ink-2)` → `var(--ink-muted)`; `.tech-table tr:hover td { background: #fafaf8 }` → `var(--row-hover)`.
2. `.toolbar select` → `.filter-form select` com `border: 1px solid var(--line-field)`.
3. `.view-toggle button` → `.view-toggle a` (acrescentar `text-decoration: none; color: inherit;`) e `.view-toggle button[aria-pressed='true']` → `.view-toggle a[aria-current='true']`.
4. `.file-links a` → `.file-link`.
5. Acrescentar:

```css
.catalog {
  padding-bottom: 32px;
}

.catalog-head__copy {
  display: grid;
  gap: 12px;
}

.catalog-head--tight {
  padding-top: 8px;
}

.catalog-description {
  max-width: 68ch;
  margin-bottom: 24px;
}

.toolbar--end {
  justify-content: flex-end;
}

.toolbar__end {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-form {
  display: flex;
  gap: 8px;
  align-items: center;
}

.catalog-results {
  padding-bottom: 32px;
}

.tech-table th[scope='row'] {
  font-weight: 400;
  background: transparent;
  color: var(--ink);
  font-size: 0.9375rem;
  letter-spacing: 0;
  white-space: normal;
}

.file-link {
  background: none;
  border: 0;
  padding: 4px 0;
  cursor: pointer;
  font-size: 0.8125rem;
  text-decoration: underline;
  color: var(--ink);
}

.download-error {
  display: block;
  font-size: 0.8125rem;
  color: var(--alert);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-block: 24px 96px;
}
```

`web/src/app/globals.css`: `@import '../styles/catalog.css' layer(components);`

`messages/pt.json` — em `catalog` (ao lado de `newTag`):

```json
"products": { "title": "Todas as peças", "intro": "O catálogo completo das linhas Casa e Giardini." },
"technical": {
  "title": "Área técnica",
  "intro": "Peças com medidas e arquivos para especificação. Abra a peça para ver acabamentos."
},
"launches": {
  "title": "Lançamentos",
  "intro": "As coleções e peças lançadas pela Franccino.",
  "empty": "Nenhum lançamento publicado no momento."
},
"count": "{count, plural, =0 {Nenhuma peça} one {# peça} other {# peças}}",
"resultsLabel": "Resultados",
"filters": {
  "categories": "Categorias",
  "all": "Todas",
  "designer": "Designer",
  "allDesigners": "Todos os designers",
  "facetOption": "{name} ({count})",
  "apply": "Filtrar"
},
"view": { "label": "Visualização", "grid": "Grade", "table": "Tabela técnica" },
"empty": {
  "title": "Nenhuma peça com esses filtros.",
  "body": "Tire um filtro ou fale com a equipe: muitas peças são feitas sob medida.",
  "clear": "Limpar filtros"
},
"pagination": { "label": "Páginas", "previous": "Anterior", "next": "Próxima", "status": "Página {current} de {last}" },
"table": {
  "label": "Tabela técnica",
  "caption": "Peças com linha, designer, medidas e arquivos técnicos",
  "image": "Imagem",
  "piece": "Peça",
  "area": "Linha",
  "designer": "Designer",
  "dimensions": "Medidas",
  "files": "Arquivos",
  "list": "Lista de orçamento",
  "empty": "—"
}
```

e o namespace `downloads`:

```json
"downloads": {
  "linkLabel": "Baixar {title} ({format})",
  "formatAndSize": "{format} · {size}",
  "failed": "Não foi possível gerar o link agora. Tente de novo.",
  "rateLimited": "Muitos downloads seguidos. Aguarde um minuto.",
  "unavailable": "Arquivo indisponível no momento."
}
```

`messages/en.json`:

```json
"products": { "title": "All pieces", "intro": "The complete Casa and Giardini catalogue." },
"technical": {
  "title": "Technical area",
  "intro": "Pieces with dimensions and files for specification. Open a piece to see its finishes."
},
"launches": {
  "title": "Novelties",
  "intro": "Collections and pieces launched by Franccino.",
  "empty": "No novelties published right now."
},
"count": "{count, plural, =0 {No pieces} one {# piece} other {# pieces}}",
"resultsLabel": "Results",
"filters": {
  "categories": "Categories",
  "all": "All",
  "designer": "Designer",
  "allDesigners": "All designers",
  "facetOption": "{name} ({count})",
  "apply": "Filter"
},
"view": { "label": "View", "grid": "Grid", "table": "Technical table" },
"empty": {
  "title": "No pieces match these filters.",
  "body": "Remove a filter or talk to the team: many pieces are made to order.",
  "clear": "Clear filters"
},
"pagination": { "label": "Pages", "previous": "Previous", "next": "Next", "status": "Page {current} of {last}" },
"table": {
  "label": "Technical table",
  "caption": "Pieces with line, designer, dimensions and technical files",
  "image": "Image",
  "piece": "Piece",
  "area": "Line",
  "designer": "Designer",
  "dimensions": "Dimensions",
  "files": "Files",
  "list": "Quote list",
  "empty": "—"
}
```

```json
"downloads": {
  "linkLabel": "Download {title} ({format})",
  "formatAndSize": "{format} · {size}",
  "failed": "We could not create the link right now. Please try again.",
  "rateLimited": "Too many downloads in a row. Wait a minute.",
  "unavailable": "File unavailable right now."
}
```

- [ ] **Step 6: Rodar e commitar**

Run: `pnpm --filter web test` → Expected: PASS.
Run: lint + typecheck + `ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` → Expected: verde. Com a API: `/pt/indoor` (chips levam a `/pt/indoor/<categoria>`), filtro de designer por teclado, `/pt/produtos?view=table` com downloads funcionando, `/en/novelties`.

```bash
git add web
git commit -m "feat(web): adiciona listagens do catalogo com filtros, tabela tecnica e lancamentos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 7: Acabamentos, quantidade e ações de orçamento da peça

**Files:**

- Create: `web/src/lib/product/finish-selection.ts`, `web/src/lib/ui/roving.ts`, `web/src/components/ui/QuantityStepper.tsx`, `web/src/components/products/FinishSelector.tsx`, `web/src/components/products/ProductConfigurator.tsx`, `web/src/styles/product.css`
- Modify: `web/src/app/globals.css`, `web/messages/{pt,en}.json`
- Test: `web/src/lib/product/finish-selection.test.ts`, `web/src/lib/ui/roving.test.ts`, `web/src/components/products/ProductConfigurator.test.tsx`

**Interfaces:**

- Consumes: `ApiImage`, `Link`, `Icon` (Task 1); `quoteActions`, `useQuoteCount`, `toQuoteSnapshot`, `formatFinishes`, `whatsappUrl`, `QuoteFinish` (Task 2); `toProductCard` (Task 6).
- Produces:
  - `lib/product/finish-selection.ts`: `type FinishGroup = ProductDetail['finishes'][number]`, `type FinishSelection = Readonly<Record<string, number>>`, `initialSelection(groups)` (só grupo com opção única), `selectFinish(selection, group, id)`, `selectedFinishes(groups, selection): QuoteFinish[]`, `pendingGroups(groups, selection): string[]`.
  - `lib/ui/roving.ts`: `nextRovingIndex(count, current, key): number | null` (setas, Home, End; cíclico).
  - `QuantityStepper({ value, onChange, label, min?, max? })`.
  - `FinishSelector({ groups, selection, onSelect, note })` (abas acessíveis + grupo de rádio com foco itinerante).
  - `type ConfiguratorProduct = ProductCard & Pick<ProductDetail, 'finishes'>`; `ProductConfigurator({ product, whatsapp, finishesNote, children? })` — `children` entra entre acabamentos e o bloco de orçamento (a Task 8 põe as medidas ali).
  - Classes de `product.css` (galeria, painel, blocos, amostras, medidas, compra, downloads, faixa do designer).

- [ ] **Step 1: Testes que falham**

`web/src/lib/product/finish-selection.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { productDetail } from '@/test/fixtures';
import { initialSelection, pendingGroups, selectedFinishes, selectFinish } from './finish-selection';

const groups = productDetail().finishes;

describe('finish selection', () => {
  it('preselects only groups with a single option (no fake "standard" finish)', () => {
    expect(initialSelection(groups)).toEqual({ Tecido: 201 });
  });

  it('selects and lists finishes in group order', () => {
    const selection = selectFinish(initialSelection(groups), 'Madeira', 102);
    expect(selectedFinishes(groups, selection)).toEqual([
      { id: 102, group: 'Madeira', name: 'Freijó', code: 'MD-02' },
      { id: 201, group: 'Tecido', name: 'Linho cru', code: 'TC-110' },
    ]);
  });

  it('ignores ids that do not belong to the group', () => {
    expect(selectedFinishes(groups, { Madeira: 999 })).toEqual([]);
  });

  it('lists the groups still to be chosen', () => {
    expect(pendingGroups(groups, { Tecido: 201 })).toEqual(['Madeira']);
    expect(pendingGroups(groups, { Tecido: 201, Madeira: 101 })).toEqual([]);
  });
});
```

`web/src/lib/ui/roving.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { nextRovingIndex } from './roving';

describe('nextRovingIndex', () => {
  it('moves with arrows, wraps around and jumps with Home/End', () => {
    expect(nextRovingIndex(3, 0, 'ArrowRight')).toBe(1);
    expect(nextRovingIndex(3, 2, 'ArrowRight')).toBe(0);
    expect(nextRovingIndex(3, 0, 'ArrowLeft')).toBe(2);
    expect(nextRovingIndex(3, 0, 'ArrowDown')).toBe(1);
    expect(nextRovingIndex(3, 1, 'ArrowUp')).toBe(0);
    expect(nextRovingIndex(3, 1, 'Home')).toBe(0);
    expect(nextRovingIndex(3, 1, 'End')).toBe(2);
  });

  it('ignores other keys and empty groups', () => {
    expect(nextRovingIndex(3, 1, 'a')).toBeNull();
    expect(nextRovingIndex(0, 0, 'ArrowRight')).toBeNull();
  });
});
```

`web/src/components/products/ProductConfigurator.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { toProductCard } from '@/lib/catalog/card';
import { productDetail } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { ProductConfigurator } from './ProductConfigurator';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

const detail = productDetail();
const product = { ...toProductCard(detail), finishes: detail.finishes };

describe('ProductConfigurator', () => {
  it('renders accessible finish tabs and radios without a fake default', () => {
    const html = renderWithIntl(
      <ProductConfigurator product={product} whatsapp={null} finishesNote="Amostras nas lojas." />,
    );
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('role="radio"');
    expect(html).not.toContain('aria-checked="true"');
    expect(html).toContain('Amostras nas lojas.');
  });

  it('prefills whatsapp with quantity, product and pending finish', () => {
    const html = renderWithIntl(
      <ProductConfigurator product={product} whatsapp="5511942900080" finishesNote={null} />,
    );
    expect(html).toContain('https://wa.me/5511942900080?text=');
    expect(html).toContain('Cadeira%20Aura');
    expect(html).toContain('href="/stores"');
  });

  it('hides whatsapp without a number and skips finishes when the product has none', () => {
    const html = renderWithIntl(
      <ProductConfigurator product={{ ...product, finishes: [] }} whatsapp={null} finishesNote={null} />,
    );
    expect(html).not.toContain('wa.me');
    expect(html).not.toContain('role="radiogroup"');
  });
});
```

Run: `pnpm --filter web test` → Expected: FAIL.

- [ ] **Step 2: Módulos puros**

`web/src/lib/product/finish-selection.ts`:

```ts
import type { ProductDetail } from '@/lib/api/types';
import type { QuoteFinish } from '@/lib/quote/types';

export type FinishGroup = ProductDetail['finishes'][number];
/** Nome do grupo → id do acabamento escolhido. */
export type FinishSelection = Readonly<Record<string, number>>;

/** A API não tem acabamento "padrão" (conflito C2): só pré-seleciona grupo com uma única opção. */
export function initialSelection(groups: FinishGroup[]): FinishSelection {
  const selection: Record<string, number> = {};
  for (const group of groups) {
    const [only] = group.items;
    if (group.items.length === 1 && only) {
      selection[group.group] = only.id;
    }
  }
  return selection;
}

export function selectFinish(selection: FinishSelection, group: string, id: number): FinishSelection {
  return { ...selection, [group]: id };
}

export function selectedFinishes(groups: FinishGroup[], selection: FinishSelection): QuoteFinish[] {
  const result: QuoteFinish[] = [];
  for (const group of groups) {
    const item = group.items.find((candidate) => candidate.id === selection[group.group]);
    if (item) {
      result.push({ id: item.id, group: group.group, name: item.name, code: item.code });
    }
  }
  return result;
}

export function pendingGroups(groups: FinishGroup[], selection: FinishSelection): string[] {
  return groups
    .filter(
      (group) => group.items.length > 0 && !group.items.some((item) => item.id === selection[group.group]),
    )
    .map((group) => group.group);
}
```

`web/src/lib/ui/roving.ts`:

```ts
/** Próximo índice num grupo com foco itinerante (abas, rádios): setas cíclicas, Home e End. */
export function nextRovingIndex(count: number, current: number, key: string): number | null {
  if (count === 0) {
    return null;
  }
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
```

- [ ] **Step 3: Componentes**

`web/src/components/ui/QuantityStepper.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { Icon } from './Icon';

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
};

export function QuantityStepper({ value, onChange, label, min = 1, max = 99 }: QuantityStepperProps) {
  const t = useTranslations('quote');
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        aria-label={t('decrease')}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Icon name="minus" />
      </button>
      <output className="num" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        aria-label={t('increase')}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Icon name="plus" />
      </button>
    </div>
  );
}
```

`web/src/components/products/FinishSelector.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import type { FinishGroup, FinishSelection } from '@/lib/product/finish-selection';
import { nextRovingIndex } from '@/lib/ui/roving';

type FinishSelectorProps = {
  /** Não vazio (o chamador só renderiza quando há acabamentos). */
  groups: FinishGroup[];
  selection: FinishSelection;
  onSelect: (group: string, id: number) => void;
  note: string | null;
};

export function FinishSelector({ groups, selection, onSelect, note }: FinishSelectorProps) {
  const t = useTranslations('product.finishes');
  const baseId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const swatchRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const group = groups[activeIndex] ?? groups[0]!;
  const selectedId = selection[group.group];
  const selectedItem = group.items.find((item) => item.id === selectedId) ?? null;
  const focusIndex = Math.max(
    0,
    group.items.findIndex((item) => item.id === selectedId),
  );
  const tabbed = groups.length > 1;

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }
    const next = nextRovingIndex(groups.length, index, event.key);
    if (next === null) {
      return;
    }
    event.preventDefault();
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }

  function handleSwatchKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextRovingIndex(group.items.length, index, event.key);
    const item = next === null ? undefined : group.items[next];
    if (next === null || !item) {
      return;
    }
    event.preventDefault();
    onSelect(group.group, item.id);
    swatchRefs.current[next]?.focus();
  }

  return (
    <section className="block" aria-labelledby={`${baseId}-title`}>
      <div className="block__title">
        <h2 id={`${baseId}-title`}>{t('title')}</h2>
        {tabbed ? (
          <div className="tabs" role="tablist" aria-label={t('groups')}>
            {groups.map((item, index) => (
              <button
                key={item.group}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`${baseId}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-controls={`${baseId}-panel`}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >
                {item.group}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div
        id={`${baseId}-panel`}
        role={tabbed ? 'tabpanel' : undefined}
        aria-labelledby={tabbed ? `${baseId}-tab-${activeIndex}` : undefined}
      >
        <div className="swatches" role="radiogroup" aria-label={t('groupLabel', { group: group.group })}>
          {group.items.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => {
                swatchRefs.current[index] = element;
              }}
              type="button"
              role="radio"
              className="swatch"
              aria-checked={item.id === selectedId}
              aria-label={item.code ? t('swatchLabel', { name: item.name, code: item.code }) : item.name}
              tabIndex={index === focusIndex ? 0 : -1}
              onClick={() => onSelect(group.group, item.id)}
              onKeyDown={(event) => handleSwatchKey(event, index)}
            >
              {item.swatch ? (
                <ApiImage image={item.swatch} sizes="46px" />
              ) : (
                <span className="swatch__fallback" aria-hidden="true">
                  {item.code ?? item.name.slice(0, 2)}
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="swatch-name" aria-live="polite">
          {selectedItem ? (
            <>
              <strong>{selectedItem.name}</strong>
              {selectedItem.code ? (
                <span className="meta">{t('code', { code: selectedItem.code })}</span>
              ) : null}
            </>
          ) : (
            <span className="meta">{t('choose', { group: group.group })}</span>
          )}
        </p>
      </div>
      {note ? <p className="meta">{note}</p> : null}
    </section>
  );
}
```

`web/src/components/products/ProductConfigurator.tsx`:

```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import type { ProductCard, ProductDetail } from '@/lib/api/types';
import { whatsappUrl } from '@/lib/contact-links';
import {
  initialSelection,
  pendingGroups,
  selectedFinishes,
  selectFinish,
  type FinishSelection,
} from '@/lib/product/finish-selection';
import { useQuoteCount } from '@/lib/quote/hooks';
import { formatFinishes } from '@/lib/quote/message';
import { toQuoteSnapshot } from '@/lib/quote/snapshot';
import { quoteActions } from '@/lib/quote/store';
import { FinishSelector } from './FinishSelector';

export type ConfiguratorProduct = ProductCard & Pick<ProductDetail, 'finishes'>;

type ProductConfiguratorProps = {
  product: ConfiguratorProduct;
  whatsapp: string | null;
  finishesNote: string | null;
  /** Conteúdo entre acabamentos e orçamento (medidas, na página de produto). */
  children?: ReactNode;
};

type Feedback = { kind: 'added' | 'full'; text: string };

export function ProductConfigurator({ product, whatsapp, finishesNote, children }: ProductConfiguratorProps) {
  const t = useTranslations('product');
  const q = useTranslations('quote');
  const common = useTranslations('common');
  const locale = useLocale() as Locale;
  const count = useQuoteCount();
  const [selection, setSelection] = useState<FinishSelection>(() => initialSelection(product.finishes));
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const finishes = selectedFinishes(product.finishes, selection);
  const pending = pendingGroups(product.finishes, selection);
  const summary = formatFinishes(finishes, q('pendingFinish'));
  const whatsappHref = whatsappUrl(
    whatsapp,
    t('whatsappText', { quantity, name: product.name, finishes: summary }),
  );

  function handleAdd() {
    const status = quoteActions.add({ ...toQuoteSnapshot(product, locale, finishes), quantity });
    if (status === 'full') {
      setFeedback({ kind: 'full', text: q('listFull') });
      return;
    }
    setFeedback({ kind: 'added', text: t('added', { quantity, name: product.name, finishes: summary }) });
    setJustAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 2400);
  }

  return (
    <>
      {product.finishes.length > 0 ? (
        <FinishSelector
          groups={product.finishes}
          selection={selection}
          onSelect={(group, id) => setSelection((current) => selectFinish(current, group, id))}
          note={finishesNote}
        />
      ) : null}

      {children}

      <section className="block buy" aria-label={t('buyLabel')}>
        {pending.length > 0 ? (
          <p className="meta">{t('pendingHint', { groups: pending.join(', ') })}</p>
        ) : null}
        <div className="buy__row">
          <QuantityStepper value={quantity} onChange={setQuantity} label={t('quantity')} />
          <button type="button" className={justAdded ? 'btn is-added' : 'btn'} onClick={handleAdd}>
            <Icon name={justAdded ? 'check' : 'list'} />
            <span>{justAdded ? t('inList') : t('addToList')}</span>
          </button>
        </div>
        <div className="buy__secondary">
          {whatsappHref ? (
            <a className="btn btn--ghost" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" />
              <span>{t('whatsapp')}</span>
              <span className="visually-hidden">{common('opensInNewWindow')}</span>
            </a>
          ) : null}
          <Link className="btn btn--ghost" href="/stores">
            <Icon name="pin" />
            <span>{t('whereToBuy')}</span>
          </Link>
        </div>
        <p className={feedback?.kind === 'full' ? 'feedback feedback--alert' : 'feedback'} role="status">
          {feedback ? <span>{feedback.text}</span> : null}
          {feedback?.kind === 'added' ? (
            <Link href="/quote-list">{q('viewListCount', { count })}</Link>
          ) : null}
        </p>
      </section>
    </>
  );
}
```

- [ ] **Step 4: CSS e mensagens**

`web/src/styles/product.css` — portar de `design/prototype/assets/styles.css` o bloco `product page` (1034–1388), `.designer-strip--text` (1936–1938) e, do `@media (max-width: 640px)` (1821–1838), as regras de `.designer-strip > :first-child` e `.buy__secondary`, com as edições:

1. `var(--ink-2)` → `var(--ink-muted)`; `var(--ok)` → `var(--garden)`.
2. Remover `.gallery__stage.is-swapping img` e `.stage-3d__label` (protótipo).
3. `.thumbs button[aria-current='true']` → `.thumbs button[aria-pressed='true']`.
4. `.swatch span` → `.swatch img, .swatch__fallback` com `object-fit: cover;`.
5. `.downloads a` → `.download > button`, acrescentando `width: 100%; background: none; border: 0; border-bottom: 1px solid var(--line); text-align: left; cursor: pointer; color: inherit;`; `.downloads a:hover strong` → `.download > button:hover strong`.
6. Acrescentar:

```css
.swatch__fallback {
  display: grid;
  place-items: center;
  font-size: 0.6875rem;
  background: var(--stone);
}

.stepper button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.feedback {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
}

.feedback--alert {
  color: var(--alert);
}

.feedback a {
  color: inherit;
  font-weight: 600;
}
```

`web/src/app/globals.css`: `@import '../styles/product.css' layer(components);`

`messages/pt.json` — namespace `product` novo (o `products` do P3 continua) e chaves em `quote`:

```json
"product": {
  "finishes": {
    "title": "Acabamentos",
    "groups": "Grupos de acabamento",
    "groupLabel": "Acabamentos de {group}",
    "swatchLabel": "{name}, código {code}",
    "code": "Código {code}",
    "choose": "Escolha um acabamento de {group}."
  },
  "buyLabel": "Orçamento",
  "pendingHint": "Acabamento a definir: {groups}. Escolha agora ou combine com a equipe.",
  "quantity": "Quantidade",
  "addToList": "Adicionar à lista de orçamento",
  "inList": "Na lista",
  "whatsapp": "WhatsApp",
  "whereToBuy": "Onde comprar",
  "added": "{quantity} × {name} · {finishes}.",
  "whatsappText": "Olá! Tenho interesse em {quantity} × {name} ({finishes}). Pode me ajudar com o orçamento?"
}
```

```json
"pendingFinish": "acabamento a definir",
"viewListCount": "Ver lista ({count})",
"decrease": "Diminuir",
"increase": "Aumentar"
```

`messages/en.json`:

```json
"product": {
  "finishes": {
    "title": "Finishes",
    "groups": "Finish groups",
    "groupLabel": "{group} finishes",
    "swatchLabel": "{name}, code {code}",
    "code": "Code {code}",
    "choose": "Choose a {group} finish."
  },
  "buyLabel": "Quote",
  "pendingHint": "Finish to be defined: {groups}. Choose now or agree it with the team.",
  "quantity": "Quantity",
  "addToList": "Add to quote list",
  "inList": "On the list",
  "whatsapp": "WhatsApp",
  "whereToBuy": "Where to buy",
  "added": "{quantity} × {name} · {finishes}.",
  "whatsappText": "Hello! I am interested in {quantity} × {name} ({finishes}). Could you help me with a quote?"
}
```

```json
"pendingFinish": "finish to be defined",
"viewListCount": "View list ({count})",
"decrease": "Decrease",
"increase": "Increase"
```

- [ ] **Step 5: Rodar e commitar**

Run: `pnpm --filter web test` → Expected: PASS.
Run: lint + typecheck + `ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` → Expected: verde.

```bash
git add web
git commit -m "feat(web): adiciona selecao de acabamentos, quantidade e acoes de orcamento da peca

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 8: Página de produto (galeria, 3D, medidas, downloads, designer, relacionados)

**Files:**

- Create: `web/src/lib/product/dimension-drawing.ts`, `web/src/lib/product/gallery.ts`, `web/src/components/products/{DimensionDrawing,DimensionsBlock,ProductStage,ProductDownloads,DesignerStrip}.tsx`
- Modify (reescrever): `web/src/components/products/ModelViewer.tsx`, `web/src/types/model-viewer.d.ts`, `web/src/app/[locale]/products/[slug]/page.tsx`
- Modify: `web/src/lib/format/dimensions.ts` (`formatCentimeters`), `web/src/lib/api/catalog.ts` (`getAllProductSlugs`), `web/messages/{pt,en}.json`
- Test: `web/src/lib/product/dimension-drawing.test.ts`, `web/src/lib/product/gallery.test.ts`, `web/src/lib/format/dimensions.test.ts` (caso novo), `web/src/lib/api/catalog.test.ts` (caso novo), `web/src/components/products/DimensionsBlock.test.tsx`, `web/src/components/products/ProductStage.test.tsx`

**Interfaces:**

- Consumes: `getProduct`, `getProducts`, `getDesigner`, `getSettings`, `buildMetadata`, `absoluteUrl`, `productJsonLd`, `breadcrumbJsonLd`, `JsonLd`, `RichText`, `ApiImage`, `getPathname` (P3); `Breadcrumbs`, `AreaDot`, `Icon`, `areaPath`, `AppHref` (Task 1); `ContactForm` (Task 3); `withBuildFallback`, `EMPTY_SETTINGS` (Task 4); `ProductRail` (Task 5); `DownloadButton`, `toProductCard` (Task 6); `ProductConfigurator`, `nextRovingIndex` (Task 7).
- Produces:
  - `formatCentimeters(mm, locale): string`.
  - `getAllProductSlugs(locale): Promise<string[]>` (todas as páginas de `/products`, 48 por página).
  - `DRAWING_SCALE`, `type DrawingGeometry`, `computeDrawing(dimension): DrawingGeometry | null` (vista frontal + lateral na mesma escala, como no protótipo).
  - `galleryImages(product): Image[]` (capa + galeria sem repetir).
  - `DimensionDrawing({ geometry, labels })`, `DimensionsBlock({ dimensions })`, `ProductStage({ images, name, model })` (lê `?view=3d` no cliente), `ModelViewer({ src, alt })`, `ProductDownloads({ files })`, `DesignerStrip({ designer })`.
  - Página `/products/[slug]` estática por `generateStaticParams`, com JSON-LD Product e BreadcrumbList.

- [ ] **Step 1: Testes que falham**

`web/src/lib/format/dimensions.test.ts` — acrescentar:

```ts
import { formatCentimeters } from './dimensions';

describe('formatCentimeters', () => {
  it('converts millimetres with the locale separator', () => {
    expect(formatCentimeters(605, 'pt')).toBe('60,5');
    expect(formatCentimeters(605, 'en')).toBe('60.5');
    expect(formatCentimeters(5200, 'pt')).toBe('520');
  });
});
```

(juntar o import com o `import { formatDimension } from './dimensions';` existente.)

`web/src/lib/product/dimension-drawing.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { computeDrawing } from './dimension-drawing';

const dim = (overrides = {}) => ({
  label: null,
  width: 520,
  depth: 560,
  height: 800,
  seat_height: 460,
  diameter: null,
  ...overrides,
});

describe('computeDrawing', () => {
  it('draws front and side views on the same scale', () => {
    const geometry = computeDrawing(dim())!;
    expect(geometry.round).toBe(false);
    expect(geometry.front.width).toBeCloseTo(83.2);
    expect(geometry.front.height).toBeCloseTo(128);
    expect(geometry.side!.x).toBeCloseTo(187.2);
    expect(geometry.side!.width).toBeCloseTo(89.6);
    expect(geometry.viewWidth).toBeCloseTo(320.8);
    expect(geometry.viewHeight).toBeCloseTo(226);
    expect(geometry.baseY).toBeCloseTo(172);
    expect(geometry.seatY).toBeCloseTo(98.4);
    expect(geometry).toMatchObject({ widthMm: 520, depthMm: 560, heightMm: 800, seatMm: 460 });
  });

  it('uses the diameter for round pieces, without a depth label', () => {
    const geometry = computeDrawing(
      dim({ width: null, depth: null, diameter: 1300, height: 750, seat_height: null }),
    )!;
    expect(geometry.round).toBe(true);
    expect(geometry.widthMm).toBe(1300);
    expect(geometry.depthMm).toBeNull();
    expect(geometry.side!.width).toBeCloseTo(208);
    expect(geometry.seatY).toBeNull();
  });

  it('drops the side view without depth and gives up without height or width', () => {
    expect(computeDrawing(dim({ depth: null }))!.side).toBeNull();
    expect(computeDrawing(dim({ height: null }))).toBeNull();
    expect(computeDrawing(dim({ width: null }))).toBeNull();
  });
});
```

`web/src/lib/product/gallery.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { image } from '@/test/fixtures';
import { galleryImages } from './gallery';

describe('galleryImages', () => {
  it('puts the cover first and removes repeated images', () => {
    const cover = image({ id: 1 });
    const ambient = image({ id: 2 });
    expect(galleryImages({ cover, gallery: [cover, ambient] }).map((item) => item.id)).toEqual([1, 2]);
    expect(galleryImages({ cover: null, gallery: [ambient] }).map((item) => item.id)).toEqual([2]);
  });
});
```

`web/src/lib/api/catalog.test.ts` — acrescentar dentro do arquivo (importar `productCard` de `@/test/fixtures` e `getAllProductSlugs` de `./catalog`):

```ts
describe('getAllProductSlugs', () => {
  afterEach(() => vi.restoreAllMocks());

  it('walks every page of the listing', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const page = Number(new URL(String(input)).searchParams.get('page') ?? '1');
      return json({
        data: [productCard({ slug: `p${page}` })],
        links: { first: null, last: null, prev: null, next: null },
        meta: { current_page: page, last_page: 3, per_page: 48, total: 3 },
      });
    });
    await expect(getAllProductSlugs('pt')).resolves.toEqual(['p1', 'p2', 'p3']);
  });
});
```

`web/src/components/products/DimensionsBlock.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { DimensionsBlock } from './DimensionsBlock';

const chair = { label: null, width: 520, depth: 560, height: 800, seat_height: 460, diameter: null };

describe('DimensionsBlock', () => {
  it('lists the measures in cm with a described drawing', () => {
    const html = renderWithIntl(<DimensionsBlock dimensions={[chair]} />);
    expect(html).toContain('<dt>Largura</dt><dd>52</dd>');
    expect(html).toContain('<dt>Altura do assento</dt><dd>46</dd>');
    expect(html).toContain(
      'aria-label="Desenho técnico com as medidas: largura 52 cm, profundidade 56 cm, altura 80 cm, altura do assento 46 cm"',
    );
    expect(html).not.toContain('role="tablist"');
  });

  it('switches to diameter for round pieces and offers tabs for variants', () => {
    const round = {
      label: 'Redonda',
      width: null,
      depth: null,
      height: 750,
      seat_height: null,
      diameter: 1300,
    };
    const html = renderWithIntl(<DimensionsBlock dimensions={[round, { ...chair, label: 'Retangular' }]} />);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('<dt>Diâmetro</dt><dd>130</dd>');
    expect(html).toContain('Retangular');
  });

  it('renders nothing when there are no values', () => {
    const empty = { label: null, width: null, depth: null, height: null, seat_height: null, diameter: null };
    expect(renderWithIntl(<DimensionsBlock dimensions={[empty]} />)).toBe('');
  });
});
```

`web/src/components/products/ProductStage.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { image } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { ProductStage } from './ProductStage';

describe('ProductStage', () => {
  it('shows only photos when there is no 3d model, with the first image eager', () => {
    const html = renderWithIntl(<ProductStage images={[image()]} name="Cadeira Aura" model={null} />);
    expect(html).not.toContain('aria-pressed');
    expect(html).toContain('loading="eager"');
  });

  it('offers the 3d toggle but starts on photos on the server', () => {
    const html = renderWithIntl(
      <ProductStage
        images={[image()]}
        name="Cadeira Aura"
        model={{ url: 'https://cdn.test/aura.glb', size: null }}
      />,
    );
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain('<model-viewer');
  });

  it('shows thumbnails only when there is more than one image', () => {
    const html = renderWithIntl(
      <ProductStage images={[image({ id: 1 }), image({ id: 2 })]} name="Aura" model={null} />,
    );
    expect(html).toContain('class="thumbs"');
    expect(html).toContain('aria-label="Foto 2 de 2"');
  });
});
```

Run: `pnpm --filter web test` → Expected: FAIL.

- [ ] **Step 2: Módulos puros e API**

`web/src/lib/format/dimensions.ts` — acrescentar:

```ts
/** Milímetros → centímetros com até 1 casa, no separador do idioma (lista de medidas e desenho). */
export function formatCentimeters(mm: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en', { maximumFractionDigits: 1 }).format(
    mm / 10,
  );
}
```

(se o arquivo do P3 ainda não importa `Locale`, acrescente `import type { Locale } from '@/i18n/config';`.)

`web/src/lib/api/catalog.ts` — acrescentar:

```ts
const SLUGS_PER_PAGE = 48;

/** Todos os slugs publicados no idioma (para `generateStaticParams` da página de produto). */
export async function getAllProductSlugs(locale: Locale): Promise<string[]> {
  const first = await getProducts(locale, { per_page: SLUGS_PER_PAGE });
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.meta.last_page - 1) }, (_, index) =>
      getProducts(locale, { per_page: SLUGS_PER_PAGE, page: index + 2 }),
    ),
  );
  return [first, ...rest].flatMap((page) => page.data.map((product) => product.slug));
}
```

`web/src/lib/product/dimension-drawing.ts`:

```ts
import type { Dimension } from '@/lib/api/types';

/** px por mm: mesma escala do protótipo (o SVG se ajusta ao container). */
export const DRAWING_SCALE = 0.16;
const PAD = 44;
const GAP = 60;
const BASE_EXTRA = 10;

export type DrawingRect = { x: number; y: number; width: number; height: number };

export type DrawingGeometry = {
  viewWidth: number;
  viewHeight: number;
  round: boolean;
  front: DrawingRect;
  side: DrawingRect | null;
  baseY: number;
  seatY: number | null;
  widthMm: number;
  /** `null` em peças redondas (a lateral mostra o diâmetro, sem cota própria). */
  depthMm: number | null;
  heightMm: number;
  seatMm: number | null;
};

export function computeDrawing(dimension: Dimension): DrawingGeometry | null {
  const round = dimension.diameter !== null && dimension.width === null;
  const widthMm = dimension.width ?? dimension.diameter;
  const heightMm = dimension.height;
  if (widthMm === null || heightMm === null) {
    return null;
  }
  const sideMm = round ? dimension.diameter : dimension.depth;
  const w = widthMm * DRAWING_SCALE;
  const h = heightMm * DRAWING_SCALE;
  const front: DrawingRect = { x: PAD, y: PAD, width: w, height: h };
  const side: DrawingRect | null =
    sideMm !== null ? { x: PAD + w + GAP, y: PAD, width: sideMm * DRAWING_SCALE, height: h } : null;
  const baseY = PAD + h;
  const seatMm = dimension.seat_height;
  return {
    viewWidth: PAD * 2 + w + (side ? GAP + side.width : 0),
    viewHeight: PAD * 2 + h + BASE_EXTRA,
    round,
    front,
    side,
    baseY,
    seatY: seatMm !== null ? baseY - seatMm * DRAWING_SCALE : null,
    widthMm,
    depthMm: round ? null : dimension.depth,
    heightMm,
    seatMm,
  };
}
```

`web/src/lib/product/gallery.ts`:

```ts
import type { Image, ProductDetail } from '@/lib/api/types';

export function galleryImages(product: Pick<ProductDetail, 'cover' | 'gallery'>): Image[] {
  const list = product.cover ? [product.cover, ...product.gallery] : [...product.gallery];
  const seen = new Set<number>();
  return list.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}
```

- [ ] **Step 3: Medidas**

`web/src/components/products/DimensionDrawing.tsx`:

```tsx
import type { DrawingGeometry } from '@/lib/product/dimension-drawing';

const TICK = 5;

type DimLineProps = { x1: number; y1: number; x2: number; y2: number; label: string; vertical?: boolean };

function DimLine({ x1, y1, x2, y2, label, vertical = false }: DimLineProps) {
  return (
    <g>
      <line className="dim-line" x1={x1} y1={y1} x2={x2} y2={y2} />
      <line
        className="dim-line"
        x1={vertical ? x1 - TICK : x1}
        y1={vertical ? y1 : y1 - TICK}
        x2={vertical ? x1 + TICK : x1}
        y2={vertical ? y1 : y1 + TICK}
      />
      <line
        className="dim-line"
        x1={vertical ? x2 - TICK : x2}
        y1={vertical ? y2 : y2 - TICK}
        x2={vertical ? x2 + TICK : x2}
        y2={vertical ? y2 : y2 + TICK}
      />
      {vertical ? (
        <text
          x={x1 - 10}
          y={(y1 + y2) / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${x1 - 10} ${(y1 + y2) / 2})`}
        >
          {label}
        </text>
      ) : (
        <text x={(x1 + x2) / 2} y={y1 - 9} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

export type DimensionDrawingLabels = {
  title: string;
  front: string;
  side: string;
  width: string;
  depth: string | null;
  height: string;
  seat: string | null;
};

/** Vista frontal (L × A) e lateral (P × A) na mesma escala; textos já formatados pelo chamador. */
export function DimensionDrawing({
  geometry,
  labels,
}: {
  geometry: DrawingGeometry;
  labels: DimensionDrawingLabels;
}) {
  const { front, side, baseY, seatY } = geometry;
  return (
    <svg viewBox={`0 0 ${geometry.viewWidth} ${geometry.viewHeight}`} role="img" aria-label={labels.title}>
      <rect className="dim-shape" x={front.x} y={front.y} width={front.width} height={front.height} />
      {seatY !== null ? (
        <line className="dim-seat" x1={front.x} y1={seatY} x2={front.x + front.width} y2={seatY} />
      ) : null}
      <DimLine
        x1={front.x}
        y1={front.y - 16}
        x2={front.x + front.width}
        y2={front.y - 16}
        label={labels.width}
      />
      <DimLine x1={front.x - 16} y1={front.y} x2={front.x - 16} y2={baseY} label={labels.height} vertical />
      {side ? (
        <g>
          <rect className="dim-shape" x={side.x} y={side.y} width={side.width} height={side.height} />
          {labels.depth ? (
            <DimLine
              x1={side.x}
              y1={side.y - 16}
              x2={side.x + side.width}
              y2={side.y - 16}
              label={labels.depth}
            />
          ) : null}
          {seatY !== null ? (
            <line className="dim-seat" x1={side.x} y1={seatY} x2={side.x + side.width} y2={seatY} />
          ) : null}
          {seatY !== null && labels.seat ? (
            <text x={side.x + side.width + 6} y={seatY + 4} textAnchor="start">
              {labels.seat}
            </text>
          ) : null}
          <text x={side.x + side.width / 2} y={baseY + 20} textAnchor="middle">
            {labels.side}
          </text>
        </g>
      ) : null}
      <line className="dim-ground" x1={front.x - 20} y1={baseY} x2={geometry.viewWidth - 24} y2={baseY} />
      <text x={front.x + front.width / 2} y={baseY + 20} textAnchor="middle">
        {labels.front}
      </text>
    </svg>
  );
}
```

`web/src/components/products/DimensionsBlock.tsx`:

```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dimension } from '@/lib/api/types';
import { formatCentimeters } from '@/lib/format/dimensions';
import { computeDrawing } from '@/lib/product/dimension-drawing';
import { nextRovingIndex } from '@/lib/ui/roving';
import { DimensionDrawing } from './DimensionDrawing';

type FactKey = 'width' | 'depth' | 'height' | 'diameter' | 'seatHeight';
type Fact = { key: FactKey; value: number };

function hasValue(dimension: Dimension): boolean {
  return [dimension.width, dimension.depth, dimension.height, dimension.diameter, dimension.seat_height].some(
    (value) => value !== null,
  );
}

function factsOf(dimension: Dimension): Fact[] {
  const round = dimension.diameter !== null && dimension.width === null;
  const candidates: { key: FactKey; value: number | null }[] = round
    ? [
        { key: 'diameter', value: dimension.diameter },
        { key: 'height', value: dimension.height },
        { key: 'seatHeight', value: dimension.seat_height },
      ]
    : [
        { key: 'width', value: dimension.width },
        { key: 'depth', value: dimension.depth },
        { key: 'height', value: dimension.height },
        { key: 'seatHeight', value: dimension.seat_height },
      ];
  return candidates.filter((fact): fact is Fact => fact.value !== null);
}

export function DimensionsBlock({ dimensions }: { dimensions: Dimension[] }) {
  const t = useTranslations('product.dimensions');
  const locale = useLocale() as Locale;
  const baseId = useId();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const usable = dimensions.filter(hasValue);
  if (usable.length === 0) {
    return null;
  }
  const current = usable[Math.min(active, usable.length - 1)]!;
  const cm = (mm: number) => formatCentimeters(mm, locale);
  const facts = factsOf(current);
  const geometry = computeDrawing(current);
  const summary = facts.map((fact) => t(`inline.${fact.key}`, { value: cm(fact.value) })).join(', ');
  const tabbed = usable.length > 1;

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }
    const next = nextRovingIndex(usable.length, index, event.key);
    if (next === null) {
      return;
    }
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className="block" aria-labelledby={`${baseId}-title`}>
      <div className="block__title">
        <h2 id={`${baseId}-title`}>{t('title')}</h2>
        <span className="meta">{t('madeToOrder')}</span>
      </div>
      {tabbed ? (
        <div className="tabs" role="tablist" aria-label={t('variants')}>
          {usable.map((dimension, index) => (
            <button
              key={`${index}-${dimension.label ?? ''}`}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-controls={`${baseId}-panel`}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => handleTabKey(event, index)}
            >
              {dimension.label ?? t('variant', { number: index + 1 })}
            </button>
          ))}
        </div>
      ) : null}
      <div
        className="dims"
        id={`${baseId}-panel`}
        role={tabbed ? 'tabpanel' : undefined}
        aria-labelledby={tabbed ? `${baseId}-tab-${active}` : undefined}
      >
        {geometry ? (
          <DimensionDrawing
            geometry={geometry}
            labels={{
              title: t('drawing', { facts: summary }),
              front: t('front'),
              side: t('side'),
              width: geometry.round
                ? t('diameterValue', { value: cm(geometry.widthMm) })
                : cm(geometry.widthMm),
              depth: geometry.depthMm !== null ? cm(geometry.depthMm) : null,
              height: cm(geometry.heightMm),
              seat: geometry.seatMm !== null ? cm(geometry.seatMm) : null,
            }}
          />
        ) : null}
        <dl className="num">
          {facts.map((fact) => (
            <div key={fact.key}>
              <dt>{t(`facts.${fact.key}`)}</dt>
              <dd>{cm(fact.value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Galeria e 3D**

`web/src/types/model-viewer.d.ts` (substitui o do P3):

```ts
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src: string;
  alt?: string;
  ar?: boolean;
  'ar-modes'?: string;
  'camera-controls'?: boolean;
  'touch-action'?: string;
  'shadow-intensity'?: string;
  exposure?: string;
  loading?: 'auto' | 'lazy' | 'eager';
  reveal?: 'auto' | 'manual';
  poster?: string;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes;
    }
  }
}
```

`web/src/components/products/ModelViewer.tsx` (substitui o do P3; o botão "ver em 3D" passa para o `ProductStage`):

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

type Status = 'loading' | 'ready' | 'error';

/** Só é montado quando o visitante pede o 3D: o pacote é importado sob demanda (spec §6, "3D"). */
export function ModelViewer({ src, alt }: { src: string; alt: string }) {
  const t = useTranslations('product.stage');
  const ref = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let active = true;
    const element = ref.current;
    const onLoad = () => {
      if (active) setStatus('ready');
    };
    const onError = () => {
      if (active) setStatus('error');
    };
    element?.addEventListener('load', onLoad);
    element?.addEventListener('error', onError);
    import('@google/model-viewer').catch(onError);
    return () => {
      active = false;
      element?.removeEventListener('load', onLoad);
      element?.removeEventListener('error', onError);
    };
  }, []);

  return (
    <>
      <model-viewer
        ref={ref}
        src={src}
        alt={alt}
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        touch-action="pan-y"
        shadow-intensity="0.8"
        loading="eager"
        reveal="auto"
      />
      {status !== 'ready' ? (
        <p className="stage-3d__status meta" role="status">
          {status === 'error' ? t('modelError') : t('modelLoading')}
        </p>
      ) : null}
    </>
  );
}
```

`web/src/components/products/ProductStage.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useState, useSyncExternalStore } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import type { Image, ProductDetail } from '@/lib/api/types';
import { ModelViewer } from './ModelViewer';

type Mode = 'photo' | '3d';

const subscribeNoop = () => () => {};
const wants3dFromUrl = () => new URLSearchParams(window.location.search).get('view') === '3d';

type ProductStageProps = { images: Image[]; name: string; model: ProductDetail['model_3d'] };

/**
 * Galeria com alternância Fotos/3D. `?view=3d` é lido no cliente (useSyncExternalStore)
 * para a página de produto continuar estática.
 */
export function ProductStage({ images, name, model }: ProductStageProps) {
  const t = useTranslations('product.stage');
  const wants3d = useSyncExternalStore(subscribeNoop, wants3dFromUrl, () => false);
  const [chosen, setChosen] = useState<Mode | null>(null);
  const [index, setIndex] = useState(0);
  const mode: Mode = chosen ?? (model && wants3d ? '3d' : 'photo');
  const current = images[index] ?? images[0] ?? null;

  return (
    <div className="gallery">
      <div className={mode === '3d' ? 'gallery__stage is-3d' : 'gallery__stage'}>
        {current ? (
          <ApiImage image={current} sizes="(max-width: 61.25rem) 100vw, 58vw" priority={index === 0} />
        ) : null}
        {model && mode === '3d' ? (
          <div className="stage-3d">
            <ModelViewer src={model.url} alt={t('modelAlt', { name })} />
          </div>
        ) : null}
        {model ? (
          <div className="stage-toggle" role="group" aria-label={t('viewLabel')}>
            <button type="button" aria-pressed={mode === 'photo'} onClick={() => setChosen('photo')}>
              <Icon name="photo" />
              <span>{t('photos')}</span>
            </button>
            <button type="button" aria-pressed={mode === '3d'} onClick={() => setChosen('3d')}>
              <Icon name="cube" />
              <span>{t('model')}</span>
            </button>
          </div>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="thumbs" role="group" aria-label={t('thumbsLabel')}>
          {images.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={i === index}
              aria-label={t('showImage', { index: i + 1, total: images.length })}
              onClick={() => {
                setIndex(i);
                setChosen('photo');
              }}
            >
              <ApiImage image={item} sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Downloads, designer e página**

`web/src/components/products/ProductDownloads.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import type { DownloadFile } from '@/lib/api/types';
import { DownloadButton } from './DownloadButton';

export function ProductDownloads({ files }: { files: DownloadFile[] }) {
  const t = useTranslations('product.downloads');
  if (files.length === 0) {
    return null;
  }
  return (
    <section className="block" aria-labelledby="downloads-title">
      <div className="block__title">
        <h2 id="downloads-title">{t('title')}</h2>
        <span className="meta">{t('secureLink')}</span>
      </div>
      <div className="downloads">
        {files.map((file) => (
          <DownloadButton key={file.id} file={file} />
        ))}
      </div>
    </section>
  );
}
```

`web/src/components/products/DesignerStrip.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { DesignerDetail } from '@/lib/api/types';

export function DesignerStrip({ designer }: { designer: DesignerDetail }) {
  const t = useTranslations('product.designer');
  return (
    <section className="section section--paper section--tight" aria-labelledby="designer-title">
      <div className="wrap">
        <div className={designer.portrait ? 'designer-strip' : 'designer-strip designer-strip--text'}>
          {designer.portrait ? <ApiImage image={designer.portrait} sizes="160px" /> : null}
          <div className="designer-strip__copy">
            <h2 id="designer-title">{designer.name}</h2>
            {designer.short_bio ? <p className="lead">{designer.short_bio}</p> : null}
            <div>
              <Link
                className="link-arrow"
                href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}
              >
                <span>{t('piecesBy', { name: designer.name })}</span>
                <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

`web/src/app/[locale]/products/[slug]/page.tsx` (substitui o do P3):

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { RichText } from '@/components/content/RichText';
import { ContactForm } from '@/components/forms/ContactForm';
import { DesignerStrip } from '@/components/products/DesignerStrip';
import { DimensionsBlock } from '@/components/products/DimensionsBlock';
import { ProductConfigurator } from '@/components/products/ProductConfigurator';
import { ProductDownloads } from '@/components/products/ProductDownloads';
import { ProductRail } from '@/components/products/ProductRail';
import { ProductStage } from '@/components/products/ProductStage';
import { JsonLd } from '@/components/seo/JsonLd';
import { AreaDot } from '@/components/ui/AreaDot';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { getPathname, Link, type AppHref } from '@/i18n/navigation';
import { withBuildFallback } from '@/lib/api/build-fallback';
import { getAllProductSlugs, getProduct } from '@/lib/api/catalog';
import { getDesigner, getSettings } from '@/lib/api/content';
import type { ProductDetail } from '@/lib/api/types';
import { areaPath } from '@/lib/catalog/area';
import { toProductCard } from '@/lib/catalog/card';
import { galleryImages } from '@/lib/product/gallery';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { EMPTY_SETTINGS } from '@/lib/settings';

type Props = { params: Promise<{ locale: string; slug: string }> };

const productHref = (slug: string) => ({ pathname: '/products/[slug]', params: { slug } }) as const;

function categoryHref(product: ProductDetail): AppHref {
  const params = { category: product.category.slug };
  return product.area.key === 'outdoor'
    ? { pathname: '/outdoor/[category]', params }
    : { pathname: '/indoor/[category]', params };
}

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const slugs = await withBuildFallback(getAllProductSlugs(params.locale as Locale), []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(locale as Locale, slug);
  if (!product) {
    return {};
  }
  return buildMetadata({
    locale: locale as Locale,
    href: productHref(slug),
    title: product.seo.title ?? product.name,
    description: product.seo.description ?? product.tagline,
    image: product.seo.image ?? product.cover,
    alternates: {
      pt: product.slugs.pt ? productHref(product.slugs.pt) : null,
      en: product.slugs.en ? productHref(product.slugs.en) : null,
    },
  });
}

export default async function ProductPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const product = await getProduct(locale, slug);
  if (!product) {
    notFound();
  }
  const designerRef = product.designer;
  const [t, common, settings, designer] = await Promise.all([
    getTranslations({ locale, namespace: 'product' }),
    getTranslations({ locale, namespace: 'common' }),
    withBuildFallback(getSettings(locale), EMPTY_SETTINGS),
    designerRef ? getDesigner(locale, designerRef.slug) : Promise.resolve(null),
  ]);

  const crumbs: BreadcrumbItem[] = [
    { label: common('home'), href: '/' },
    { label: product.area.brand_name, href: areaPath(product.area.key) },
    { label: product.category.name, href: categoryHref(product) },
    { label: product.name },
  ];
  const url = absoluteUrl(getPathname({ href: productHref(slug), locale }));
  const breadcrumb = breadcrumbJsonLd(
    crumbs.map((crumb) => ({
      name: crumb.label,
      url: crumb.href ? absoluteUrl(getPathname({ href: crumb.href, locale })) : url,
    })),
  );
  // Conteúdo sem tradução volta em português (locale_fallback): marcar o idioma para leitores de tela.
  const contentLang = product.locale_fallback && locale !== 'pt' ? 'pt-BR' : undefined;

  return (
    <main>
      <JsonLd data={productJsonLd(product, url)} />
      <JsonLd data={breadcrumb} />
      <div className="wrap">
        <Breadcrumbs label={common('breadcrumb')} items={crumbs} />
        <div className="product">
          <ProductStage images={galleryImages(product)} name={product.name} model={product.model_3d} />
          <div className="panel">
            <div className="panel__head">
              <h1>{product.name}</h1>
              <ul className="meta meta-inline">
                <li>{product.category.singular_name}</li>
                <li>
                  <AreaDot area={product.area.key} />
                  {product.area.brand_name}
                </li>
                {designerRef ? (
                  <li>
                    {t.rich('designBy', {
                      name: designerRef.name,
                      designer: (chunks) => (
                        <Link href={{ pathname: '/designers/[slug]', params: { slug: designerRef.slug } }}>
                          {chunks}
                        </Link>
                      ),
                    })}
                  </li>
                ) : null}
                {product.sku ? <li className="num">{t('sku', { sku: product.sku })}</li> : null}
              </ul>
              <div className="panel__copy" lang={contentLang}>
                {product.tagline ? <p className="lead">{product.tagline}</p> : null}
                {product.description ? <RichText html={product.description} /> : null}
                {product.materials ? (
                  <p className="meta">{t('materials', { materials: product.materials })}</p>
                ) : null}
              </div>
              {contentLang ? <p className="meta">{t('fallbackNotice')}</p> : null}
            </div>

            <ProductConfigurator
              product={{ ...toProductCard(product), finishes: product.finishes }}
              whatsapp={settings.quotes_whatsapp}
              finishesNote={product.finishes_note}
            >
              <DimensionsBlock dimensions={product.dimensions} />
            </ProductConfigurator>

            <ProductDownloads files={product.files} />

            <details className="block quote-inline">
              <summary>{t('quoteOnlyThis')}</summary>
              <ContactForm type="quote" productId={product.id} submitLabel={t('sendQuote')} />
            </details>
          </div>
        </div>
      </div>

      {designer ? <DesignerStrip designer={designer} /> : null}

      {product.line_products.length > 0 ? (
        <section className="section" aria-labelledby="line-title">
          <div className="wrap">
            <div className="section-head">
              <h2 id="line-title">
                {product.line ? t('sameLine', { line: product.line.name }) : t('sameLineFallback')}
              </h2>
            </div>
            <ProductRail
              label={product.line ? t('sameLine', { line: product.line.name }) : t('sameLineFallback')}
              products={product.line_products}
            />
          </div>
        </section>
      ) : null}

      {product.related.length > 0 ? (
        <section className="section" aria-labelledby="related-title">
          <div className="wrap">
            <div className="section-head">
              <h2 id="related-title">{t('related', { category: product.category.name })}</h2>
              <Link className="link-arrow" href={areaPath(product.area.key)}>
                <span>{t('seeArea', { area: product.area.brand_name })}</span>
                <Icon name="arrow" />
              </Link>
            </div>
            <ProductRail
              label={t('related', { category: product.category.name })}
              products={product.related}
            />
          </div>
        </section>
      ) : null}
    </main>
  );
}
```

- [ ] **Step 6: CSS e mensagens**

`web/src/styles/product.css` — acrescentar:

```css
.panel__copy {
  display: grid;
  gap: 12px;
}

.panel__head .meta-inline a {
  color: var(--ink);
}

.designer-strip__copy {
  display: grid;
  gap: 14px;
}

.dim-shape {
  fill: none;
  stroke: var(--ink);
  stroke-width: 1.4;
}

.dim-line {
  stroke: var(--ink-muted);
}

.dim-seat {
  stroke: var(--ink);
  stroke-dasharray: 3 3;
}

.dim-ground {
  stroke: var(--line-strong);
}

.dims svg text {
  fill: var(--ink-muted);
  font-family: var(--font);
  font-size: 11px;
}

.quote-inline summary {
  cursor: pointer;
  font-weight: 500;
}

.quote-inline[open] summary {
  margin-bottom: 8px;
}
```

`messages/pt.json`, dentro de `product`:

```json
"designBy": "Design <designer>{name}</designer>",
"sku": "Ref. {sku}",
"materials": "Materiais: {materials}",
"fallbackNotice": "Conteúdo disponível só em português.",
"quoteOnlyThis": "Pedir orçamento só desta peça",
"sendQuote": "Enviar pedido de orçamento",
"sameLine": "Da linha {line}",
"sameLineFallback": "Da mesma linha",
"related": "Mais em {category}",
"seeArea": "Ver {area}",
"dimensions": {
  "title": "Medidas (cm)",
  "madeToOrder": "Sob medida sob consulta",
  "variants": "Variações de medida",
  "variant": "Variação {number}",
  "front": "frente",
  "side": "lateral",
  "drawing": "Desenho técnico com as medidas: {facts}",
  "diameterValue": "Ø {value}",
  "facts": {
    "width": "Largura",
    "depth": "Profundidade",
    "height": "Altura",
    "diameter": "Diâmetro",
    "seatHeight": "Altura do assento"
  },
  "inline": {
    "width": "largura {value} cm",
    "depth": "profundidade {value} cm",
    "height": "altura {value} cm",
    "diameter": "diâmetro {value} cm",
    "seatHeight": "altura do assento {value} cm"
  }
},
"stage": {
  "viewLabel": "Visualização",
  "photos": "Fotos",
  "model": "3D",
  "modelAlt": "Modelo 3D de {name}",
  "modelLoading": "Carregando o modelo 3D…",
  "modelError": "Não foi possível carregar o 3D agora. Veja as fotos ou tente de novo.",
  "thumbsLabel": "Fotos da peça",
  "showImage": "Foto {index} de {total}"
},
"downloads": { "title": "Arquivos técnicos", "secureLink": "Link seguro por 10 min" },
"designer": { "piecesBy": "Peças de {name}" }
```

`messages/en.json`, dentro de `product`:

```json
"designBy": "Design <designer>{name}</designer>",
"sku": "Ref. {sku}",
"materials": "Materials: {materials}",
"fallbackNotice": "This content is only available in Portuguese.",
"quoteOnlyThis": "Ask for a quote for this piece only",
"sendQuote": "Send quote request",
"sameLine": "From the {line} line",
"sameLineFallback": "From the same line",
"related": "More {category}",
"seeArea": "See {area}",
"dimensions": {
  "title": "Dimensions (cm)",
  "madeToOrder": "Custom sizes on request",
  "variants": "Size variations",
  "variant": "Variation {number}",
  "front": "front",
  "side": "side",
  "drawing": "Technical drawing with dimensions: {facts}",
  "diameterValue": "Ø {value}",
  "facts": {
    "width": "Width",
    "depth": "Depth",
    "height": "Height",
    "diameter": "Diameter",
    "seatHeight": "Seat height"
  },
  "inline": {
    "width": "width {value} cm",
    "depth": "depth {value} cm",
    "height": "height {value} cm",
    "diameter": "diameter {value} cm",
    "seatHeight": "seat height {value} cm"
  }
},
"stage": {
  "viewLabel": "View",
  "photos": "Photos",
  "model": "3D",
  "modelAlt": "3D model of {name}",
  "modelLoading": "Loading the 3D model…",
  "modelError": "We could not load the 3D model now. See the photos or try again.",
  "thumbsLabel": "Photos of the piece",
  "showImage": "Photo {index} of {total}"
},
"downloads": { "title": "Technical files", "secureLink": "Secure link valid for 10 min" },
"designer": { "piecesBy": "Pieces by {name}" }
```

- [ ] **Step 7: Rodar e commitar**

Run: `pnpm --filter web test` → Expected: PASS.
Run: lint + typecheck + `ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` → Expected: verde; a rota `/[locale]/products/[slug]` aparece como estática/SSG no resumo do build.
No navegador (com a API): produto com acabamentos (setas trocam amostra, Tab entra e sai do grupo), medidas com desenho, download com link temporário, `?view=3d` abre o 3D quando há GLB, sem GLB não há alternância.

```bash
git add web
git commit -m "feat(web): monta a pagina de produto com galeria, 3D sob demanda, medidas e downloads

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 9: Sala para montar — geometria, planta salva e desenho em escala

**Files:**

- Create: `web/src/lib/planner/{types,geometry,plan,plan-store,product}.ts`, `web/src/components/planner/PlanSvg.tsx`, `web/src/styles/planner.css`
- Modify: `web/src/app/globals.css`
- Test: `web/src/lib/planner/{geometry,plan,plan-store,product}.test.ts`, `web/src/components/planner/PlanSvg.test.tsx`

**Interfaces:**

- Consumes: `primaryDimension` (Task 6), `pickSource` (P3), `SNAPSHOT_IMAGE_WIDTH`, `QuoteImage`, `QuoteItemInput` (Task 2).
- Produces:
  - `planner/types.ts`: `PLAN_STORAGE_KEY = 'franccino.plan.v1'`, `ROOM_MIN_CM = 150`, `ROOM_MAX_CM = 2000`, `SNAP_CM = 5`, `FINE_STEP_CM = 1`, `MAX_PIECES = 60`, `CIRCULATION_WARNING_PERCENT = 45`, `DEFAULT_ROOM = { w: 500, d: 400 }`; tipos `PieceShape`, `Rotation`, `PlannerProduct` (medidas em cm), `PlacedPiece` (`uid`, `productId`, `x`, `y` em cm, `r`), `Room`, `Plan` (`room`, `pieces`, `products` por id), `Box`.
  - `planner/geometry.ts`: `footprint(product, r)`, `pieceBox(piece, product): Box`, `rotationPivot(product, r): [number, number]`, `findConflicts(room, boxes): Set<number>` (uids fora do ambiente ou sobrepostos), `floorUsage(room, boxes): number` (%), `snap(value, step?)`, `roomSizeFromMeters(input, fallbackCm)`, `rotateQuarter(r)`, `keyboardDelta(key, fine): [number, number] | null`, `centerPlacement(room, product)`, `nextUid(pieces)`, `countByProduct(pieces)`.
  - `planner/plan.ts`: `EMPTY_PLAN`, `addPiece(plan, product)`, `updatePiece(plan, uid, patch)`, `removePiece(plan, uid)`, `setRoom(plan, room)`, `type PlanEntry = { piece; product }`, `planEntries(plan)`, `planToQuoteInputs(plan, note): QuoteItemInput[]`, `parsePlan(raw): Plan`.
  - `planner/plan-store.ts` (navegador): `getPlan()`, `getServerPlan()`, `subscribePlan(listener)`, `savePlan(plan)`, `resetPlanStoreForTests()`.
  - `planner/product.ts`: `toPlannerProduct(detail, locale): PlannerProduct | null` (sem largura/profundidade ou diâmetro não entra na sala).
  - `PlanSvg(props: PlanSvgProps)` — renderizador compartilhado (sala e teaser da home).

- [ ] **Step 1: Testes que falham**

`web/src/lib/planner/geometry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  centerPlacement,
  countByProduct,
  findConflicts,
  floorUsage,
  footprint,
  keyboardDelta,
  nextUid,
  pieceBox,
  roomSizeFromMeters,
  rotateQuarter,
  rotationPivot,
  snap,
} from './geometry';

const sofa = { width: 240, depth: 100 };
const room = { w: 500, d: 400 };

describe('planner geometry', () => {
  it('swaps width and depth when turned a quarter', () => {
    expect(footprint(sofa, 0)).toEqual({ w: 240, d: 100 });
    expect(footprint(sofa, 90)).toEqual({ w: 100, d: 240 });
    expect(footprint(sofa, 180)).toEqual({ w: 240, d: 100 });
    expect(pieceBox({ uid: 1, productId: 9, x: 10, y: 20, r: 270 }, sofa)).toEqual({
      uid: 1,
      x: 10,
      y: 20,
      w: 100,
      d: 240,
    });
  });

  it('rotates around the pivot that keeps the turned box at the piece origin', () => {
    expect(rotationPivot(sofa, 0)).toEqual([120, 50]);
    expect(rotationPivot(sofa, 90)).toEqual([50, 50]);
    expect(rotationPivot(sofa, 180)).toEqual([120, 50]);
    expect(rotationPivot(sofa, 270)).toEqual([120, 120]);
  });

  it('flags overlapping pieces and pieces outside the room, not touching edges', () => {
    const conflicts = findConflicts(room, [
      { uid: 1, x: 0, y: 0, w: 100, d: 100 },
      { uid: 2, x: 50, y: 50, w: 100, d: 100 },
      { uid: 3, x: 450, y: 350, w: 100, d: 100 },
      { uid: 4, x: 200, y: 200, w: 50, d: 50 },
      { uid: 5, x: 250, y: 200, w: 50, d: 50 },
    ]);
    expect([...conflicts].sort()).toEqual([1, 2, 3]);
  });

  it('measures the used floor', () => {
    expect(
      floorUsage(room, [
        { uid: 1, x: 0, y: 0, w: 240, d: 100 },
        { uid: 2, x: 0, y: 0, w: 100, d: 100 },
      ]),
    ).toBe(17);
    expect(floorUsage(room, [])).toBe(0);
  });

  it('snaps positions and reads room sizes in metres with limits', () => {
    expect(snap(12)).toBe(10);
    expect(snap(13)).toBe(15);
    expect(roomSizeFromMeters('5,2', 500)).toBe(520);
    expect(roomSizeFromMeters('0.5', 500)).toBe(150);
    expect(roomSizeFromMeters('30', 500)).toBe(2000);
    expect(roomSizeFromMeters('abc', 500)).toBe(500);
    expect(roomSizeFromMeters('', 400)).toBe(400);
  });

  it('rotates, moves by keyboard and centres new pieces', () => {
    expect(rotateQuarter(270)).toBe(0);
    expect(rotateQuarter(90)).toBe(180);
    expect(keyboardDelta('ArrowLeft', false)).toEqual([-5, 0]);
    expect(keyboardDelta('ArrowDown', true)).toEqual([0, 1]);
    expect(keyboardDelta('x', false)).toBeNull();
    expect(centerPlacement(room, sofa)).toEqual({ x: 130, y: 150 });
    expect(centerPlacement({ w: 150, d: 150 }, sofa)).toEqual({ x: 0, y: 25 });
  });

  it('numbers pieces and counts them per product in order of appearance', () => {
    expect(nextUid([])).toBe(1);
    expect(nextUid([{ uid: 3 }, { uid: 7 }])).toBe(8);
    expect(countByProduct([{ productId: 5 }, { productId: 2 }, { productId: 5 }])).toEqual([
      { productId: 5, count: 2 },
      { productId: 2, count: 1 },
    ]);
  });
});
```

`web/src/lib/planner/product.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { productDetail } from '@/test/fixtures';
import { toPlannerProduct } from './product';

describe('toPlannerProduct', () => {
  it('uses the main dimension in centimetres', () => {
    expect(toPlannerProduct(productDetail(), 'pt')).toEqual({
      id: 12,
      slug: 'cadeira-aura',
      locale: 'pt',
      name: 'Cadeira Aura',
      category: 'Cadeiras',
      width: 52,
      depth: 56,
      shape: 'rect',
      image: { src: 'https://cdn.test/aura-480.webp', alt: 'Cadeira Aura em fundo branco' },
    });
  });

  it('draws round pieces from the diameter and skips pieces without a footprint', () => {
    const round = productDetail({
      dimensions: [{ label: null, width: null, depth: null, height: 750, seat_height: null, diameter: 1300 }],
    });
    expect(toPlannerProduct(round, 'en')).toMatchObject({ width: 130, depth: 130, shape: 'round' });
    const flat = productDetail({
      dimensions: [{ label: null, width: 600, depth: null, height: 750, seat_height: null, diameter: null }],
    });
    expect(toPlannerProduct(flat, 'pt')).toBeNull();
  });
});
```

`web/src/lib/planner/plan.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  addPiece,
  EMPTY_PLAN,
  parsePlan,
  planEntries,
  planToQuoteInputs,
  removePiece,
  setRoom,
  updatePiece,
} from './plan';
import { MAX_PIECES, type PlannerProduct } from './types';

const sofa: PlannerProduct = {
  id: 7,
  slug: 'sofa-majestic',
  locale: 'pt',
  name: 'Sofá Majestic',
  category: 'Sofás',
  width: 240,
  depth: 100,
  shape: 'rect',
  image: null,
};
const table: PlannerProduct = {
  ...sofa,
  id: 8,
  slug: 'mesa-joey',
  name: 'Mesa Joey',
  width: 130,
  depth: 130,
  shape: 'round',
};

describe('plan operations', () => {
  it('adds centred pieces and keeps a product snapshot', () => {
    const plan = addPiece(addPiece(EMPTY_PLAN, sofa), sofa);
    expect(plan.pieces).toEqual([
      { uid: 1, productId: 7, x: 130, y: 150, r: 0 },
      { uid: 2, productId: 7, x: 130, y: 150, r: 0 },
    ]);
    expect(plan.products['7']).toEqual(sofa);
    expect(planEntries(plan)).toHaveLength(2);
  });

  it('stops at the piece limit', () => {
    let plan = EMPTY_PLAN;
    for (let i = 0; i < MAX_PIECES; i += 1) {
      plan = addPiece(plan, sofa);
    }
    expect(addPiece(plan, sofa)).toBe(plan);
  });

  it('moves, rotates, removes and resizes', () => {
    const plan = addPiece(addPiece(EMPTY_PLAN, sofa), table);
    const moved = updatePiece(plan, 1, { x: 10, r: 90 });
    expect(moved.pieces[0]).toEqual({ uid: 1, productId: 7, x: 10, y: 150, r: 90 });
    const removed = removePiece(moved, 2);
    expect(removed.pieces).toHaveLength(1);
    expect(removed.products).not.toHaveProperty('8');
    expect(setRoom(removed, { w: 600, d: 450 }).room).toEqual({ w: 600, d: 450 });
  });

  it('turns the room into quote items with counts and the room note', () => {
    const plan = addPiece(addPiece(addPiece(EMPTY_PLAN, sofa), table), sofa);
    expect(planToQuoteInputs(plan, 'Sala 5,00 × 4,00 m')).toEqual([
      {
        productId: 7,
        slug: 'sofa-majestic',
        locale: 'pt',
        name: 'Sofá Majestic',
        image: null,
        finishes: [],
        quantity: 2,
        note: 'Sala 5,00 × 4,00 m',
      },
      {
        productId: 8,
        slug: 'mesa-joey',
        locale: 'pt',
        name: 'Mesa Joey',
        image: null,
        finishes: [],
        quantity: 1,
        note: 'Sala 5,00 × 4,00 m',
      },
    ]);
  });

  it('parses stored plans defensively', () => {
    const plan = addPiece(EMPTY_PLAN, sofa);
    expect(parsePlan(JSON.stringify(plan))).toEqual(plan);
    expect(parsePlan('nope')).toBe(EMPTY_PLAN);
    expect(parsePlan(null)).toBe(EMPTY_PLAN);
    expect(parsePlan(JSON.stringify({ ...plan, room: { w: 10, d: 10 } }))).toBe(EMPTY_PLAN);
    const orphan = { ...plan, products: {} };
    expect(parsePlan(JSON.stringify(orphan)).pieces).toEqual([]);
  });
});
```

`web/src/lib/planner/plan-store.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addPiece, EMPTY_PLAN } from './plan';
import { getPlan, getServerPlan, resetPlanStoreForTests, savePlan, subscribePlan } from './plan-store';
import { PLAN_STORAGE_KEY } from './types';

const sofa = {
  id: 7,
  slug: 'sofa-majestic',
  locale: 'pt' as const,
  name: 'Sofá Majestic',
  category: 'Sofás',
  width: 240,
  depth: 100,
  shape: 'rect' as const,
  image: null,
};

describe('plan store', () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    resetPlanStoreForTests();
    storage = new Map();
    vi.stubGlobal(
      'window',
      Object.assign(new EventTarget(), {
        localStorage: {
          getItem: (key: string) => storage.get(key) ?? null,
          setItem: (key: string, value: string) => storage.set(key, value),
        },
      }),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('starts empty, saves, notifies and keeps a stable snapshot', () => {
    expect(getServerPlan()).toBe(EMPTY_PLAN);
    expect(getPlan()).toBe(EMPTY_PLAN);
    const listener = vi.fn();
    subscribePlan(listener);
    savePlan(addPiece(EMPTY_PLAN, sofa));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(storage.has(PLAN_STORAGE_KEY)).toBe(true);
    expect(getPlan().pieces).toHaveLength(1);
    expect(getPlan()).toBe(getPlan());
  });
});
```

`web/src/components/planner/PlanSvg.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PlannerProduct } from '@/lib/planner/types';
import { PlanSvg } from './PlanSvg';

const sofa: PlannerProduct = {
  id: 7,
  slug: 'sofa-majestic',
  locale: 'pt',
  name: 'Sofá Majestic',
  category: 'Sofás',
  width: 240,
  depth: 100,
  shape: 'rect',
  image: null,
};
const table: PlannerProduct = { ...sofa, id: 8, name: 'Mesa Joey', width: 130, depth: 130, shape: 'round' };

describe('PlanSvg', () => {
  it('draws an image of an empty room with measures', () => {
    const html = renderToStaticMarkup(
      <PlanSvg
        room={{ w: 500, d: 400 }}
        pieces={[]}
        label="Planta 5,00 por 4,00 m"
        widthLabel="5,00 m"
        depthLabel="4,00 m"
      />,
    );
    expect(html).toContain('role="img"');
    expect(html).toContain('viewBox="-60 -60 620 520"');
    expect(html).toContain('5,00 m');
  });

  it('draws pieces to scale with selection and conflict states', () => {
    const html = renderToStaticMarkup(
      <PlanSvg
        room={{ w: 500, d: 400 }}
        pieces={[
          { piece: { uid: 1, productId: 7, x: 130, y: 280, r: 0 }, product: sofa },
          { piece: { uid: 2, productId: 8, x: 190, y: 170, r: 0 }, product: table },
        ]}
        selectedUid={1}
        conflicts={new Set([2])}
        label="Planta"
        widthLabel="5,00 m"
        depthLabel="4,00 m"
        pieceText={(entry) => ({ name: entry.product.name, size: '' })}
        pieceProps={() => ({ tabIndex: 0 })}
      />,
    );
    expect(html).toContain('role="group"');
    expect(html).toContain('class="piece is-selected"');
    expect(html).toContain('class="piece is-conflict"');
    expect(html).toContain('<rect width="240" height="100"');
    expect(html).toContain('<ellipse cx="65" cy="65" rx="65" ry="65"');
    expect(html).toContain('Sofá Majestic');
  });
});
```

Run: `pnpm --filter web test` → Expected: FAIL.

- [ ] **Step 2: Tipos e geometria**

`web/src/lib/planner/types.ts`:

```ts
import type { Locale } from '@/i18n/config';
import type { QuoteImage } from '@/lib/quote/types';

export const PLAN_STORAGE_KEY = 'franccino.plan.v1';
export const ROOM_MIN_CM = 150;
export const ROOM_MAX_CM = 2000;
export const SNAP_CM = 5;
export const FINE_STEP_CM = 1;
export const MAX_PIECES = 60;
export const CIRCULATION_WARNING_PERCENT = 45;

export type PieceShape = 'rect' | 'round';
export type Rotation = 0 | 90 | 180 | 270;

/** Peça do catálogo com a medida principal em centímetros (retrato salvo com a planta). */
export type PlannerProduct = {
  id: number;
  slug: string;
  locale: Locale;
  name: string;
  category: string;
  width: number;
  depth: number;
  shape: PieceShape;
  image: QuoteImage | null;
};

/** Posição do canto superior esquerdo da caixa ocupada, em cm. */
export type PlacedPiece = { uid: number; productId: number; x: number; y: number; r: Rotation };
export type Room = { w: number; d: number };
export type Plan = { room: Room; pieces: PlacedPiece[]; products: Record<string, PlannerProduct> };
export type Box = { uid: number; x: number; y: number; w: number; d: number };

export const DEFAULT_ROOM: Room = { w: 500, d: 400 };
```

`web/src/lib/planner/geometry.ts`:

```ts
import {
  FINE_STEP_CM,
  ROOM_MAX_CM,
  ROOM_MIN_CM,
  SNAP_CM,
  type Box,
  type PlacedPiece,
  type PlannerProduct,
  type Room,
  type Rotation,
} from './types';

type Size = Pick<PlannerProduct, 'width' | 'depth'>;

/** Caixa ocupada (cm) depois de girar 0/90/180/270°. */
export function footprint(product: Size, r: Rotation): { w: number; d: number } {
  const turned = r % 180 !== 0;
  return { w: turned ? product.depth : product.width, d: turned ? product.width : product.depth };
}

export function pieceBox(piece: PlacedPiece, product: Size): Box {
  const { w, d } = footprint(product, piece.r);
  return { uid: piece.uid, x: piece.x, y: piece.y, w, d };
}

/** Centro de giro que mantém a caixa girada em [0, w'] × [0, d'] (mesma conta do protótipo). */
export function rotationPivot(product: Size, r: Rotation): [number, number] {
  const { width: w, depth: d } = product;
  if (r === 90) {
    return [d / 2, d / 2];
  }
  if (r === 270) {
    return [w / 2, w / 2];
  }
  return [w / 2, d / 2];
}

export function findConflicts(room: Room, boxes: Box[]): Set<number> {
  const conflicts = new Set<number>();
  boxes.forEach((a, i) => {
    if (a.x < 0 || a.y < 0 || a.x + a.w > room.w || a.y + a.d > room.d) {
      conflicts.add(a.uid);
    }
    for (const b of boxes.slice(i + 1)) {
      if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.d && a.y + a.d > b.y) {
        conflicts.add(a.uid);
        conflicts.add(b.uid);
      }
    }
  });
  return conflicts;
}

/** Percentual do piso ocupado (arredondado). */
export function floorUsage(room: Room, boxes: Box[]): number {
  const used = boxes.reduce((sum, box) => sum + box.w * box.d, 0);
  return Math.round((used / (room.w * room.d)) * 100);
}

export function snap(value: number, step: number = SNAP_CM): number {
  return Math.round(value / step) * step;
}

/** Lê metros ("5,2" ou "5.2") e devolve cm dentro dos limites; inválido → `fallbackCm`. */
export function roomSizeFromMeters(input: string, fallbackCm: number): number {
  const value = Number(input.trim().replace(',', '.'));
  if (!input.trim() || !Number.isFinite(value) || value <= 0) {
    return fallbackCm;
  }
  return Math.round(Math.min(ROOM_MAX_CM, Math.max(ROOM_MIN_CM, value * 100)));
}

export function rotateQuarter(r: Rotation): Rotation {
  return ((r + 90) % 360) as Rotation;
}

/** Setas movem 5 cm; com Shift, 1 cm. */
export function keyboardDelta(key: string, fine: boolean): [number, number] | null {
  const step = fine ? FINE_STEP_CM : SNAP_CM;
  switch (key) {
    case 'ArrowLeft':
      return [-step, 0];
    case 'ArrowRight':
      return [step, 0];
    case 'ArrowUp':
      return [0, -step];
    case 'ArrowDown':
      return [0, step];
    default:
      return null;
  }
}

export function centerPlacement(room: Room, product: Size): { x: number; y: number } {
  return {
    x: Math.max(0, Math.round((room.w - product.width) / 2)),
    y: Math.max(0, Math.round((room.d - product.depth) / 2)),
  };
}

export function nextUid(pieces: Pick<PlacedPiece, 'uid'>[]): number {
  return pieces.reduce((max, piece) => Math.max(max, piece.uid), 0) + 1;
}

export function countByProduct(
  pieces: Pick<PlacedPiece, 'productId'>[],
): { productId: number; count: number }[] {
  const counts = new Map<number, number>();
  for (const piece of pieces) {
    counts.set(piece.productId, (counts.get(piece.productId) ?? 0) + 1);
  }
  return [...counts].map(([productId, count]) => ({ productId, count }));
}
```

- [ ] **Step 3: Planta, armazenamento e peça**

`web/src/lib/planner/plan.ts`:

```ts
import { z } from 'zod';
import type { QuoteItemInput } from '@/lib/quote/types';
import { centerPlacement, countByProduct, nextUid } from './geometry';
import {
  DEFAULT_ROOM,
  MAX_PIECES,
  ROOM_MAX_CM,
  ROOM_MIN_CM,
  type PlacedPiece,
  type Plan,
  type PlannerProduct,
  type Room,
} from './types';

/** Sala vazia: não inventamos composição (conflito C17). */
export const EMPTY_PLAN: Plan = { room: DEFAULT_ROOM, pieces: [], products: {} };

export function addPiece(plan: Plan, product: PlannerProduct): Plan {
  if (plan.pieces.length >= MAX_PIECES) {
    return plan;
  }
  const { x, y } = centerPlacement(plan.room, product);
  return {
    ...plan,
    products: { ...plan.products, [String(product.id)]: product },
    pieces: [...plan.pieces, { uid: nextUid(plan.pieces), productId: product.id, x, y, r: 0 }],
  };
}

export function updatePiece(
  plan: Plan,
  uid: number,
  patch: Partial<Pick<PlacedPiece, 'x' | 'y' | 'r'>>,
): Plan {
  return {
    ...plan,
    pieces: plan.pieces.map((piece) => (piece.uid === uid ? { ...piece, ...patch } : piece)),
  };
}

export function removePiece(plan: Plan, uid: number): Plan {
  const pieces = plan.pieces.filter((piece) => piece.uid !== uid);
  const used = new Set(pieces.map((piece) => String(piece.productId)));
  const products = Object.fromEntries(Object.entries(plan.products).filter(([id]) => used.has(id)));
  return { ...plan, pieces, products };
}

export function setRoom(plan: Plan, room: Room): Plan {
  return { ...plan, room };
}

export type PlanEntry = { piece: PlacedPiece; product: PlannerProduct };

export function planEntries(plan: Plan): PlanEntry[] {
  return plan.pieces.flatMap((piece) => {
    const product = plan.products[String(piece.productId)];
    return product ? [{ piece, product }] : [];
  });
}

/** Uma linha por peça, com a quantidade na sala e a medida do ambiente como observação. */
export function planToQuoteInputs(plan: Plan, note: string): QuoteItemInput[] {
  return countByProduct(plan.pieces).flatMap(({ productId, count }) => {
    const product = plan.products[String(productId)];
    return product
      ? [
          {
            productId: product.id,
            slug: product.slug,
            locale: product.locale,
            name: product.name,
            image: product.image,
            finishes: [],
            quantity: count,
            note,
          },
        ]
      : [];
  });
}

const productSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string().min(1),
  locale: z.enum(['pt', 'en']),
  name: z.string().min(1),
  category: z.string(),
  width: z.number().positive(),
  depth: z.number().positive(),
  shape: z.enum(['rect', 'round']),
  image: z.object({ src: z.string(), alt: z.string() }).nullable(),
});

const planSchema = z.object({
  room: z.object({
    w: z.number().min(ROOM_MIN_CM).max(ROOM_MAX_CM),
    d: z.number().min(ROOM_MIN_CM).max(ROOM_MAX_CM),
  }),
  pieces: z
    .array(
      z.object({
        uid: z.number().int().positive(),
        productId: z.number().int().positive(),
        x: z.number(),
        y: z.number(),
        r: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]),
      }),
    )
    .max(MAX_PIECES),
  products: z.record(z.string(), productSchema),
});

export function parsePlan(raw: string | null): Plan {
  if (!raw) {
    return EMPTY_PLAN;
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY_PLAN;
  }
  const parsed = planSchema.safeParse(data);
  if (!parsed.success) {
    return EMPTY_PLAN;
  }
  const plan = parsed.data;
  return { ...plan, pieces: plan.pieces.filter((piece) => plan.products[String(piece.productId)]) };
}
```

`web/src/lib/planner/plan-store.ts`:

```ts
/** Loja externa da planta (localStorage) para `useSyncExternalStore`. Só no navegador. */
import { EMPTY_PLAN, parsePlan } from './plan';
import { PLAN_STORAGE_KEY, type Plan } from './types';

const CHANGE_EVENT = 'franccino:plan-change';

let memoryRaw: string | null | undefined;
let cachedRaw: string | null | undefined;
let cachedPlan: Plan = EMPTY_PLAN;

function readRaw(): string | null {
  if (memoryRaw !== undefined) {
    return memoryRaw;
  }
  try {
    return window.localStorage.getItem(PLAN_STORAGE_KEY);
  } catch {
    memoryRaw = null;
    return null;
  }
}

export function getPlan(): Plan {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedPlan = parsePlan(raw);
  }
  return cachedPlan;
}

export function getServerPlan(): Plan {
  return EMPTY_PLAN;
}

export function savePlan(plan: Plan): void {
  const raw = JSON.stringify(plan);
  if (memoryRaw === undefined) {
    try {
      window.localStorage.setItem(PLAN_STORAGE_KEY, raw);
    } catch {
      memoryRaw = raw;
    }
  } else {
    memoryRaw = raw;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribePlan(listener: () => void): () => void {
  const onStorage = (event: Event) => {
    const key = (event as StorageEvent).key;
    if (key === null || key === undefined || key === PLAN_STORAGE_KEY) {
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

/** Só para testes. */
export function resetPlanStoreForTests(): void {
  memoryRaw = undefined;
  cachedRaw = undefined;
  cachedPlan = EMPTY_PLAN;
}
```

`web/src/lib/planner/product.ts`:

```ts
import type { Locale } from '@/i18n/config';
import type { ProductDetail } from '@/lib/api/types';
import { primaryDimension } from '@/lib/catalog/technical';
import { pickSource } from '@/lib/images/srcset';
import { SNAPSHOT_IMAGE_WIDTH } from '@/lib/quote/snapshot';
import type { PlannerProduct } from './types';

export function toPlannerProduct(detail: ProductDetail, locale: Locale): PlannerProduct | null {
  const dimension = primaryDimension(detail.dimensions);
  if (!dimension) {
    return null;
  }
  const round = dimension.diameter !== null && dimension.width === null;
  const widthMm = dimension.width ?? dimension.diameter;
  const depthMm = dimension.depth ?? dimension.diameter;
  if (widthMm === null || depthMm === null) {
    return null;
  }
  return {
    id: detail.id,
    slug: detail.slug,
    locale,
    name: detail.name,
    category: detail.category.name,
    width: widthMm / 10,
    depth: depthMm / 10,
    shape: round ? 'round' : 'rect',
    image: detail.cover
      ? { src: pickSource(detail.cover, SNAPSHOT_IMAGE_WIDTH), alt: detail.cover.alt }
      : null,
  };
}
```

- [ ] **Step 4: `PlanSvg`**

`web/src/components/planner/PlanSvg.tsx`:

```tsx
import type { Ref, SVGProps } from 'react';
import { footprint, rotationPivot } from '@/lib/planner/geometry';
import type { PlanEntry } from '@/lib/planner/plan';
import type { Room } from '@/lib/planner/types';

const MARGIN = 60;
const GRID_CM = 50;
const LABEL_MIN_CM = 70;

export type PlanSvgProps = {
  room: Room;
  pieces: PlanEntry[];
  selectedUid?: number | null;
  conflicts?: ReadonlySet<number>;
  /** Nome acessível da planta (texto já traduzido). */
  label: string;
  widthLabel: string;
  depthLabel: string;
  /** Nome e medida escritos dentro de peças grandes. */
  pieceText?: (entry: PlanEntry) => { name: string; size: string };
  /** Só na sala interativa: foco, teclado e arrastar. Sem isso, a planta é uma imagem. */
  pieceProps?: (entry: PlanEntry) => SVGProps<SVGGElement>;
  svgRef?: Ref<SVGSVGElement>;
};

function gridLines(length: number): number[] {
  const lines: number[] = [];
  for (let value = GRID_CM; value < length; value += GRID_CM) {
    lines.push(value);
  }
  return lines;
}

/** Planta em escala (1 unidade = 1 cm), compartilhada pela sala e pelo teaser da home. */
export function PlanSvg({
  room,
  pieces,
  selectedUid = null,
  conflicts,
  label,
  widthLabel,
  depthLabel,
  pieceText,
  pieceProps,
  svgRef,
}: PlanSvgProps) {
  return (
    <svg
      ref={svgRef}
      className="plan-svg"
      viewBox={`${-MARGIN} ${-MARGIN} ${room.w + 2 * MARGIN} ${room.d + 2 * MARGIN}`}
      role={pieceProps ? 'group' : 'img'}
      aria-label={label}
    >
      <rect className="plan-floor" x={0} y={0} width={room.w} height={room.d} />
      {gridLines(room.w).map((x) => (
        <line
          key={`x${x}`}
          className={x % 100 === 0 ? 'plan-grid plan-grid--major' : 'plan-grid'}
          x1={x}
          y1={0}
          x2={x}
          y2={room.d}
        />
      ))}
      {gridLines(room.d).map((y) => (
        <line
          key={`y${y}`}
          className={y % 100 === 0 ? 'plan-grid plan-grid--major' : 'plan-grid'}
          x1={0}
          y1={y}
          x2={room.w}
          y2={y}
        />
      ))}
      <g className="plan-measure" aria-hidden="true">
        <line x1={0} y1={-26} x2={room.w} y2={-26} />
        <line x1={0} y1={-32} x2={0} y2={-20} />
        <line x1={room.w} y1={-32} x2={room.w} y2={-20} />
        <text x={room.w / 2} y={-34} textAnchor="middle">
          {widthLabel}
        </text>
        <line x1={-26} y1={0} x2={-26} y2={room.d} />
        <line x1={-32} y1={0} x2={-20} y2={0} />
        <line x1={-32} y1={room.d} x2={-20} y2={room.d} />
        <text x={-34} y={room.d / 2} textAnchor="middle" transform={`rotate(-90 -34 ${room.d / 2})`}>
          {depthLabel}
        </text>
      </g>
      {pieces.map((entry) => {
        const { piece, product } = entry;
        const box = footprint(product, piece.r);
        const [px, py] = rotationPivot(product, piece.r);
        const text = pieceText?.(entry);
        const className = [
          'piece',
          piece.uid === selectedUid ? 'is-selected' : '',
          conflicts?.has(piece.uid) ? 'is-conflict' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <g
            key={piece.uid}
            className={className}
            transform={`translate(${piece.x} ${piece.y})`}
            {...pieceProps?.(entry)}
          >
            <g transform={`rotate(${piece.r} ${px} ${py})`}>
              {product.shape === 'round' ? (
                <ellipse
                  cx={product.width / 2}
                  cy={product.depth / 2}
                  rx={product.width / 2}
                  ry={product.depth / 2}
                />
              ) : (
                <rect width={product.width} height={product.depth} rx={2} />
              )}
            </g>
            {text && Math.max(box.w, box.d) > LABEL_MIN_CM ? (
              <g aria-hidden="true">
                <text x={box.w / 2} y={box.d / 2 - 2} textAnchor="middle">
                  {text.name}
                </text>
                <text className="piece__size" x={box.w / 2} y={box.d / 2 + 12} textAnchor="middle">
                  {text.size}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
```

(O `rx={2}` do retângulo vem do protótipo: é o raio do desenho técnico da peça em cm, não um canto de interface.)

- [ ] **Step 5: CSS**

`web/src/styles/planner.css` — portar de `design/prototype/assets/styles.css` o bloco `planner` **sem** `.field*` e `.pair` (1453–1472 e 1522–1681) e, de `ajustes da revisão`, `.library*` e o `@media (max-width: 1200px) { .planner__canvas { order: -1 } }` (1940–1960), com as edições:

1. `var(--ink-2)` → `var(--ink-muted)`.
2. `#canvas > svg` → `.plan-svg`.
3. Cores fixas das peças: `#fbfaf7` → `var(--plan-piece)`, `#eef2ee` → `var(--plan-selected)`, `#f7e9e6` → `var(--plan-conflict)`.
4. `.canvas-bar button` ganha `border-color: var(--line-field)`.
5. Acrescentar:

```css
.plan-floor {
  fill: var(--plan-floor);
  stroke: var(--ink);
  stroke-width: 3;
  vector-effect: non-scaling-stroke;
}

.plan-grid {
  stroke: var(--plan-grid-minor);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.plan-grid--major {
  stroke: var(--plan-grid-major);
}

.plan-measure line {
  stroke: var(--ink-muted);
  vector-effect: non-scaling-stroke;
}

.plan-measure text {
  fill: var(--ink-muted);
  font-family: var(--font);
  font-size: 13px;
}

.piece__size {
  fill: var(--ink-muted);
}

.piece:focus-visible {
  outline: none;
}

.piece:focus-visible rect,
.piece:focus-visible ellipse {
  stroke: var(--ink);
  stroke-width: 3;
}
```

`web/src/app/globals.css`: `@import '../styles/planner.css' layer(components);`

- [ ] **Step 6: Rodar e commitar**

Run: `pnpm --filter web test` → Expected: PASS.
Run: lint + typecheck + `ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` → Expected: verde.

```bash
git add web
git commit -m "feat(web): adiciona geometria e planta em escala da sala para montar

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 10: Sala para montar — página interativa

**Files:**

- Create: `web/src/lib/planner/{query,data,actions}.ts`, `web/src/components/ui/SnapshotImage.tsx`, `web/src/components/planner/RoomPlanner.tsx`, `web/src/components/planner/PlannerLibrary.tsx`, `web/src/app/[locale]/room-planner/page.tsx`
- Modify: `web/src/styles/planner.css`, `web/messages/{pt,en}.json`
- Test: `web/src/lib/planner/query.test.ts`, `web/src/lib/planner/data.test.ts`, `web/src/components/planner/RoomPlanner.test.tsx`

**Interfaces:**

- Consumes: tudo da Task 9; `getProducts`, `getProductDetails` (Task 6); `quoteActions` (Task 2); `showToast` (Task 2); `withBuildFallback` (Task 4); `Breadcrumbs`, `Icon` (Task 1); `buildMetadata` (P3).
- Produces:
  - `parsePlannerQuery(value: unknown): string | null` (2 a 60 caracteres).
  - `loadPlannerProducts(locale, params: ProductListParams): Promise<PlannerProduct[]>` (servidor).
  - Server Action `searchPlannerPieces(locale: string, query: string): Promise<PlannerProduct[]>` (valida idioma e busca; até 12 peças com medidas).
  - `SnapshotImage({ image: QuoteImage; className? })` — miniatura decorativa (`alt=""`) de um retrato salvo no navegador.
  - `RoomPlanner({ initialLibrary })`, `PlannerLibrary({ initial, onAdd })`.
  - Rota `/room-planner` (`/pt/sala-para-montar`, `/en/room-planner`), estática com revalidação.

- [ ] **Step 1: Testes que falham**

`web/src/lib/planner/query.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parsePlannerQuery } from './query';

describe('parsePlannerQuery', () => {
  it('accepts 2 to 60 characters, trimmed', () => {
    expect(parsePlannerQuery('  sofá ')).toBe('sofá');
    expect(parsePlannerQuery('s')).toBeNull();
    expect(parsePlannerQuery('x'.repeat(61))).toBeNull();
    expect(parsePlannerQuery(42)).toBeNull();
  });
});
```

`web/src/lib/planner/data.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { productCard, productDetail } from '@/test/fixtures';
import { loadPlannerProducts } from './data';

const json = (body: unknown) =>
  new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });

describe('loadPlannerProducts', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps only pieces with a footprint', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/products')) {
        return json({
          data: [productCard({ slug: 'aura' }), productCard({ id: 13, slug: 'painel' })],
          links: { first: null, last: null, prev: null, next: null },
          meta: { current_page: 1, last_page: 1, per_page: 24, total: 2 },
        });
      }
      const slug = url.pathname.split('/').pop();
      return slug === 'painel'
        ? json({
            data: productDetail({
              id: 13,
              slug: 'painel',
              dimensions: [
                { label: null, width: 1200, depth: null, height: 800, seat_height: null, diameter: null },
              ],
            }),
          })
        : json({ data: productDetail({ slug: 'aura' }) });
    });
    const products = await loadPlannerProducts('pt', { q: 'aura', per_page: 12 });
    expect(products.map((product) => product.slug)).toEqual(['aura']);
  });
});
```

`web/src/components/planner/RoomPlanner.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import type { PlannerProduct } from '@/lib/planner/types';
import { renderWithIntl } from '@/test/intl';
import { RoomPlanner } from './RoomPlanner';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);
vi.mock('@/lib/planner/actions', () => ({ searchPlannerPieces: vi.fn(async () => []) }));

const sofa: PlannerProduct = {
  id: 7,
  slug: 'sofa-majestic',
  locale: 'pt',
  name: 'Sofá Majestic',
  category: 'Sofás',
  width: 240,
  depth: 100,
  shape: 'rect',
  image: null,
};

describe('RoomPlanner', () => {
  it('starts with an empty 5 × 4 m room and the catalogue pieces', () => {
    const html = renderWithIntl(<RoomPlanner initialLibrary={[sofa]} />);
    expect(html).toContain('value="5.0"');
    expect(html).toContain('value="4.0"');
    expect(html).toContain('aria-label="Pôr Sofá Majestic na sala"');
    expect(html).toContain('240 × 100 cm');
    expect(html).toContain('Nenhuma peça ainda.');
    expect(html).toContain('role="group"');
  });

  it('keeps rotate and remove disabled without a selected piece', () => {
    const html = renderWithIntl(<RoomPlanner initialLibrary={[]} />);
    expect(html.match(/<button type="button" disabled="">/g)).toHaveLength(2);
  });
});
```

Run: `pnpm --filter web test` → Expected: FAIL.

- [ ] **Step 2: Busca e dados**

`web/src/lib/planner/query.ts`:

```ts
export const PLANNER_QUERY_MIN = 2;
export const PLANNER_QUERY_MAX = 60;

/** Busca da biblioteca: a API exige 2+ caracteres; o teto evita abuso da Server Action. */
export function parsePlannerQuery(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const query = value.trim();
  return query.length >= PLANNER_QUERY_MIN && query.length <= PLANNER_QUERY_MAX ? query : null;
}
```

`web/src/lib/planner/data.ts`:

```ts
import type { Locale } from '@/i18n/config';
import { getProductDetails, getProducts, type ProductListParams } from '@/lib/api/catalog';
import { toPlannerProduct } from './product';
import type { PlannerProduct } from './types';

/** Peças com medida para a sala (servidor): listagem + detalhe de cada uma (conflito C1). */
export async function loadPlannerProducts(
  locale: Locale,
  params: ProductListParams,
): Promise<PlannerProduct[]> {
  const page = await getProducts(locale, params);
  const details = await getProductDetails(
    locale,
    page.data.map((product) => product.slug),
  );
  return details
    .map((detail) => toPlannerProduct(detail, locale))
    .filter((product): product is PlannerProduct => product !== null);
}
```

`web/src/lib/planner/actions.ts`:

```ts
'use server';

import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { loadPlannerProducts } from './data';
import { parsePlannerQuery } from './query';
import type { PlannerProduct } from './types';

const SEARCH_LIMIT = 12;

/** Busca da biblioteca da sala. Entrada do navegador: idioma e texto são validados aqui. */
export async function searchPlannerPieces(locale: string, query: string): Promise<PlannerProduct[]> {
  const q = parsePlannerQuery(query);
  if (!q) {
    return [];
  }
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  return loadPlannerProducts(safeLocale, { q, per_page: SEARCH_LIMIT });
}
```

- [ ] **Step 3: Componentes**

`web/src/components/ui/SnapshotImage.tsx`:

```tsx
/* eslint-disable @next/next/no-img-element -- miniatura já convertida pela API e guardada no navegador; não há o objeto Image completo para o ApiImage. */
import type { QuoteImage } from '@/lib/quote/types';

/** Decorativa: o nome da peça está sempre ao lado. */
export function SnapshotImage({ image, className }: { image: QuoteImage; className?: string }) {
  return (
    <img
      className={className}
      src={image.src}
      alt=""
      width={120}
      height={90}
      loading="lazy"
      decoding="async"
    />
  );
}
```

`web/src/components/planner/PlannerLibrary.tsx`:

```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { Icon } from '@/components/ui/Icon';
import { SnapshotImage } from '@/components/ui/SnapshotImage';
import { searchPlannerPieces } from '@/lib/planner/actions';
import { parsePlannerQuery } from '@/lib/planner/query';
import type { PlannerProduct } from '@/lib/planner/types';

const DEBOUNCE_MS = 300;

export function PlannerLibrary({
  initial,
  onAdd,
}: {
  initial: PlannerProduct[];
  onAdd: (product: PlannerProduct) => void;
}) {
  const t = useTranslations('planner.library');
  const locale = useLocale();
  const baseId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlannerProduct[] | null>(null);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ticket = useRef(0);
  const numberFormat = new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en', { maximumFractionDigits: 1 });

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleChange(value: string) {
    setQuery(value);
    clearTimeout(timer.current);
    if (!parsePlannerQuery(value)) {
      ticket.current += 1;
      setResults(null);
      return;
    }
    timer.current = setTimeout(() => {
      const current = ++ticket.current;
      startTransition(async () => {
        const found = await searchPlannerPieces(locale, value);
        startTransition(() => {
          if (current === ticket.current) {
            setResults(found);
          }
        });
      });
    }, DEBOUNCE_MS);
  }

  const list = results ?? initial;
  const status = pending ? t('searching') : results !== null && results.length === 0 ? t('noResults') : '';

  return (
    <details className="library" open>
      <summary>{t('title')}</summary>
      <div className="field">
        <label htmlFor={`${baseId}-find`}>{t('search')}</label>
        <input
          id={`${baseId}-find`}
          type="search"
          value={query}
          autoComplete="off"
          placeholder={t('placeholder')}
          onChange={(event) => handleChange(event.target.value)}
        />
      </div>
      <p className="meta" role="status">
        {status}
      </p>
      <ul className="piece-list">
        {list.map((product) => (
          <li key={product.id} className="piece-option">
            {product.image ? (
              <SnapshotImage image={product.image} />
            ) : (
              <span className="piece-option__blank" aria-hidden="true" />
            )}
            <div>
              <div className="piece-option__name">{product.name}</div>
              <div className="meta num">
                {product.shape === 'round'
                  ? t('sizeRound', { diameter: numberFormat.format(product.width) })
                  : t('sizeRect', {
                      width: numberFormat.format(product.width),
                      depth: numberFormat.format(product.depth),
                    })}
              </div>
            </div>
            <button
              type="button"
              aria-label={t('add', { name: product.name })}
              onClick={() => onAdd(product)}
            >
              <Icon name="plus" />
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
```

`web/src/components/planner/RoomPlanner.tsx`:

```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
  type SVGProps,
} from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import {
  countByProduct,
  findConflicts,
  floorUsage,
  keyboardDelta,
  pieceBox,
  roomSizeFromMeters,
  rotateQuarter,
  snap,
} from '@/lib/planner/geometry';
import {
  addPiece,
  planEntries,
  planToQuoteInputs,
  removePiece,
  setRoom,
  updatePiece,
  type PlanEntry,
} from '@/lib/planner/plan';
import { getPlan, getServerPlan, savePlan, subscribePlan } from '@/lib/planner/plan-store';
import {
  CIRCULATION_WARNING_PERCENT,
  ROOM_MAX_CM,
  ROOM_MIN_CM,
  type PlannerProduct,
  type Room,
} from '@/lib/planner/types';
import { quoteActions } from '@/lib/quote/store';
import { showToast } from '@/lib/ui/toast';
import { PlannerLibrary } from './PlannerLibrary';
import { PlanSvg } from './PlanSvg';

type Drag = { uid: number; offsetX: number; offsetY: number; x: number; y: number };

export function RoomPlanner({ initialLibrary }: { initialLibrary: PlannerProduct[] }) {
  const t = useTranslations('planner');
  const q = useTranslations('quote');
  const locale = useLocale() as Locale;
  const baseId = useId();
  const plan = useSyncExternalStore(subscribePlan, getPlan, getServerPlan);
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const tag = locale === 'pt' ? 'pt-BR' : 'en';
  const cmFormat = useMemo(() => new Intl.NumberFormat(tag, { maximumFractionDigits: 1 }), [tag]);
  const metersFormat = useMemo(
    () => new Intl.NumberFormat(tag, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [tag],
  );

  // Durante o arraste a posição vive no estado local; o armazenamento só recebe o soltar.
  const entries: PlanEntry[] = planEntries(plan).map((entry) =>
    drag && drag.uid === entry.piece.uid
      ? { ...entry, piece: { ...entry.piece, x: drag.x, y: drag.y } }
      : entry,
  );
  const boxes = entries.map(({ piece, product }) => pieceBox(piece, product));
  const conflicts = findConflicts(plan.room, boxes);
  const usage = floorUsage(plan.room, boxes);
  const counts = countByProduct(plan.pieces);
  const selectedPiece = plan.pieces.find((piece) => piece.uid === selected) ?? null;
  const widthM = metersFormat.format(plan.room.w / 100);
  const depthM = metersFormat.format(plan.room.d / 100);

  function handleAdd(product: PlannerProduct) {
    const next = addPiece(plan, product);
    if (next === plan) {
      setAnnouncement(t('maxPieces'));
      return;
    }
    savePlan(next);
    setSelected(next.pieces[next.pieces.length - 1]?.uid ?? null);
    setAnnouncement(t('added', { name: product.name }));
  }

  function rotate(uid: number) {
    const piece = plan.pieces.find((item) => item.uid === uid);
    if (piece) {
      savePlan(updatePiece(plan, uid, { r: rotateQuarter(piece.r) }));
    }
  }

  function remove(uid: number) {
    savePlan(removePiece(plan, uid));
    setSelected(null);
    setAnnouncement(t('removed'));
    canvasRef.current?.focus();
  }

  function resizeRoom(key: keyof Room, value: string) {
    savePlan(setRoom(plan, { ...plan.room, [key]: roomSizeFromMeters(value, plan.room[key]) }));
  }

  function toPlanPoint(event: PointerEvent<SVGGElement>) {
    const matrix = svgRef.current?.getScreenCTM();
    return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : null;
  }

  function finishDrag(uid: number) {
    if (!drag || drag.uid !== uid) {
      return;
    }
    savePlan(updatePiece(plan, uid, { x: drag.x, y: drag.y }));
    setDrag(null);
  }

  function sendToQuote() {
    if (plan.pieces.length === 0) {
      showToast({ text: t('needPieces') });
      return;
    }
    const note = t('roomNote', { width: widthM, depth: depthM });
    let full = false;
    for (const input of planToQuoteInputs(plan, note)) {
      if (quoteActions.add(input) === 'full') {
        full = true;
      }
    }
    showToast({ text: full ? q('listFull') : t('sent', { count: plan.pieces.length }), quoteLink: true });
  }

  function pieceProps(entry: PlanEntry): SVGProps<SVGGElement> {
    const { piece, product } = entry;
    const uid = piece.uid;
    return {
      tabIndex: 0,
      role: 'button',
      'aria-label': t('pieceLabel', {
        name: product.name,
        width: cmFormat.format(product.width),
        depth: cmFormat.format(product.depth),
      }),
      'aria-describedby': `${baseId}-hint`,
      onFocus: () => setSelected(uid),
      onPointerDown: (event) => {
        const point = toPlanPoint(event);
        if (!point) {
          return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        setSelected(uid);
        setDrag({ uid, offsetX: point.x - piece.x, offsetY: point.y - piece.y, x: piece.x, y: piece.y });
      },
      onPointerMove: (event) => {
        if (!drag || drag.uid !== uid) {
          return;
        }
        const point = toPlanPoint(event);
        if (point) {
          setDrag({ ...drag, x: snap(point.x - drag.offsetX), y: snap(point.y - drag.offsetY) });
        }
      },
      onPointerUp: () => finishDrag(uid),
      onPointerCancel: () => finishDrag(uid),
      onKeyDown: (event: KeyboardEvent<SVGGElement>) => {
        const delta = keyboardDelta(event.key, event.shiftKey);
        if (delta) {
          event.preventDefault();
          const x = piece.x + delta[0];
          const y = piece.y + delta[1];
          savePlan(updatePiece(plan, uid, { x, y }));
          setAnnouncement(t('moved', { name: product.name, x: cmFormat.format(x), y: cmFormat.format(y) }));
          return;
        }
        if (event.key === 'r' || event.key === 'R') {
          event.preventDefault();
          rotate(uid);
          return;
        }
        if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault();
          remove(uid);
        }
      },
    };
  }

  return (
    <div className="planner">
      <aside className="planner__side" aria-label={t('sideLabel')}>
        <fieldset className="room-fieldset">
          <legend className="label">{t('roomSize')}</legend>
          <div className="pair">
            <div className="field">
              <label htmlFor={`${baseId}-w`}>{t('roomWidth')}</label>
              <input
                key={`w-${plan.room.w}`}
                id={`${baseId}-w`}
                type="number"
                inputMode="decimal"
                min={ROOM_MIN_CM / 100}
                max={ROOM_MAX_CM / 100}
                step={0.1}
                defaultValue={(plan.room.w / 100).toFixed(1)}
                onBlur={(event) => resizeRoom('w', event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.currentTarget.blur();
                }}
              />
            </div>
            <div className="field">
              <label htmlFor={`${baseId}-d`}>{t('roomDepth')}</label>
              <input
                key={`d-${plan.room.d}`}
                id={`${baseId}-d`}
                type="number"
                inputMode="decimal"
                min={ROOM_MIN_CM / 100}
                max={ROOM_MAX_CM / 100}
                step={0.1}
                defaultValue={(plan.room.d / 100).toFixed(1)}
                onBlur={(event) => resizeRoom('d', event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.currentTarget.blur();
                }}
              />
            </div>
          </div>
        </fieldset>
        <PlannerLibrary initial={initialLibrary} onAdd={handleAdd} />
      </aside>

      <div className="planner__canvas" ref={canvasRef} tabIndex={-1}>
        <div className="canvas-bar">
          <span id={`${baseId}-hint`}>{t('hint')}</span>
          <span className="canvas-bar__actions">
            <button
              type="button"
              disabled={!selectedPiece}
              onClick={() => selectedPiece && rotate(selectedPiece.uid)}
            >
              <Icon name="rotate" />
              <span>{t('rotate')}</span>
            </button>
            <button
              type="button"
              disabled={!selectedPiece}
              onClick={() => selectedPiece && remove(selectedPiece.uid)}
            >
              <Icon name="trash" />
              <span>{t('remove')}</span>
            </button>
          </span>
        </div>
        <PlanSvg
          svgRef={svgRef}
          room={plan.room}
          pieces={entries}
          selectedUid={selected}
          conflicts={conflicts}
          label={t('canvasLabel', { width: widthM, depth: depthM })}
          widthLabel={t('meters', { value: widthM })}
          depthLabel={t('meters', { value: depthM })}
          pieceText={(entry) => ({
            name: entry.product.name,
            size: t('pieceSize', {
              width: cmFormat.format(entry.product.width),
              depth: cmFormat.format(entry.product.depth),
            }),
          })}
          pieceProps={pieceProps}
        />
        <p className="visually-hidden" role="status" aria-live="polite">
          {announcement}
        </p>
      </div>

      <aside className="planner__side" aria-labelledby={`${baseId}-checks`}>
        <h2 id={`${baseId}-checks`} className="planner__heading">
          {t('checks.title')}
        </h2>
        {plan.pieces.length > 0 ? (
          <ul className="checks">
            {conflicts.size > 0 ? (
              <li className="bad">
                <Icon name="close" />
                <span>{t('checks.conflicts', { count: conflicts.size })}</span>
              </li>
            ) : (
              <li className="good">
                <Icon name="check" />
                <span>{t('checks.ok')}</span>
              </li>
            )}
            <li>
              <Icon name="ruler" />
              <span>
                {usage > CIRCULATION_WARNING_PERCENT
                  ? t('checks.usageTight', { percent: usage })
                  : t('checks.usage', { percent: usage })}
              </span>
            </li>
          </ul>
        ) : null}
        <h2 className="planner__heading">{t('summary.title')}</h2>
        <ul className="summary-list num">
          {counts.length > 0 ? (
            counts.map(({ productId, count }) => (
              <li key={productId}>
                <span>{plan.products[String(productId)]?.name}</span>
                <span>{t('summary.count', { count })}</span>
              </li>
            ))
          ) : (
            <li>
              <span className="meta">{t('summary.empty')}</span>
            </li>
          )}
        </ul>
        <button type="button" className="btn btn--block" onClick={sendToQuote}>
          <Icon name="list" />
          <span>{t('sendToList')}</span>
        </button>
        <p className="meta">{t('sendHint')}</p>
      </aside>
    </div>
  );
}
```

- [ ] **Step 4: Página**

`web/src/app/[locale]/room-planner/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RoomPlanner } from '@/components/planner/RoomPlanner';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import type { Locale } from '@/i18n/config';
import { withBuildFallback } from '@/lib/api/build-fallback';
import { loadPlannerProducts } from '@/lib/planner/data';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

const LIBRARY_SIZE = 24;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'planner.meta' });
  const href = { pathname: '/room-planner' } as const;
  return buildMetadata({
    locale: locale as Locale,
    href,
    title: t('title'),
    description: t('description'),
    alternates: { pt: href, en: href },
  });
}

export default async function RoomPlannerPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, library] = await Promise.all([
    getTranslations({ locale, namespace: 'planner' }),
    getTranslations({ locale, namespace: 'common' }),
    withBuildFallback(loadPlannerProducts(locale, { sort: 'featured', per_page: LIBRARY_SIZE }), []),
  ]);
  return (
    <main className="wrap">
      <Breadcrumbs
        label={common('breadcrumb')}
        items={[{ label: common('home'), href: '/' }, { label: t('title') }]}
      />
      <div className="catalog-head catalog-head--tight">
        <div className="catalog-head__copy">
          <h1>{t('title')}</h1>
          <p className="lead">{t('intro')}</p>
        </div>
      </div>
      <RoomPlanner initialLibrary={library} />
    </main>
  );
}
```

- [ ] **Step 5: CSS e mensagens**

`web/src/styles/planner.css` — acrescentar:

```css
.room-fieldset {
  border: 0;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.planner__heading {
  font-size: 1.1rem;
}

.piece-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.piece-option__name {
  font-size: 0.875rem;
  font-weight: 500;
}

.piece-option__blank {
  width: 56px;
  aspect-ratio: 4 / 3;
  background: var(--stone);
}

.canvas-bar__actions {
  display: flex;
  gap: 8px;
}

.planner__canvas:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}
```

`messages/pt.json`:

```json
"planner": {
  "meta": {
    "title": "Sala para montar",
    "description": "Desenhe o ambiente com as medidas reais, posicione peças da Franccino em escala e envie para a lista de orçamento."
  },
  "title": "Sala para montar",
  "intro": "Desenhe o ambiente com as medidas reais, arraste as peças e veja o que cabe. Tudo em escala.",
  "sideLabel": "Ambiente e peças",
  "roomSize": "Medidas do ambiente (m)",
  "roomWidth": "Largura",
  "roomDepth": "Profundidade",
  "library": {
    "title": "Peças do catálogo",
    "search": "Buscar peça",
    "placeholder": "Sofá, poltrona, mesa…",
    "searching": "Buscando…",
    "noResults": "Nenhuma peça com medidas para esta busca.",
    "add": "Pôr {name} na sala",
    "sizeRect": "{width} × {depth} cm",
    "sizeRound": "Ø {diameter} cm"
  },
  "hint": "Arraste para mover. Com a peça selecionada, use as setas (Shift move 1 cm), R para girar e Delete para remover.",
  "rotate": "Girar",
  "remove": "Remover",
  "canvasLabel": "Planta do ambiente, {width} por {depth} metros",
  "planLabel": "Planta de exemplo de um ambiente de {width} por {depth} metros",
  "meters": "{value} m",
  "pieceLabel": "{name}, {width} por {depth} cm",
  "pieceSize": "{width} × {depth}",
  "moved": "{name} em {x}, {y} cm.",
  "added": "{name} entrou na sala.",
  "removed": "Peça removida.",
  "maxPieces": "A sala chegou ao limite de peças.",
  "checks": {
    "title": "Conferência",
    "ok": "Todas as peças cabem sem sobreposição.",
    "conflicts": "{count, plural, one {# peça sobreposta ou fora do ambiente.} other {# peças sobrepostas ou fora do ambiente.}}",
    "usage": "Piso ocupado: {percent}%",
    "usageTight": "Piso ocupado: {percent}%, pouca área de circulação"
  },
  "summary": { "title": "Peças na sala", "empty": "Nenhuma peça ainda.", "count": "{count}×" },
  "sendToList": "Enviar sala para a lista",
  "sendHint": "Vai para a lista de orçamento com as medidas do ambiente anotadas.",
  "needPieces": "Adicione ao menos uma peça à sala.",
  "sent": "Sala enviada para a lista ({count, plural, one {# peça} other {# peças}}).",
  "roomNote": "Sala {width} × {depth} m"
}
```

`messages/en.json`:

```json
"planner": {
  "meta": {
    "title": "Room planner",
    "description": "Draw your room with its real measures, place Franccino pieces to scale and send them to the quote list."
  },
  "title": "Room planner",
  "intro": "Draw the room with its real measures, drag the pieces and see what fits. Everything to scale.",
  "sideLabel": "Room and pieces",
  "roomSize": "Room size (m)",
  "roomWidth": "Width",
  "roomDepth": "Depth",
  "library": {
    "title": "Catalogue pieces",
    "search": "Find a piece",
    "placeholder": "Sofa, armchair, table…",
    "searching": "Searching…",
    "noResults": "No pieces with dimensions for this search.",
    "add": "Place {name} in the room",
    "sizeRect": "{width} × {depth} cm",
    "sizeRound": "Ø {diameter} cm"
  },
  "hint": "Drag to move. With a piece selected, use the arrow keys (Shift moves 1 cm), R to rotate and Delete to remove.",
  "rotate": "Rotate",
  "remove": "Remove",
  "canvasLabel": "Room plan, {width} by {depth} metres",
  "planLabel": "Sample plan of a {width} by {depth} metre room",
  "meters": "{value} m",
  "pieceLabel": "{name}, {width} by {depth} cm",
  "pieceSize": "{width} × {depth}",
  "moved": "{name} at {x}, {y} cm.",
  "added": "{name} is in the room.",
  "removed": "Piece removed.",
  "maxPieces": "The room reached its piece limit.",
  "checks": {
    "title": "Check",
    "ok": "Every piece fits without overlapping.",
    "conflicts": "{count, plural, one {# piece overlaps or is outside the room.} other {# pieces overlap or are outside the room.}}",
    "usage": "Floor used: {percent}%",
    "usageTight": "Floor used: {percent}%, little room to move around"
  },
  "summary": { "title": "Pieces in the room", "empty": "No pieces yet.", "count": "{count}×" },
  "sendToList": "Send room to the list",
  "sendHint": "Goes to the quote list with the room size noted.",
  "needPieces": "Add at least one piece to the room.",
  "sent": "Room sent to the list ({count, plural, one {# piece} other {# pieces}}).",
  "roomNote": "Room {width} × {depth} m"
}
```

- [ ] **Step 6: Rodar e commitar**

Run: `pnpm --filter web test` → Expected: PASS.
Run: lint + typecheck + `ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` → Expected: verde.
No navegador (com a API): `/pt/sala-para-montar` — pôr 3 peças, arrastar com mouse e com toque (DevTools, modo celular), mover só pelo teclado (Tab até a peça, setas, Shift+setas, R, Delete), conferir o aviso de sobreposição, mudar o ambiente para 3,2 × 2,8 m, recarregar a página (planta persiste), "Enviar sala para a lista" e ver o contador do header subir.

```bash
git add web
git commit -m "feat(web): adiciona a sala para montar com planta em escala, teclado e envio para a lista

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 11: Home

**Files:**

- Create: `web/src/components/home/{HeroSection,LaunchesSection,LinesSection,FeatureSection,PlannerTeaser,DesignersSection,FactorySection,TechnicalTeaser,StoresSection}.tsx`, `web/src/components/stores/StoreFinder.tsx`, `web/src/styles/home.css`
- Modify (reescrever): `web/src/app/[locale]/page.tsx`
- Modify: `web/src/app/globals.css`, `web/messages/{pt,en}.json`
- Test: `web/src/components/home/HeroSection.test.tsx`, `web/src/components/stores/StoreFinder.test.tsx`

**Interfaces:**

- Consumes: `getHome`, `getAreas`, `getDesigners`, `getPage`, `getStores`, `getSettings`, `getProducts`, `ApiImage`, `buildSrcSet`, `RichText`, `formatDimension`, `buildMetadata` (P3); `Icon`, `Link` (Task 1); `telHref`, `whatsappUrl` (Task 2); `withBuildFallback`, `EMPTY_HOME`, `emptyPage`, `EMPTY_SETTINGS` (Task 4); `ProductRail`, `QuickAddButton` (Task 5); `getProductDetails`, `TechTable`, `toTechnicalRow`, `primaryDimension`, `toProductCard` (Task 6); `PlanSvg`, `DEFAULT_ROOM` (Task 9).
- Produces:
  - `HeroSection({ banner: Banner | null; brandNames: string[]; designerCount: number })` — com banner: foto (e `image_mobile` via `<picture>`), título, subtítulo e CTA do banner; sem banner: placa sem foto com título de `messages`.
  - `LaunchesSection({ launch, products })`, `LinesSection({ areas })`, `FeatureSection({ product: ProductDetail })`, `PlannerTeaser()`, `DesignersSection({ designers })`, `FactorySection({ page })`, `TechnicalTeaser({ rows })`, `StoresSection({ stores, states, whatsapp })`.
  - `StoreFinder({ stores, states, children? })` (cliente; reusado pela página de lojas no P5).
  - Home: seções na ordem do protótipo; **cada seção só aparece se a API trouxer dados** (Global Constraints).

- [ ] **Step 1: Testes que falham**

`web/src/components/home/HeroSection.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { image } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { HeroSection } from './HeroSection';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('HeroSection', () => {
  it('uses the banner text, image and call to action', () => {
    const html = renderWithIntl(
      <HeroSection
        banner={{
          title: 'Casa e jardim no mesmo desenho',
          subtitle: null,
          cta_label: 'Conhecer a coleção',
          cta_url: 'https://franccino.com.br/pt/colecoes/tempo',
          image: image(),
          image_mobile: image({ id: 2 }),
        }}
        brandNames={['Franccino Casa', 'Franccino Giardini']}
        designerCount={16}
      />,
    );
    expect(html).toContain('<h1');
    expect(html).toContain('Casa e jardim no mesmo desenho');
    expect(html).toContain('href="https://franccino.com.br/pt/colecoes/tempo"');
    expect(html).toContain('<source media=');
    expect(html).toContain('loading="eager"');
    expect(html).toContain('href="/room-planner"');
    expect(html).toContain('16 designers');
  });

  it('falls back to a plain plate without inventing an image', () => {
    const html = renderWithIntl(<HeroSection banner={null} brandNames={[]} designerCount={0} />);
    expect(html).toContain('hero--plain');
    expect(html).not.toContain('<img');
    expect(html).toContain('href="/products"');
    expect(html).not.toContain('designers');
  });
});
```

`web/src/components/stores/StoreFinder.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import type { Store } from '@/lib/api/types';
import { renderWithIntl } from '@/test/intl';
import { StoreFinder } from './StoreFinder';

const store = (overrides: Partial<Store>): Store => ({
  id: 1,
  name: 'Franccino Lourdes',
  type: 'exclusive',
  address: 'Rua Marília de Dirceu, 204',
  address_complement: null,
  district: 'Lourdes',
  city: 'Belo Horizonte',
  state: 'MG',
  postal_code: null,
  country: 'BR',
  latitude: null,
  longitude: null,
  phone: '(31) 99746-9821',
  whatsapp: null,
  email: null,
  website_url: null,
  instagram_url: null,
  opening_hours: null,
  ...overrides,
});

describe('StoreFinder', () => {
  it('shows the stores of the first state and marks its chip', () => {
    const html = renderWithIntl(
      <StoreFinder
        stores={[
          store({}),
          store({ id: 2, name: 'Grupo Robusti', type: 'reseller', city: 'Ribeirão Preto', state: 'SP' }),
        ]}
        states={['MG', 'SP']}
      />,
    );
    expect(html).toContain('Franccino Lourdes');
    expect(html).not.toContain('Grupo Robusti');
    expect(html).toContain('aria-pressed="true">MG</button>');
    expect(html).toContain('href="tel:+5531997469821"');
    expect(html).toContain('Loja exclusiva');
  });
});
```

Run: `pnpm --filter web test` → Expected: FAIL.

- [ ] **Step 2: Lojas**

`web/src/components/stores/StoreFinder.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import type { Store } from '@/lib/api/types';
import { telHref } from '@/lib/contact-links';

function StoreCard({ store }: { store: Store }) {
  const t = useTranslations('stores');
  const type = t.has(`types.${store.type}`) ? t(`types.${store.type}`) : store.type;
  return (
    <article className="store">
      <h3>{store.name}</h3>
      <address>
        {store.address}
        {store.address_complement ? <span>{store.address_complement}</span> : null}
        {store.district ? <span>{store.district}</span> : null}
        <span>{t('cityState', { city: store.city, state: store.state })}</span>
      </address>
      <ul className="meta meta-inline">
        <li>{type}</li>
        {store.phone ? (
          <li>
            <a href={telHref(store.phone)}>{store.phone}</a>
          </li>
        ) : null}
      </ul>
    </article>
  );
}

/** Lojas por estado (UF), com botões de filtro (estado local, sem navegar). */
export function StoreFinder({
  stores,
  states,
  children,
}: {
  stores: Store[];
  states: string[];
  children?: ReactNode;
}) {
  const t = useTranslations('stores');
  const [state, setState] = useState<string | null>(states[0] ?? null);
  const visible = stores.filter((store) => store.state === state);
  return (
    <div className="stores">
      <div className="stores__intro">
        {children}
        <div className="chips" role="group" aria-label={t('stateFilter')}>
          {states.map((uf) => (
            <button
              key={uf}
              type="button"
              className="chip"
              aria-pressed={uf === state}
              onClick={() => setState(uf)}
            >
              {uf}
            </button>
          ))}
        </div>
      </div>
      <div className="store-list" aria-live="polite">
        {visible.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Seções**

`web/src/components/home/HeroSection.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { Banner } from '@/lib/api/types';
import { buildSrcSet } from '@/lib/images/srcset';

type HeroSectionProps = { banner: Banner | null; brandNames: string[]; designerCount: number };

export function HeroSection({ banner, brandNames, designerCount }: HeroSectionProps) {
  const t = useTranslations('home.hero');
  const hasMeta = brandNames.length > 0 || designerCount > 0;
  return (
    <section className={banner ? 'hero' : 'hero hero--plain'} aria-labelledby="hero-title">
      {banner ? (
        <picture className="hero__picture">
          {banner.image_mobile ? (
            <source media="(max-width: 47.99rem)" srcSet={buildSrcSet(banner.image_mobile)} sizes="100vw" />
          ) : null}
          <ApiImage image={banner.image} sizes="100vw" priority className="hero__img" />
        </picture>
      ) : null}
      <div className="hero__plate">
        <h1 className="display" id="hero-title">
          {banner?.title ?? t('fallbackTitle')}
        </h1>
        {banner?.subtitle ? <p className="lead">{banner.subtitle}</p> : null}
        <div className="hero__actions">
          {banner?.cta_label && banner.cta_url ? (
            <a className="btn" href={banner.cta_url}>
              {banner.cta_label}
            </a>
          ) : (
            <Link className="btn" href="/products">
              {t('catalog')}
            </Link>
          )}
          <Link className="btn btn--ghost" href="/room-planner">
            <Icon name="ruler" />
            <span>{t('planner')}</span>
          </Link>
        </div>
        {hasMeta ? (
          <ul className="meta hero__meta">
            {brandNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
            {designerCount > 0 ? <li>{t('designers', { count: designerCount })}</li> : null}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
```

`web/src/components/home/LaunchesSection.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { ProductRail } from '@/components/products/ProductRail';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { LaunchCard, ProductCard } from '@/lib/api/types';

export function LaunchesSection({ launch, products }: { launch: LaunchCard; products: ProductCard[] }) {
  const t = useTranslations('home.launches');
  return (
    <section className="section" aria-labelledby="launches-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <h2 id="launches-title">{t('title')}</h2>
            <p className="lead">{launch.summary ?? launch.title}</p>
          </div>
          <Link className="link-arrow" href={{ pathname: '/launches/[slug]', params: { slug: launch.slug } }}>
            <span>{t('viewAll')}</span>
            <Icon name="arrow" />
          </Link>
        </div>
        <ProductRail label={launch.title} products={products} showNew />
      </div>
    </section>
  );
}
```

`web/src/components/home/LinesSection.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { RichText } from '@/components/content/RichText';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { Area } from '@/lib/api/types';
import { areaPath } from '@/lib/catalog/area';

export function LinesSection({ areas }: { areas: Area[] }) {
  const t = useTranslations('home.lines');
  return (
    <section className="lines" aria-label={t('label')}>
      {areas.map((area) => (
        <Link key={area.key} className="line-panel" href={areaPath(area.key)}>
          {area.cover ? <ApiImage image={area.cover} sizes="(max-width: 51.25rem) 100vw, 50vw" /> : null}
          <div className="line-panel__copy">
            <h2 className="display">{area.brand_name}</h2>
            {area.description ? <RichText html={area.description} /> : null}
            <span className="link-arrow">
              <span>{t('viewPieces')}</span>
              <Icon name="arrow" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
```

`web/src/components/home/FeatureSection.tsx`:

```tsx
import { useLocale, useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { QuickAddButton } from '@/components/products/QuickAddButton';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import type { ProductDetail } from '@/lib/api/types';
import { toProductCard } from '@/lib/catalog/card';
import { primaryDimension } from '@/lib/catalog/technical';
import { formatDimension } from '@/lib/format/dimensions';

/** Primeira peça em destaque da API, com fatos que ela mesma traz (nada escrito à mão). */
export function FeatureSection({ product }: { product: ProductDetail }) {
  const t = useTranslations('home.feature');
  const locale = useLocale() as Locale;
  const dimension = primaryDimension(product.dimensions);
  return (
    <section className="feature" aria-labelledby="feature-title">
      <div className="wrap feature__grid">
        <div className="feature__media">
          {product.cover ? (
            <ApiImage image={product.cover} sizes="(max-width: 56.25rem) 100vw, 58vw" />
          ) : null}
        </div>
        <div className="feature__copy">
          <h2 id="feature-title" className="display">
            {product.name}
          </h2>
          {product.tagline ? <p className="lead">{product.tagline}</p> : null}
          <dl className="facts num">
            {dimension ? (
              <div>
                <dt>{t('dimensions')}</dt>
                <dd>{formatDimension(dimension, locale)}</dd>
              </div>
            ) : null}
            {product.materials ? (
              <div>
                <dt>{t('materials')}</dt>
                <dd>{product.materials}</dd>
              </div>
            ) : null}
            {product.designer ? (
              <div>
                <dt>{t('designer')}</dt>
                <dd>{product.designer.name}</dd>
              </div>
            ) : null}
          </dl>
          <div className="hero__actions">
            <Link className="btn" href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}>
              {t('view')}
            </Link>
            <QuickAddButton product={toProductCard(product)} variant="button" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

`web/src/components/home/PlannerTeaser.tsx`:

```tsx
import { useLocale, useTranslations } from 'next-intl';
import { PlanSvg } from '@/components/planner/PlanSvg';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { DEFAULT_ROOM } from '@/lib/planner/types';

/** Planta vazia de exemplo (conflito C17): mostra a ferramenta sem inventar composição. */
export function PlannerTeaser() {
  const t = useTranslations('home.teaser');
  const planner = useTranslations('planner');
  const locale = useLocale() as Locale;
  const meters = new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en', { minimumFractionDigits: 2 });
  const width = meters.format(DEFAULT_ROOM.w / 100);
  const depth = meters.format(DEFAULT_ROOM.d / 100);
  return (
    <section className="section section--paper" aria-labelledby="teaser-title">
      <div className="wrap teaser">
        <div className="teaser__copy">
          <h2 id="teaser-title" className="display display--section">
            {t('title')}
          </h2>
          <p className="lead">{t('body')}</p>
          <div>
            <Link className="btn" href="/room-planner">
              <Icon name="ruler" />
              <span>{t('cta')}</span>
            </Link>
          </div>
        </div>
        <div className="teaser__plan">
          <PlanSvg
            room={DEFAULT_ROOM}
            pieces={[]}
            label={planner('planLabel', { width, depth })}
            widthLabel={planner('meters', { value: width })}
            depthLabel={planner('meters', { value: depth })}
          />
        </div>
      </div>
    </section>
  );
}
```

`web/src/components/home/DesignersSection.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { DesignerCard } from '@/lib/api/types';

const SHOWN = 4;

export function DesignersSection({ designers }: { designers: DesignerCard[] }) {
  const t = useTranslations('home.designers');
  return (
    <section className="section" aria-labelledby="designers-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <h2 id="designers-title">{t('title')}</h2>
            <p className="lead">{t('lead')}</p>
          </div>
          <Link className="link-arrow" href="/designers">
            <span>{t('all')}</span>
            <Icon name="arrow" />
          </Link>
        </div>
        <div className="designers">
          {designers.slice(0, SHOWN).map((designer) => (
            <Link
              key={designer.id}
              className="designer"
              href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}
            >
              <div className="designer__photo">
                {designer.portrait ? (
                  <ApiImage image={designer.portrait} sizes="(max-width: 56.25rem) 50vw, 25vw" />
                ) : null}
              </div>
              <h3>{designer.name}</h3>
              {designer.short_bio ? <p className="meta">{designer.short_bio}</p> : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

`web/src/components/home/FactorySection.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { PageContent } from '@/lib/api/types';

/** Título, introdução e capa da página `factory` do painel (sem fatos escritos à mão, conflito C4). */
export function FactorySection({ page }: { page: PageContent }) {
  const t = useTranslations('home.factory');
  return (
    <section className="section section--paper" aria-labelledby="factory-title">
      <div className="wrap factory">
        <div className="factory__media">
          {page.cover ? <ApiImage image={page.cover} sizes="(max-width: 56.25rem) 100vw, 50vw" /> : null}
        </div>
        <div className="factory__copy">
          <h2 id="factory-title">{page.title}</h2>
          {page.intro ? <p className="lead">{page.intro}</p> : null}
          <div>
            <Link className="link-arrow" href="/factory">
              <span>{t('cta')}</span>
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

`web/src/components/home/TechnicalTeaser.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { TechTable } from '@/components/catalog/TechTable';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { TechnicalRow } from '@/lib/catalog/technical';

export function TechnicalTeaser({ rows }: { rows: TechnicalRow[] }) {
  const t = useTranslations('home.technical');
  return (
    <section className="section" aria-labelledby="technical-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <h2 id="technical-title">{t('title')}</h2>
            <p className="lead">{t('lead')}</p>
          </div>
          <Link className="link-arrow" href={{ pathname: '/products', query: { view: 'table' } }}>
            <span>{t('cta')}</span>
            <Icon name="arrow" />
          </Link>
        </div>
        <TechTable rows={rows} />
      </div>
    </section>
  );
}
```

`web/src/components/home/StoresSection.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { StoreFinder } from '@/components/stores/StoreFinder';
import { Icon } from '@/components/ui/Icon';
import type { Store } from '@/lib/api/types';
import { whatsappUrl } from '@/lib/contact-links';

type StoresSectionProps = { stores: Store[]; states: string[]; whatsapp: string | null };

export function StoresSection({ stores, states, whatsapp }: StoresSectionProps) {
  const t = useTranslations('home.stores');
  const common = useTranslations('common');
  const consultant = whatsappUrl(whatsapp);
  return (
    <section className="section section--paper" aria-labelledby="stores-title">
      <div className="wrap">
        <StoreFinder stores={stores} states={states}>
          <h2 id="stores-title">{t('title')}</h2>
          <p className="lead">{t('lead')}</p>
          {consultant ? (
            <a className="btn btn--ghost" href={consultant} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" />
              <span>{t('consultant')}</span>
              <span className="visually-hidden">{common('opensInNewWindow')}</span>
            </a>
          ) : null}
        </StoreFinder>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Página**

`web/src/app/[locale]/page.tsx` (substitui o do P3):

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DesignersSection } from '@/components/home/DesignersSection';
import { FactorySection } from '@/components/home/FactorySection';
import { FeatureSection } from '@/components/home/FeatureSection';
import { HeroSection } from '@/components/home/HeroSection';
import { LaunchesSection } from '@/components/home/LaunchesSection';
import { LinesSection } from '@/components/home/LinesSection';
import { PlannerTeaser } from '@/components/home/PlannerTeaser';
import { StoresSection } from '@/components/home/StoresSection';
import { TechnicalTeaser } from '@/components/home/TechnicalTeaser';
import type { Locale } from '@/i18n/config';
import { withBuildFallback } from '@/lib/api/build-fallback';
import { getAreas, getProductDetails, getProducts } from '@/lib/api/catalog';
import { getDesigners, getHome, getPage, getSettings, getStores } from '@/lib/api/content';
import { EMPTY_HOME, emptyPage } from '@/lib/api/empty';
import type { ProductCard } from '@/lib/api/types';
import { toTechnicalRow } from '@/lib/catalog/technical';
import { buildMetadata } from '@/lib/seo/metadata';
import { EMPTY_SETTINGS } from '@/lib/settings';

type Props = { params: Promise<{ locale: string }> };

const TECHNICAL_ROWS = 5;
const LAUNCH_PRODUCTS = 12;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.meta' });
  const href = { pathname: '/' } as const;
  return buildMetadata({
    locale: locale as Locale,
    href,
    title: t('title'),
    description: t('description'),
    alternates: { pt: href, en: href },
  });
}

export default async function HomePage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [home, areas, designers, factory, storeList, settings] = await Promise.all([
    withBuildFallback(getHome(locale), EMPTY_HOME),
    withBuildFallback(getAreas(locale), []),
    withBuildFallback(getDesigners(locale), []),
    withBuildFallback(getPage(locale, 'factory'), null),
    withBuildFallback(getStores(locale), { stores: [], states: [] }),
    withBuildFallback(getSettings(locale), EMPTY_SETTINGS),
  ]);
  const launch = home.current_launch;
  const [launchPage, featured] = await Promise.all([
    launch
      ? withBuildFallback(
          getProducts(locale, { launch: launch.slug, per_page: LAUNCH_PRODUCTS }),
          emptyPage<ProductCard>(),
        )
      : Promise.resolve(emptyPage<ProductCard>()),
    withBuildFallback(
      getProductDetails(
        locale,
        home.featured_products.slice(0, TECHNICAL_ROWS).map((product) => product.slug),
      ),
      [],
    ),
  ]);
  const feature = featured[0] ?? null;

  return (
    <main>
      <HeroSection
        banner={home.banners[0] ?? null}
        brandNames={areas.map((area) => area.brand_name)}
        designerCount={designers.length}
      />
      {launch && launchPage.data.length > 0 ? (
        <LaunchesSection launch={launch} products={launchPage.data} />
      ) : null}
      {areas.length > 0 ? <LinesSection areas={areas} /> : null}
      {feature ? <FeatureSection product={feature} /> : null}
      <PlannerTeaser />
      {home.designers.length > 0 ? <DesignersSection designers={home.designers} /> : null}
      {factory ? <FactorySection page={factory} /> : null}
      {featured.length > 0 ? <TechnicalTeaser rows={featured.map(toTechnicalRow)} /> : null}
      {storeList.stores.length > 0 ? (
        <StoresSection
          stores={storeList.stores}
          states={storeList.states}
          whatsapp={settings.quotes_whatsapp}
        />
      ) : null}
    </main>
  );
}
```

(O `h1` da home é o título do hero. `PlannerTeaser` não depende da API, então sempre aparece.)

- [ ] **Step 5: CSS e mensagens**

`web/src/styles/home.css` — portar de `design/prototype/assets/styles.css` os blocos `hero` (441–506), `planner teaser` (721–746), `designers` (748–784), `factory` (786–834), `stores` (889–925), `linhas em tela cheia` (1840–1899) e `peça em destaque` (1901–1932), com as edições:

1. `var(--ink-2)` → `var(--ink-muted)`; `#d9d3c7` → `var(--hero-ground)`; `#e4e1da` → `var(--portrait-ground)`.
2. `.hero__plate .meta` → `.hero__meta`, acrescentando `list-style: none; margin: 0;` (a `padding-top` e a borda ficam).
3. A animação `plate-in` do hero e o bloco `prefers-reduced-motion` dele ficam como estão.
4. Acrescentar:

```css
.hero__picture {
  position: absolute;
  inset: 0;
}

.hero--plain {
  height: auto;
  background: var(--stone);
  padding-block: clamp(48px, 8vw, 120px);
}

.hero--plain .hero__plate {
  position: static;
  margin-inline: var(--gutter);
}

.teaser__plan .plan-svg {
  display: block;
  width: 100%;
  height: auto;
  touch-action: auto;
}

.stores__intro {
  display: grid;
  gap: 20px;
  align-content: start;
}

.store address span {
  display: block;
}

.designer {
  color: inherit;
  text-decoration: none;
}
```

`web/src/app/globals.css`: `@import '../styles/home.css' layer(components);`

`messages/pt.json`:

```json
"home": {
  "meta": {
    "title": "Móveis de design autoral",
    "description": "Catálogo da Franccino: móveis de design autoral das linhas Casa e Giardini, com medidas, acabamentos e arquivos técnicos."
  },
  "hero": {
    "fallbackTitle": "Móveis de design autoral",
    "catalog": "Ver o catálogo",
    "planner": "Montar uma sala",
    "designers": "{count, plural, one {# designer} other {# designers}}"
  },
  "launches": { "title": "Lançamentos", "viewAll": "Ver o lançamento" },
  "lines": { "label": "Linhas", "viewPieces": "Ver peças" },
  "feature": { "dimensions": "Medidas", "materials": "Materiais", "designer": "Design", "view": "Ver a peça" },
  "teaser": {
    "title": "Monte a sua sala em escala antes de pedir o orçamento.",
    "body": "Informe as medidas do ambiente, posicione as peças com as dimensões reais e veja o que cabe. A sala vira uma lista de orçamento.",
    "cta": "Abrir a Sala para montar"
  },
  "designers": { "title": "Quem desenha", "lead": "Designers e estúdios que assinam peças com a fábrica.", "all": "Todos os designers" },
  "factory": { "cta": "Conhecer a fábrica" },
  "technical": {
    "title": "Para quem especifica",
    "lead": "Medidas e arquivos técnicos de cada peça, numa tabela só.",
    "cta": "Abrir a área técnica"
  },
  "stores": {
    "title": "Veja as peças nas lojas",
    "lead": "Lojas exclusivas e revendas. Escolha o estado.",
    "consultant": "Falar com um consultor"
  }
},
"stores": {
  "stateFilter": "Estado",
  "cityState": "{city} — {state}",
  "types": { "exclusive": "Loja exclusiva", "reseller": "Revenda" }
}
```

`messages/en.json`:

```json
"home": {
  "meta": {
    "title": "Authorial design furniture",
    "description": "Franccino catalogue: authorial design furniture from the Casa and Giardini lines, with dimensions, finishes and technical files."
  },
  "hero": {
    "fallbackTitle": "Authorial design furniture",
    "catalog": "See the catalogue",
    "planner": "Plan a room",
    "designers": "{count, plural, one {# designer} other {# designers}}"
  },
  "launches": { "title": "Novelties", "viewAll": "See the launch" },
  "lines": { "label": "Lines", "viewPieces": "See pieces" },
  "feature": { "dimensions": "Dimensions", "materials": "Materials", "designer": "Design", "view": "See the piece" },
  "teaser": {
    "title": "Plan your room to scale before asking for a quote.",
    "body": "Enter the room size, place the pieces with their real dimensions and see what fits. The room becomes a quote list.",
    "cta": "Open the room planner"
  },
  "designers": { "title": "Who designs", "lead": "Designers and studios who sign pieces with the factory.", "all": "All designers" },
  "factory": { "cta": "Visit the factory" },
  "technical": {
    "title": "For specifiers",
    "lead": "Dimensions and technical files for every piece, in one table.",
    "cta": "Open the technical area"
  },
  "stores": {
    "title": "See the pieces in store",
    "lead": "Exclusive stores and resellers. Choose a state.",
    "consultant": "Talk to a consultant"
  }
},
"stores": {
  "stateFilter": "State",
  "cityState": "{city} — {state}",
  "types": { "exclusive": "Exclusive store", "reseller": "Reseller" }
}
```

- [ ] **Step 6: Rodar e commitar**

Run: `pnpm --filter web test` → Expected: PASS.
Run: lint + typecheck + `ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` → Expected: verde; sem API, `/pt` sai só com hero sem foto e o teaser da sala.
Com a API: `/pt` e `/en` com todas as seções; desligar uma seção no painel (ex.: sem banner) e conferir que a home não quebra.

```bash
git add web
git commit -m "feat(web): monta a home com secoes alimentadas pela API

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 12: Lista de orçamento e verificação final

**Files:**

- Create: `web/src/components/quote/QuoteListView.tsx`, `web/src/app/[locale]/quote-list/page.tsx`, `web/src/styles/quote.css`
- Modify: `web/src/app/globals.css`, `web/messages/{pt,en}.json`, `web/CLAUDE.md` (mapa de pastas)
- Test: `web/src/components/quote/QuoteListView.test.tsx`

**Interfaces:**

- Consumes: `ContactForm` (Task 3); `useQuoteItems`, `quoteActions`, `quoteItemKey`, `totalQuantity`, `buildQuoteMessage`, `buildWhatsAppText`, `formatFinishes`, `toContactItems`, `whatsappUrl`, `useIsClient`, `showToast` (Task 2); `QuantityStepper` (Task 7); `SnapshotImage` (Task 10); `Breadcrumbs`, `Icon` (Task 1); `getSettings`, `buildMetadata`, `htmlLang` (P3).
- Produces:
  - `QuoteListView({ whatsapp: string | null })` — estados: carregando (antes da hidratação, para não piscar "vazia"), vazia, com itens (quantidade, remover, formulário com `items`, WhatsApp) e enviada.
  - Rota `/quote-list` (`/pt/lista-de-orcamento`, `/en/quote-list`), `noindex` (conteúdo pessoal, vive no navegador).

- [ ] **Step 1: Teste que falha**

`web/src/components/quote/QuoteListView.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { QuoteListView } from './QuoteListView';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);
vi.mock('@/components/forms/Turnstile', () => ({ Turnstile: () => null }));

describe('QuoteListView', () => {
  it('renders a busy placeholder on the server instead of flashing the empty state', () => {
    const html = renderWithIntl(<QuoteListView whatsapp="5511942900080" />);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('Sua lista de orçamento está vazia');
  });
});
```

(Os estados com itens dependem do `localStorage` e são conferidos no navegador no Step 5; a lógica deles já está coberta pelos testes da Task 2.)

Run: `pnpm --filter web test` → Expected: FAIL.

- [ ] **Step 2: Componente**

`web/src/components/quote/QuoteListView.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { ContactForm } from '@/components/forms/ContactForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Icon } from '@/components/ui/Icon';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { SnapshotImage } from '@/components/ui/SnapshotImage';
import { htmlLang } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { whatsappUrl } from '@/lib/contact-links';
import { useQuoteItems } from '@/lib/quote/hooks';
import { quoteItemKey, totalQuantity } from '@/lib/quote/list';
import { buildQuoteMessage, buildWhatsAppText, formatFinishes, toContactItems } from '@/lib/quote/message';
import { quoteActions } from '@/lib/quote/store';
import type { QuoteItem } from '@/lib/quote/types';
import { showToast } from '@/lib/ui/toast';
import { useIsClient } from '@/lib/ui/use-is-client';

function QuoteItemRow({ item, onRemoved }: { item: QuoteItem; onRemoved: () => void }) {
  const t = useTranslations('quote');
  const key = quoteItemKey(item);

  function remove() {
    const removed = quoteActions.remove(key);
    if (removed) {
      showToast({ text: t('removed', { name: removed.name }) });
      onRemoved();
    }
  }

  return (
    <li className="quote-item">
      {item.image ? (
        <SnapshotImage image={item.image} />
      ) : (
        <span className="quote-item__blank" aria-hidden="true" />
      )}
      <div className="quote-item__copy">
        <h2 className="quote-item__name">
          {/* O item guarda o idioma em que entrou na lista: o link e o nome seguem esse idioma. */}
          <Link
            href={{ pathname: '/products/[slug]', params: { slug: item.slug } }}
            locale={item.locale}
            lang={htmlLang(item.locale)}
          >
            {item.name}
          </Link>
        </h2>
        <p className="meta">{formatFinishes(item.finishes, t('pendingFinish'))}</p>
        {item.note ? <p className="meta">{item.note}</p> : null}
      </div>
      <div className="quote-item__actions">
        <QuantityStepper
          value={item.quantity}
          onChange={(quantity) => quoteActions.setQuantity(key, quantity)}
          label={t('quantityOf', { name: item.name })}
        />
        <button className="remove" type="button" onClick={remove}>
          <Icon name="trash" />
          <span>{t('remove')}</span>
        </button>
      </div>
    </li>
  );
}

export function QuoteListView({ whatsapp }: { whatsapp: string | null }) {
  const t = useTranslations('quote');
  const common = useTranslations('common');
  const isClient = useIsClient();
  const items = useQuoteItems();
  const [sent, setSent] = useState(false);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  if (!isClient) {
    return (
      <div className="wrap quote-page" aria-busy="true">
        <p className="meta">{common('loading')}</p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="wrap quote-page">
        <div className="empty" role="status">
          <h1>{t('sent.title')}</h1>
          <p className="lead">{t('sent.body')}</p>
          <div className="empty__actions">
            <Link className="btn" href="/products">
              {t('empty.catalog')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="wrap quote-page">
        <div className="empty">
          <h1>{t('empty.title')}</h1>
          <p className="lead">{t('empty.body')}</p>
          <div className="empty__actions">
            <Link className="btn" href="/products">
              {t('empty.catalog')}
            </Link>
            <Link className="btn btn--ghost" href="/room-planner">
              {t('empty.planner')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pending = t('pendingFinish');
  const whatsappHref = whatsappUrl(whatsapp, buildWhatsAppText(items, t('whatsappIntro'), pending));

  return (
    <div className="wrap">
      <Breadcrumbs
        label={common('breadcrumb')}
        items={[{ label: common('home'), href: '/' }, { label: t('title') }]}
      />
      <div className="catalog-head catalog-head--tight">
        <div className="catalog-head__copy">
          <h1 ref={titleRef} tabIndex={-1}>
            {t('title')}
          </h1>
          <p className="lead">{t('intro')}</p>
        </div>
        <p className="meta num">{t('pieces', { count: totalQuantity(items) })}</p>
      </div>
      <div className="quote">
        <ul className="quote-items">
          {items.map((item) => (
            <QuoteItemRow key={quoteItemKey(item)} item={item} onRemoved={() => titleRef.current?.focus()} />
          ))}
        </ul>
        <section className="quote-form" aria-labelledby="quote-form-title">
          <h2 id="quote-form-title">{t('form.title')}</h2>
          <ContactForm
            type="quote"
            items={toContactItems(items)}
            composeMessage={(typed) => buildQuoteMessage(items, typed, t('messageHeading'), pending)}
            messageRequired={false}
            messageLabel={t('form.notes')}
            messagePlaceholder={t('form.notesPlaceholder')}
            submitLabel={t('form.submit')}
            onSuccess={() => {
              quoteActions.clear();
              setSent(true);
            }}
          />
          {whatsappHref ? (
            <a
              className="btn btn--ghost btn--block"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="chat" />
              <span>{t('form.whatsapp')}</span>
              <span className="visually-hidden">{common('opensInNewWindow')}</span>
            </a>
          ) : null}
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Página**

`web/src/app/[locale]/quote-list/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { QuoteListView } from '@/components/quote/QuoteListView';
import type { Locale } from '@/i18n/config';
import { withBuildFallback } from '@/lib/api/build-fallback';
import { getSettings } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';
import { EMPTY_SETTINGS } from '@/lib/settings';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'quote' });
  const href = { pathname: '/quote-list' } as const;
  return buildMetadata({
    locale: locale as Locale,
    href,
    title: t('title'),
    alternates: { pt: href, en: href },
    noindex: true,
  });
}

export default async function QuoteListPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const settings = await withBuildFallback(getSettings(locale), EMPTY_SETTINGS);
  return (
    <main>
      <QuoteListView whatsapp={settings.quotes_whatsapp} />
    </main>
  );
}
```

- [ ] **Step 4: CSS, mensagens e `web/CLAUDE.md`**

`web/src/styles/quote.css` — portar de `design/prototype/assets/styles.css` o bloco `quote list page` **sem** `.consent`, `.consent input` e `.form-status` (já em `forms.css`) (1683–1732 e 1757–1779), e de `ajustes da revisão` as regras de `.quote` e `.quote-item` (1962–1976), com as edições:

1. `var(--ink-2)` → `var(--ink-muted)`.
2. `.quote-item img` → `.quote-item img, .quote-item__blank` (o `__blank` ganha `background: var(--stone)`).
3. `.quote-item > :last-child` → `.quote-item__actions`.
4. Acrescentar:

```css
.quote-page {
  padding-block: 64px 120px;
}

.quote-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.quote-item__copy {
  display: grid;
  gap: 6px;
}

.quote-item__name {
  font-size: 1.1rem;
}

.quote-item__name a {
  text-decoration: none;
}

.quote-item__actions {
  display: grid;
  gap: 10px;
  justify-items: end;
}

.quote-form h2 {
  font-size: 1.25rem;
}
```

`web/src/app/globals.css`: `@import '../styles/quote.css' layer(components);`

`messages/pt.json`, dentro de `quote`:

```json
"title": "Lista de orçamento",
"intro": "Confira acabamentos e quantidades. A equipe da Franccino responde com o orçamento e a loja mais próxima.",
"pieces": "{count, plural, one {# peça} other {# peças}}",
"remove": "Remover",
"removed": "{name} saiu da lista.",
"quantityOf": "Quantidade de {name}",
"messageHeading": "Peças da lista de orçamento:",
"whatsappIntro": "Olá! Quero um orçamento destas peças:",
"form": {
  "title": "Seus dados",
  "notes": "Observações",
  "notesPlaceholder": "Prazo, endereço de entrega, medidas especiais…",
  "submit": "Enviar pedido de orçamento",
  "whatsapp": "Enviar a lista pelo WhatsApp"
},
"empty": {
  "title": "Sua lista de orçamento está vazia",
  "body": "Junte as peças que interessam, com acabamento e quantidade, e mande tudo de uma vez para a equipe.",
  "catalog": "Ver o catálogo",
  "planner": "Montar uma sala"
},
"sent": {
  "title": "Pedido enviado",
  "body": "Recebemos a sua lista. A equipe da Franccino responde pelo e-mail informado."
}
```

`messages/en.json`, dentro de `quote`:

```json
"title": "Quote list",
"intro": "Check finishes and quantities. The Franccino team replies with the quote and the nearest store.",
"pieces": "{count, plural, one {# piece} other {# pieces}}",
"remove": "Remove",
"removed": "{name} was removed from the list.",
"quantityOf": "Quantity of {name}",
"messageHeading": "Pieces on the quote list:",
"whatsappIntro": "Hello! I would like a quote for these pieces:",
"form": {
  "title": "Your details",
  "notes": "Notes",
  "notesPlaceholder": "Timing, delivery address, custom sizes…",
  "submit": "Send quote request",
  "whatsapp": "Send the list by WhatsApp"
},
"empty": {
  "title": "Your quote list is empty",
  "body": "Gather the pieces you like, with finish and quantity, and send them to the team at once.",
  "catalog": "See the catalogue",
  "planner": "Plan a room"
},
"sent": {
  "title": "Request sent",
  "body": "We received your list. The Franccino team will reply to the email you provided."
}
```

`web/CLAUDE.md` — atualizar o mapa de pastas com o que este plano criou (`src/styles/`, `components/{ui,products,catalog,planner,quote,home,stores}`, `lib/{quote,planner,product,catalog,forms,ui}`, `test/`) e acrescentar: "Estado do navegador (lista e planta) só por `src/lib/quote/store.ts` e `src/lib/planner/plan-store.ts`; componentes leem com os hooks, nunca direto do `localStorage`."

- [ ] **Step 5: Verificação final (plano inteiro)**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web test && ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build`
Expected: tudo verde.

Checagens de regra (as três primeiras devem voltar vazias):

```bash
grep -rnE "#[0-9a-fA-F]{6}\b" web/src --include=*.tsx --include=*.ts
grep -rnE "#[0-9a-fA-F]{3,6}\b" web/src/styles | grep -v tokens.css | grep -v "#000;"
grep -rn "ink-2\|ink-3\|--ok\b" web/src/styles
grep -rn "localStorage" web/src --include=*.tsx
grep -rn "border-radius" web/src/styles
```

A quarta também deve voltar vazia; a última só pode listar `.list-count` e `.area-dot` (as duas exceções do DESIGN.md).

Com a API local no ar (`pnpm dev` na raiz; conteúdo de demonstração), no navegador, em 375 px e 1440 px:

1. `/pt` e `/en`: todas as seções; Tab desde o topo passa por "pular para o conteúdo", menu, busca, idioma, lista.
2. `/pt/produtos`, `/pt/produtos?view=table`, `/pt/indoor`, uma categoria, `/en/novelties` e um lançamento.
3. Página de produto: acabamentos por teclado, adicionar 2 unidades, WhatsApp com o texto certo, download, `?view=3d` com um GLB de teste subido no painel.
4. `/pt/sala-para-montar`: fluxo do Step 6 da Task 10.
5. `/pt/lista-de-orcamento`: mudar quantidades, remover (foco volta ao título), enviar → Mailpit (`http://localhost:8025`) mostra a mensagem com os itens; a lista esvazia e aparece "Pedido enviado".
6. Lighthouse do Chrome (modo mobile, 4G simulado) em `/pt` e numa página de produto: LCP < 2,5 s, CLS < 0,1, Acessibilidade sem falhas; anotar os números no PR.
7. DevTools → Rendering → `prefers-reduced-motion: reduce`: sem animação da placa do hero nem do contador.

Corrigir o que falhar dentro das tasks correspondentes (commit `fix(web): …`).

- [ ] **Step 6: Commit**

```bash
git add web
git commit -m "feat(web): adiciona a pagina da lista de orcamento com envio de itens e WhatsApp

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Próximo plano (P5)

Ficam para o P5 (hoje só com o esqueleto funcional do P3, sem o design system aplicado):

- Designers (lista e detalhe), Coleções (lista e detalhe), Projetos (lista e detalhe) e Corporativo (com logos de clientes).
- Fábrica (blocos de página: `timeline`, `stats`, `image_text` etc. no design system) e Acabamentos (cartela a partir de `/finishes`).
- Lojas (página completa com filtros de estado e tipo, reusando `StoreFinder`) e Downloads (reusando `TechTable`/`DownloadButton`).
- Contato com FAQ, Busca (resultados de produtos, designers e coleções), Privacidade e Termos.
- `not-found`/`error` no design system; logo em SVG no lugar do wordmark provisório e troca da fonte quando o manual de marca chegar; `/room-planner` no `sitemap.xml`.
- Se o tech lead aprovar a proposta A4, trocar as buscas de detalhe da tabela técnica e da sala pelo campo novo do `ProductCard`.
- Testes de ponta a ponta (Playwright) na fase de QA (spec §8).
