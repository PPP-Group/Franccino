# P5a — Páginas restantes do front no design system: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levar ao design system as páginas que o P4 deixou com o esqueleto funcional do P3 — coleções, designers, projetos, corporativo, fábrica, acabamentos, lojas, downloads, contato (com FAQ), busca, privacidade, termos e as páginas de erro — começando pelas telas no protótipo para aprovação por escrito, e reaproveitando os componentes do P4.

**Architecture:** Mesma arquitetura do P4. Páginas são Server Components que leem a API por `src/lib/api`; só lojas (filtro por estado e tipo), formulários e botões de download são Client Components. Dois componentes novos de apresentação (`PageHead` e `Tile`) e a reescrita visual de `Blocks` (blocos de página do painel) cobrem quase todas as telas; o CSS novo fica em `src/styles/pages.css`, na camada `components`, só com tokens. Lógica nova (filtro de lojas, link de mapa, tipo de projeto) em módulos puros testados com Vitest.

**Tech Stack:** o do P4 — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, next-intl 4, Vitest + `react-dom/server`. **Nenhuma dependência nova.**

**Spec:** [docs/specs/2026-09-23-fundacao-design.md](../specs/2026-09-23-fundacao-design.md) (autoridade; §6 rotas e direção visual, etapa 4), contrato em [docs/api.md](../api.md), modelo em [docs/data-model.md](../data-model.md). Design: [web/DESIGN.md](../../web/DESIGN.md), protótipo aprovado em [design/prototype/](../../design/prototype/). Produto: [web/PRODUCT.md](../../web/PRODUCT.md). Base: [P4](2026-09-24-p4-web-paginas.md) e as decisões do [ledger do P4](../handoff/p4-web-paginas-ledger.md) (R1–R24), que continuam valendo.

## Itens de aprovação do tech lead

| #   | Item                                                                                                                                                                                                                                                                                                                                                                                                                                           | Onde   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| B1  | **Portão de design.** O protótipo aprovado só tem 5 telas (home, catálogo, produto, sala, lista). O roadmap (semanas 2–3) pede layout aprovado por escrito também para coleção, designer, acabamentos, projetos, onde encontrar e contato. A Task 1 estende o protótipo com todas as telas deste plano; **as Tasks 2–11 só começam depois da aprovação por escrito** (tech lead + Franccino, até duas rodadas; a terceira é escopo adicional). | Task 1 |
| B2  | **Dependências: nenhuma nova.** Sem biblioteca de mapa: o "mapa" das lojas (roadmap e data-model) vira o link "Ver no mapa" para o Google Maps, sem embed (embed pediria pacote ou chave de API e consentimento de cookies). Mapa embutido fica como proposta separada.                                                                                                                                                                        | Task 7 |
| B3  | **Textos jurídicos e FAQ vêm do painel** (páginas `privacy`, `terms`, `contact`, blocos `rich_text` e `faq`). Sem texto cadastrado, a página mostra um aviso neutro; nada é escrito à mão.                                                                                                                                                                                                                                                     | Task 9 |
| B4  | **Pré-requisito:** PRs #9 (API, P2 T12–T14) e #10 (web, P4 T8–T12) mergeados em `develop`. Este plano parte do `develop` com os dois.                                                                                                                                                                                                                                                                                                          | todas  |

## Global Constraints

- **Pré-requisitos:** B4 e, para as Tasks 2–11, B1. Se faltar algum, pare e registre no relatório.
- Trabalhar só em `web/` (e em `design/prototype/` na Task 1). Não mexer em `api/`, `package.json` da raiz nem no `CLAUDE.md` da raiz.
- Instalação sempre pela raiz (`pnpm install`); comandos do app com `pnpm --filter web <script>`.
- **Zero texto literal em JSX**: todo texto visível em `messages/pt.json` **e** `messages/en.json`, inclusive rótulos ARIA. Separadores visuais vêm do CSS (`.meta-inline`).
- **Mensagens (R7 do P4):** mesclar no JSON existente, nunca substituir namespace; chaves novas acrescentadas como texto, sem reformatar o resto do arquivo. A Task 11 apaga só chaves sem nenhuma referência (checado com `grep`) nos dois idiomas.
- Server Components por padrão; `"use client"` só no `StoreFinder`, formulários e botões já existentes.
- **Nenhuma dependência nova** (B2).
- O front só fala com `/api/v1` pelos módulos de `src/lib/api`. Tipos espelham `docs/api.md`.
- **Nunca inventar** fato, número, depoimento, texto jurídico ou de marca. Campo nulo da API = elemento omitido. Seção sem dado some.
- **Decisões do P4 que valem aqui:** R3 (sem `withBuildFallback`: fetchers direto), R5 (rotas estáticas sem `alternates`; detalhe com `alternateHrefs(slugs, …)` quando o tipo traz `slugs`), R6 (descrição de área/categoria em texto simples; descrição de coleção, bio de designer e descrição de projeto seguem `RichText`, como no P3), R10 (medidas com rótulos de `dimensions`), R14 (sem `id="main-content"` nas páginas; o skip link do layout aponta para `#conteudo`), R15 (`htmlLang(locale)` no lugar de ternário de idioma), R17 (controles principais ≥ 44 px; bordas de controle ≥ 3:1), R24 (chamadas do next-intl fora de `[locale]` sempre com `locale` explícito).
- Rotas sem `searchParams` continuam estáticas com revalidação por tag. Só projetos (`?type`, `?page`), downloads e busca leem `searchParams` (dinâmicas, como o catálogo).
- Design system (DESIGN.md): só tokens (hex só em `tokens.css`), cantos retos, sem sombra em repouso, madeira = Casa, verde = Giardini/sucesso, metadado abaixo/ao lado do título.
- WCAG 2.1 AA; LCP < 2,5 s e CLS < 0,1 em 4G: primeira imagem de cada página com `priority`, `width`/`height` sempre (o `ApiImage` já faz).
- Antes de cada commit: `pnpm --filter web lint`, `pnpm --filter web typecheck`, `pnpm --filter web test` e `API_URL=http://127.0.0.1:9 ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` verdes.
- Commits Conventional em português sem acentos, escopo `web` (ou `design` na Task 1), terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. No Windows (PowerShell 5.1), mensagem com aspas vai por `git commit -F arquivo`.

## Conflitos entre as fontes e como este plano resolve

| #   | Conflito                                                                                                                                  | Resolução                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Protótipo sem as telas deste plano; roadmap exige aprovação por escrito.                                                                  | Task 1 (B1). As telas usam o mesmo `pages.css` que vai para produção, então o que é aprovado é o que é entregue.                                             |
| D2  | Roadmap e data-model falam em "mapa" na página de lojas.                                                                                  | Link "Ver no mapa" por loja (coordenadas, ou endereço se faltarem) — B2.                                                                                     |
| D3  | Páginas do P3 usam `<main id="main-content">`.                                                                                            | Reescritas sem o id (R14).                                                                                                                                   |
| D4  | `Blocks` do P3 renderiza HTML cru sem estilo (FAQ em `<dl>`, CTA como parágrafo).                                                         | Reescrita visual (Task 2) mantendo a regra: só `rich_text.body` e `image_text.body` são HTML; FAQ vira `<details>` nativo (teclado e leitor de tela sem JS). |
| D5  | `type` de projeto e de loja é texto livre nos tipos do web, mas o data-model enumera (`residential`/`corporate`, `exclusive`/`reseller`). | Filtros só com os valores do data-model; rótulo por `messages` com fallback para o valor cru (padrão da T11 do P4).                                          |
| D6  | `DesignerDetail` não traz `slugs` (slug único nos dois idiomas, `docs/api.md`).                                                           | Detalhe de designer sem `alternates` (R5: o `href` já vale para todos os idiomas).                                                                           |
| D7  | P3 mostra formulário de contato sem canais; PRODUCT.md pede "a próxima conversa sempre à mão".                                            | Contato com os canais de `GET /settings` (telefone, e-mail, WhatsApp de orçamento e de assistência, endereço da fábrica), cada um só se vier preenchido.     |
| D8  | Mensagens `pages.*` e `sections.*` do P3 perdem uso quando as páginas forem reescritas.                                                   | Task 11 apaga as que ficarem sem referência (R7).                                                                                                            |

## Mapa de arquivos

```
design/prototype/                                        T1
  assets/tokens-web.css, assets/pages.css
  colecoes.html, designers.html, projetos.html, fabrica.html, acabamentos.html,
  lojas.html, downloads.html, contato.html, busca.html, legal.html, erro.html
web/
  messages/{pt,en}.json                                  (todas as tasks)
  src/
    app/
      globals.css                                        T2 (import de pages.css)
      not-found.tsx                                      T11 (só estilo; mantém R24)
      sitemap.ts                                         T11
      [locale]/not-found.tsx, error.tsx                  T11
      [locale]/collections/page.tsx, [slug]/page.tsx     T3
      [locale]/designers/page.tsx, [slug]/page.tsx       T4
      [locale]/projects/page.tsx, [slug]/page.tsx        T5
      [locale]/corporate/page.tsx                        T5
      [locale]/factory/page.tsx, finishes/page.tsx       T6
      [locale]/stores/page.tsx                           T7
      [locale]/downloads/page.tsx                        T8
      [locale]/contact/page.tsx, privacy/page.tsx, terms/page.tsx   T9
      [locale]/search/page.tsx                           T10
    styles/pages.css                                     T2 (+ acréscimos T7–T11)
    components/
      layout/PageHead.tsx                                T2
      content/{Tile,EmptyNotice}.tsx; Blocks.tsx (reescrito)   T2
      stores/StoreFinder.tsx (props novas)               T7
      downloads/DownloadsTable.tsx                       T8
      contact/ContactChannels.tsx                        T9
    lib/
      projects/type.ts                                   T5
      stores/{filter,map-link}.ts                        T7
      seo/sitemap.ts (+ webOnlyEntries)                  T11
```

---

### Task 1: Telas restantes no protótipo e aprovação por escrito

**Files:**

- Create: `design/prototype/assets/tokens-web.css` (cópia de `web/src/styles/tokens.css`), `design/prototype/assets/pages.css` (o CSS da Task 2, Step 3, idêntico), e as telas `design/prototype/{colecoes,designers,projetos,fabrica,acabamentos,lojas,downloads,contato,busca,legal,erro}.html`
- Modify: `design/prototype/README.md` (lista das telas novas e o que é ilustrativo)

**Interfaces:**

- Consumes: `assets/styles.css` e `assets/app.js` do protótipo (header, rodapé, botões, `.plate`, `.chips`, `.designers`, `.factory`, `.facts`, `.stores`, `.store`, `.tech-table`, `.empty`); `assets/data.js` só como conteúdo **ilustrativo** (marcado assim no README).
- Produces: telas navegáveis a partir do header e do rodapé do protótipo, em 1440 e 375 px, para aprovação.

As telas seguem a estrutura que as Tasks 3–11 implementam. Cada uma usa o header e o rodapé do `index.html`, `.wrap`, breadcrumb e cabeçalho de página (`.catalog-head` com `h1`, `.lead` opcional e contagem em `.meta.num`):

| Tela               | Estrutura                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `colecoes.html`    | Lista: grade `.tiles` (3/2/1 colunas) de `.tile` (foto 4:3, nome, ano · nº de peças, resumo). Detalhe (segunda seção da mesma página, separada por um `<hr>`): `.detail-hero` (capa à esquerda; à direita descrição e `.facts` com designers), `.gallery-strip`, "Peças da coleção" em `.grid-plates`.                                      |
| `designers.html`   | Lista: `.tiles` com `.tile--portrait` (retrato 4:5 em tons de cinza como na home, nome, local, bio curta). Detalhe: `.detail-hero` com retrato, bio, links externos (site, Instagram), coleções em `.chips`, "Peças do designer" em `.grid-plates`.                                                                                         |
| `projetos.html`    | Lista com `.chips` Todos / Residenciais / Corporativos, `.tiles` (título, tipo · local · ano, resumo), paginação. Detalhe: `.detail-hero` com capa, `.facts` (cliente, arquitetura, local, ano), descrição, `.gallery-strip`, "Peças no projeto". Corporativo: intro, blocos, projetos corporativos em `.tiles` e `.logo-wall` de clientes. |
| `fabrica.html`     | Capa em largura total dentro do `.wrap`, intro, e os blocos: `.stats`, `.timeline`, `.block-image-text` (imagem à esquerda e à direita), `.block-quote`, `.block-gallery`.                                                                                                                                                                  |
| `acabamentos.html` | Um `h2` por grupo e `.finish-grid` de `.finish-card` (amostra quadrada, nome, código, descrição curta; sem imagem, o código em texto).                                                                                                                                                                                                      |
| `lojas.html`       | `.stores` com filtro por estado (inclui "Todos os estados") e por tipo; cartões `.store` com endereço, tipo, telefone, WhatsApp, e-mail, site, horário e "Ver no mapa".                                                                                                                                                                     |
| `downloads.html`   | `.search-form` (área + busca), `.tech-table` com peça, área, categoria e links de arquivo (`.file-links`), paginação.                                                                                                                                                                                                                       |
| `contato.html`     | `.contact-layout`: canais à esquerda (`.facts`), formulário à direita (`.quote-form`); abaixo, FAQ em `.faq` com `<details>`.                                                                                                                                                                                                               |
| `busca.html`       | `.search-form`; grupos "Peças" (`.grid-plates`), "Designers" (`.tiles`), "Coleções" (`.tiles`); estado sem resultado em `.empty`.                                                                                                                                                                                                           |
| `legal.html`       | Título, intro e texto em `.prose` (70 caracteres por linha).                                                                                                                                                                                                                                                                                |
| `erro.html`        | 404 e 500 em `.empty` com as ações "Voltar ao início" e "Ver o catálogo" / "Tentar de novo".                                                                                                                                                                                                                                                |

- [ ] **Step 1:** Criar `tokens-web.css` e `pages.css` (Task 2, Step 3) e as 11 telas, reaproveitando as classes existentes; nenhum valor fora de token.
- [ ] **Step 2:** Conferir em 1440 e 375 px: sem rolagem horizontal, alvos ≥ 44 px, contraste AA, foco visível nos `<details>` e chips.
- [ ] **Step 3:** Commit:

```bash
git add design/prototype
git commit -m "feat(design): adiciona ao prototipo as telas restantes do site para aprovacao

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Aprovação (B1).** Tech lead envia as telas (prints 1440/375 ou o protótipo em staging) à Franccino. Registrar no ledger da P5a: data, quem aprovou, rodada e ajustes pedidos. Ajustes entram em `pages.css` e nas telas antes das Tasks 2–11. **Sem aprovação, parar aqui.**

---

### Task 2: Base compartilhada — `pages.css`, `PageHead`, `Tile`, `EmptyNotice` e `Blocks` no design system

**Files:**

- Create: `web/src/styles/pages.css`, `web/src/components/layout/PageHead.tsx`, `web/src/components/content/Tile.tsx`, `web/src/components/content/EmptyNotice.tsx`
- Modify (reescrever): `web/src/components/content/Blocks.tsx`
- Modify: `web/src/app/globals.css`, `web/messages/{pt,en}.json`
- Test: `web/src/components/content/Blocks.test.tsx`, `web/src/components/content/Tile.test.tsx`, `web/src/components/layout/PageHead.test.tsx`

**Interfaces:**

- Consumes: `Breadcrumbs`, `BreadcrumbItem` (P4 T1); `ApiImage`, `RichText` (P3); `Link`, `AppHref`; `renderWithIntl`, `navigationMock`, `image()` (testes do P4).
- Produces:
  - `PageHead({ title, lead?, trail?, meta? })` — breadcrumb (Início › …trail › título) + `h1` + `.lead` + slot de metadado à direita.
  - `Tile({ href, title, image?, meta?, text?, portrait?, priority?, sizes?, headingLevel? })`.
  - `EmptyNotice({ title?, text })`.
  - `Blocks({ blocks })` com as classes `.blocks .block-image .block-image-text .timeline .faq .stats .block-quote .block-cta .block-gallery .prose`.
  - Classes: `.tiles .tile .tile--portrait .tile__media .tile__copy .tile__title .tile__text .detail-hero .detail-hero__media .detail-hero__copy .gallery-strip .section-title .logo-wall .finish-group .finish-grid .finish-card .search-form .result-group .contact-layout .page-cover .error-page`.
  - Mensagens: `common.nothingYet`.

- [ ] **Step 1: Testes que falham**

`web/src/components/content/Blocks.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Blocks } from './Blocks';

describe('Blocks', () => {
  it('renders nothing for an empty list', () => {
    expect(renderToStaticMarkup(<Blocks blocks={[]} />)).toBe('');
  });

  it('renders faq items as native disclosure widgets', () => {
    const html = renderToStaticMarkup(
      <Blocks
        blocks={[
          { type: 'faq', data: { items: [{ question: 'Entregam em todo o Brasil?', answer: 'Resposta.' }] } },
        ]}
      />,
    );
    expect(html).toContain(
      '<div class="faq"><details><summary>Entregam em todo o Brasil?</summary><p>Resposta.</p></details></div>',
    );
  });

  it('keeps plain-text fields as text, never HTML', () => {
    const html = renderToStaticMarkup(
      <Blocks
        blocks={[{ type: 'timeline', data: { items: [{ year: '2000', title: '<b>x</b>', text: 'y' }] } }]}
      />,
    );
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(html).toContain('class="timeline"');
  });

  it('renders the call to action as a button link', () => {
    const html = renderToStaticMarkup(
      <Blocks
        blocks={[{ type: 'cta', data: { heading: null, body: null, label: 'Ver lojas', url: '/pt/lojas' } }]}
      />,
    );
    expect(html).toContain('<a class="btn" href="/pt/lojas">Ver lojas</a>');
  });
});
```

`web/src/components/content/Tile.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { image } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { Tile } from './Tile';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('Tile', () => {
  it('links the whole card and lists the metadata', () => {
    const html = renderWithIntl(
      <Tile
        href={{ pathname: '/collections/[slug]', params: { slug: 'tempo' } }}
        title="Tempo"
        image={image()}
        meta={['2025', '12 peças']}
        text="Resumo"
      />,
    );
    expect(html).toContain('href="/collections/tempo"');
    expect(html).toContain('<h2 class="tile__title">Tempo</h2>');
    expect(html).toContain('<li>2025</li><li>12 peças</li>');
    expect(html).toContain('<img');
  });

  it('keeps the media ground without inventing an image', () => {
    const html = renderWithIntl(<Tile href="/designers" title="Sem retrato" portrait headingLevel="h3" />);
    expect(html).toContain('tile tile--portrait');
    expect(html).not.toContain('<img');
    expect(html).toContain('<h3 class="tile__title">');
  });
});
```

`web/src/components/layout/PageHead.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { PageHead } from './PageHead';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('PageHead', () => {
  it('renders the trail from home to the current page, the h1 and the lead', () => {
    const html = renderWithIntl(
      <PageHead title="Tempo" lead="Resumo" trail={[{ label: 'Coleções', href: '/collections' }]} />,
    );
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/collections"');
    expect(html).toContain('aria-current="page">Tempo</span>');
    expect(html).toContain('<h1>Tempo</h1>');
    expect(html).toContain('<p class="lead">Resumo</p>');
  });

  it('omits an empty lead', () => {
    expect(renderWithIntl(<PageHead title="Lojas" lead={null} />)).not.toContain('class="lead"');
  });
});
```

Run: `pnpm --filter web test` → Expected: FAIL (módulos inexistentes; `Blocks` sem as classes).

- [ ] **Step 2: Componentes**

`web/src/components/layout/PageHead.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';

type PageHeadProps = {
  title: string;
  lead?: string | null;
  /** Níveis entre o início e a página atual (a página atual entra sozinha, sem link). */
  trail?: BreadcrumbItem[];
  /** Metadado à direita do título (ex.: contagem em `.meta.num`). */
  meta?: ReactNode;
};

export function PageHead({ title, lead = null, trail = [], meta = null }: PageHeadProps) {
  const common = useTranslations('common');
  return (
    <>
      <Breadcrumbs
        label={common('breadcrumb')}
        items={[{ label: common('home'), href: '/' }, ...trail, { label: title }]}
      />
      <div className="catalog-head">
        <div className="catalog-head__copy">
          <h1>{title}</h1>
          {lead ? <p className="lead">{lead}</p> : null}
        </div>
        {meta}
      </div>
    </>
  );
}
```

`web/src/components/content/Tile.tsx`:

```tsx
import { ApiImage } from '@/components/media/ApiImage';
import { Link, type AppHref } from '@/i18n/navigation';
import type { Image } from '@/lib/api/types';

type TileProps = {
  href: AppHref;
  title: string;
  image?: Image | null;
  /** Fatos curtos exibidos em linha (`.meta-inline` põe os separadores). */
  meta?: string[];
  text?: string | null;
  portrait?: boolean;
  priority?: boolean;
  sizes?: string;
  headingLevel?: 'h2' | 'h3';
};

/** Cartão inteiro clicável de coleção, designer ou projeto. */
export function Tile({
  href,
  title,
  image = null,
  meta = [],
  text = null,
  portrait = false,
  priority = false,
  sizes = '(max-width: 35rem) 100vw, (max-width: 56.25rem) 50vw, 33vw',
  headingLevel: Heading = 'h2',
}: TileProps) {
  return (
    <Link className={portrait ? 'tile tile--portrait' : 'tile'} href={href}>
      <div className="tile__media">
        {image ? <ApiImage image={image} sizes={sizes} priority={priority} /> : null}
      </div>
      <div className="tile__copy">
        <Heading className="tile__title">{title}</Heading>
        {meta.length > 0 ? (
          <ul className="meta meta-inline">
            {meta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {text ? <p className="tile__text">{text}</p> : null}
      </div>
    </Link>
  );
}
```

`web/src/components/content/EmptyNotice.tsx`:

```tsx
/** Estado vazio neutro: nunca promete conteúdo nem inventa texto. */
export function EmptyNotice({ title = null, text }: { title?: string | null; text: string }) {
  return (
    <div className="empty" role="status">
      {title ? <h2>{title}</h2> : null}
      <p className="lead">{text}</p>
    </div>
  );
}
```

`web/src/components/content/Blocks.tsx` (substitui o do P3; mesmos tipos e mesma regra de texto):

```tsx
/**
 * Renderiza `PageContent.content` (blocos do painel, `docs/data-model.md`).
 * Imagens de bloco são URLs simples (sem conversões da API), então vão em
 * `<img>` nativo. Só `rich_text.body` e `image_text.body` são HTML
 * (sanitizado pela API); o resto é texto simples.
 */

import type {
  Block,
  CtaBlockData,
  FaqBlockData,
  GalleryBlockData,
  ImageBlockData,
  ImageTextBlockData,
  QuoteBlockData,
  RichTextBlockData,
  StatsBlockData,
  TimelineBlockData,
} from '@/lib/api/types';
import { RichText } from './RichText';

function BlockImage({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- mídia de bloco não tem conversões da API.
  return <img src={src} alt={alt} loading="lazy" decoding="async" />;
}

function RichTextBlock({ data }: { data: RichTextBlockData }) {
  return <RichText html={data.body} className="prose" />;
}

function ImageBlock({ data }: { data: ImageBlockData }) {
  return (
    <figure className="block-image">
      <BlockImage src={data.image} alt={data.caption ?? ''} />
      {data.caption ? <figcaption>{data.caption}</figcaption> : null}
    </figure>
  );
}

function ImageTextBlock({ data }: { data: ImageTextBlockData }) {
  return (
    <section className="block-image-text" data-image-position={data.image_position}>
      <div className="block-image-text__media">
        <BlockImage src={data.image} alt="" />
      </div>
      <div className="block-image-text__copy">
        {data.heading ? <h2>{data.heading}</h2> : null}
        <RichText html={data.body} className="prose" />
      </div>
    </section>
  );
}

function TimelineBlock({ data }: { data: TimelineBlockData }) {
  if (data.items.length === 0) {
    return null;
  }
  return (
    <ol className="timeline">
      {data.items.map((item, index) => (
        <li key={index}>
          <span className="timeline__year num">{item.year}</span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function FaqBlock({ data }: { data: FaqBlockData }) {
  if (data.items.length === 0) {
    return null;
  }
  return (
    <div className="faq">
      {data.items.map((item, index) => (
        <details key={index}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

function StatsBlock({ data }: { data: StatsBlockData }) {
  if (data.items.length === 0) {
    return null;
  }
  return (
    <dl className="stats">
      {data.items.map((item, index) => (
        <div key={index}>
          <dt className="num">{item.value}</dt>
          <dd>{item.label}</dd>
        </div>
      ))}
    </dl>
  );
}

function QuoteBlock({ data }: { data: QuoteBlockData }) {
  return (
    <blockquote className="block-quote">
      <p>{data.text}</p>
      {data.author ? <cite>{data.author}</cite> : null}
    </blockquote>
  );
}

function CtaBlock({ data }: { data: CtaBlockData }) {
  return (
    <div className="block-cta">
      {data.heading ? <h2>{data.heading}</h2> : null}
      {data.body ? <p className="lead">{data.body}</p> : null}
      <a className="btn" href={data.url}>
        {data.label}
      </a>
    </div>
  );
}

function GalleryBlock({ data }: { data: GalleryBlockData }) {
  if (data.images.length === 0) {
    return null;
  }
  return (
    <figure className="block-gallery">
      <ul>
        {data.images.map((src, index) => (
          <li key={index}>
            <BlockImage src={src} alt="" />
          </li>
        ))}
      </ul>
      {data.caption ? <figcaption>{data.caption}</figcaption> : null}
    </figure>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'rich_text':
      return <RichTextBlock data={block.data} />;
    case 'image':
      return <ImageBlock data={block.data} />;
    case 'image_text':
      return <ImageTextBlock data={block.data} />;
    case 'timeline':
      return <TimelineBlock data={block.data} />;
    case 'faq':
      return <FaqBlock data={block.data} />;
    case 'stats':
      return <StatsBlock data={block.data} />;
    case 'quote':
      return <QuoteBlock data={block.data} />;
    case 'cta':
      return <CtaBlock data={block.data} />;
    case 'gallery':
      return <GalleryBlock data={block.data} />;
    default:
      return null;
  }
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) {
    return null;
  }
  return (
    <div className="blocks">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </div>
  );
}
```

> Se o `Blocks` do P3 tiver algum export além de `Blocks`, faça `grep` pelos usos antes de removê-lo (regra do P4).

- [ ] **Step 3: CSS**

`web/src/styles/pages.css` (o mesmo arquivo vai para `design/prototype/assets/pages.css` na Task 1):

```css
/*
  Páginas restantes (plano P5a): grades de cartões, cabeçalho de detalhe,
  blocos de página do painel, lojas, downloads, contato, busca e erros.
  Só tokens de tokens.css; cantos retos; sem sombra em repouso.
*/

/* ---------- cartões ---------- */

.tiles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px 16px;
  padding-bottom: 96px;
}

.tile {
  display: grid;
  gap: 14px;
  align-content: start;
  color: inherit;
  text-decoration: none;
}

.tile__media {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--portrait-ground);
}

.tile--portrait .tile__media {
  aspect-ratio: 4 / 5;
}

.tile__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 900ms var(--ease-out);
}

.tile--portrait .tile__media img {
  filter: grayscale(1) contrast(1.02);
  transition:
    transform 900ms var(--ease-out),
    filter var(--t-mid) ease;
}

.tile:hover .tile__media img {
  transform: scale(1.02);
}

.tile--portrait:hover .tile__media img {
  filter: grayscale(0);
}

.tile:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 4px;
}

.tile__copy {
  display: grid;
  gap: 6px;
}

.tile__title {
  font-size: 1.25rem;
}

.tile__text {
  color: var(--ink-muted);
  font-size: 0.9375rem;
  max-width: 52ch;
}

/* ---------- cabeçalho de detalhe ---------- */

.detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: clamp(28px, 5vw, 80px);
  align-items: start;
  padding-bottom: 56px;
}

.detail-hero__media img {
  width: 100%;
  height: auto;
}

.detail-hero__copy {
  display: grid;
  gap: 20px;
  align-content: start;
}

.gallery-strip {
  list-style: none;
  margin: 0 0 56px;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.gallery-strip img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.section-title {
  font-size: 1.5rem;
  margin: 8px 0 20px;
}

.page-cover {
  width: 100%;
  height: auto;
  margin-bottom: 56px;
}

/* ---------- blocos do painel ---------- */

.blocks {
  display: grid;
  gap: 56px;
  padding-bottom: 96px;
}

.prose {
  max-width: 70ch;
}

.prose h2 {
  font-size: 1.5rem;
  margin: 36px 0 12px;
}

.prose h3 {
  font-size: 1.15rem;
  margin: 28px 0 10px;
}

.prose a {
  text-decoration: underline;
}

.block-image img,
.block-image-text img {
  width: 100%;
  height: auto;
}

.block-image figcaption,
.block-gallery figcaption {
  margin-top: 8px;
  color: var(--ink-muted);
  font-size: 0.875rem;
}

.block-image-text {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(24px, 4vw, 64px);
  align-items: center;
}

.block-image-text[data-image-position='right'] .block-image-text__media {
  order: 2;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
}

.timeline li {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 24px;
  padding: 20px 0;
  border-bottom: 1px solid var(--line);
}

.timeline__year {
  font-weight: 600;
}

.timeline h3 {
  font-size: 1.1rem;
  margin-bottom: 6px;
}

.timeline p {
  color: var(--ink-muted);
  max-width: 64ch;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin: 0;
}

.stats div {
  background: var(--paper);
  padding: 24px;
}

.stats dt {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
}

.stats dd {
  margin: 8px 0 0;
  color: var(--ink-muted);
}

.faq {
  border-top: 1px solid var(--line);
  max-width: 80ch;
}

.faq details {
  border-bottom: 1px solid var(--line);
}

.faq summary {
  cursor: pointer;
  min-height: 44px;
  padding: 14px 0;
  font-weight: 600;
}

.faq summary:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

.faq details p {
  margin: 0 0 18px;
  color: var(--ink-muted);
  max-width: 70ch;
}

.block-quote {
  margin: 0;
  padding-left: 24px;
  border-left: 2px solid var(--ink);
}

.block-quote p {
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
}

.block-quote cite {
  font-style: normal;
  color: var(--ink-muted);
}

.block-cta {
  background: var(--paper);
  padding: clamp(24px, 4vw, 48px);
  display: grid;
  gap: 14px;
  justify-items: start;
}

.block-gallery ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.block-gallery img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

/* ---------- clientes, acabamentos ---------- */

.logo-wall {
  list-style: none;
  margin: 0 0 96px;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
}

.logo-wall li {
  background: var(--paper);
  display: grid;
  place-items: center;
  min-height: 120px;
  padding: 20px;
  text-align: center;
}

.logo-wall img {
  max-width: 100%;
  max-height: 56px;
  width: auto;
  height: auto;
  filter: grayscale(1);
}

.finish-group + .finish-group {
  margin-top: 48px;
}

.finish-grid {
  list-style: none;
  margin: 0;
  padding: 0 0 48px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px 16px;
}

.finish-card {
  display: grid;
  gap: 6px;
  align-content: start;
}

.finish-card__swatch {
  aspect-ratio: 1;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: var(--stone);
  border: 1px solid var(--line);
}

.finish-card__swatch img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.finish-card__fallback {
  font-weight: 600;
  color: var(--ink-muted);
}

/* ---------- busca e downloads ---------- */

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
  margin-bottom: 32px;
}

.search-form .field {
  flex: 1 1 260px;
}

.search-form input,
.search-form select {
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid var(--line-field);
  background: var(--paper);
  font: inherit;
}

.result-group + .result-group {
  margin-top: 56px;
}

/* ---------- lojas ---------- */

.store__hours {
  color: var(--ink-muted);
  font-size: 0.875rem;
  white-space: pre-line;
}

.store__links {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: grid;
  gap: 6px;
  font-size: 0.875rem;
}

.store__links a {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 44px;
}

/* ---------- contato ---------- */

.contact-layout {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: clamp(28px, 5vw, 80px);
  align-items: start;
  padding-bottom: 72px;
}

/* ---------- erros ---------- */

.error-page {
  padding-block: 96px 120px;
}

/* ---------- responsivo ---------- */

@media (max-width: 56.25rem) {
  .tiles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-hero,
  .block-image-text,
  .contact-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .block-image-text[data-image-position='right'] .block-image-text__media {
    order: 0;
  }
}

@media (max-width: 35rem) {
  .tiles {
    grid-template-columns: minmax(0, 1fr);
  }

  .timeline li {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }
}
```

`web/src/app/globals.css`: `@import '../styles/pages.css' layer(components);` depois de `quote.css`.

`messages/pt.json`, em `common`: `"nothingYet": "Ainda não há conteúdo publicado aqui."` · `messages/en.json`: `"nothingYet": "Nothing has been published here yet."`

- [ ] **Step 4: Rodar e commitar**

Run: lint + typecheck + test + build sem API → verde. As páginas de conteúdo do P3 que já usam `Blocks` (fábrica, corporativo, privacidade, termos, contato) passam a ter os blocos estilizados sem mudar mais nada.

```bash
git add web
git commit -m "feat(web): adiciona base visual das paginas restantes e estiliza os blocos do painel

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Coleções (lista e detalhe)

**Files:**

- Modify (reescrever): `web/src/app/[locale]/collections/page.tsx`, `web/src/app/[locale]/collections/[slug]/page.tsx`
- Modify: `web/messages/{pt,en}.json`

**Interfaces:**

- Consumes: `getCollections`, `getCollection` (P3); `PageHead`, `Tile`, `EmptyNotice` (T2); `ProductGrid` (P4 T5); `ApiImage`, `RichText`, `buildMetadata`, `alternateHrefs`.
- Produces: rotas `/collections`, `/collections/[slug]` no design system; mensagens `collections.*`.

- [ ] **Step 1: Lista** — `web/src/app/[locale]/collections/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { Tile } from '@/components/content/Tile';
import { PageHead } from '@/components/layout/PageHead';
import type { Locale } from '@/i18n/config';
import { getCollections } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'collections' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/collections' },
    title: t('title'),
    description: t('description'),
  });
}

export default async function CollectionsPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, collections] = await Promise.all([
    getTranslations({ locale, namespace: 'collections' }),
    getTranslations({ locale, namespace: 'common' }),
    getCollections(locale),
  ]);
  return (
    <main className="wrap">
      <PageHead
        title={t('title')}
        meta={<p className="meta num">{t('count', { count: collections.length })}</p>}
      />
      {collections.length === 0 ? (
        <EmptyNotice text={common('nothingYet')} />
      ) : (
        <div className="tiles">
          {collections.map((collection, index) => (
            <Tile
              key={collection.id}
              href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}
              title={collection.name}
              image={collection.cover}
              meta={[
                ...(collection.year ? [String(collection.year)] : []),
                t('pieces', { count: collection.product_count }),
              ]}
              text={collection.summary}
              priority={index < 3}
            />
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Detalhe** — `web/src/app/[locale]/collections/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { RichText } from '@/components/content/RichText';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getCollection, getCollections } from '@/lib/api/content';
import { alternateHrefs, buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string; slug: string }> };

const collectionHref = (slug: string) => ({ pathname: '/collections/[slug]', params: { slug } }) as const;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const collections = await getCollections(params.locale as Locale);
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = await getCollection(locale as Locale, slug);
  if (!collection) {
    return {};
  }
  return buildMetadata({
    locale: locale as Locale,
    href: collectionHref(slug),
    title: collection.seo.title ?? collection.name,
    description: collection.seo.description ?? collection.summary,
    image: collection.seo.image ?? collection.cover,
    alternates: alternateHrefs(collection.slugs, collectionHref),
  });
}

export default async function CollectionPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const collection = await getCollection(locale, slug);
  if (!collection) {
    notFound();
  }
  const t = await getTranslations({ locale, namespace: 'collections' });
  return (
    <main className="wrap">
      <PageHead
        title={collection.name}
        lead={collection.summary}
        trail={[{ label: t('title'), href: '/collections' }]}
        meta={
          <ul className="meta meta-inline num">
            {collection.year ? <li>{collection.year}</li> : null}
            <li>{t('pieces', { count: collection.product_count })}</li>
          </ul>
        }
      />
      <div className="detail-hero">
        <div className="detail-hero__media">
          {collection.cover ? (
            <ApiImage image={collection.cover} sizes="(max-width: 56.25rem) 100vw, 58vw" priority />
          ) : null}
        </div>
        <div className="detail-hero__copy">
          {collection.description ? <RichText html={collection.description} className="prose" /> : null}
          {collection.designers.length > 0 ? (
            <dl className="facts">
              <div>
                <dt>{t('designers')}</dt>
                <dd>
                  <ul className="meta-inline">
                    {collection.designers.map((designer) => (
                      <li key={designer.id}>
                        <Link href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}>
                          {designer.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>
      {collection.gallery.length > 0 ? (
        <ul className="gallery-strip" aria-label={t('gallery')}>
          {collection.gallery.map((picture) => (
            <li key={picture.id}>
              <ApiImage image={picture} sizes="(max-width: 35rem) 100vw, 33vw" />
            </li>
          ))}
        </ul>
      ) : null}
      {collection.products.length > 0 ? (
        <section aria-labelledby="collection-pieces" className="section--tight">
          <h2 id="collection-pieces" className="section-title">
            {t('piecesTitle')}
          </h2>
          <ProductGrid products={collection.products} />
        </section>
      ) : null}
    </main>
  );
}
```

- [ ] **Step 3: Mensagens** (namespace novo `collections`)

pt: `{ "title": "Coleções", "description": "Coleções da Franccino e as peças de cada uma.", "count": "{count, plural, one {# coleção} other {# coleções}}", "pieces": "{count, plural, =0 {sem peças} one {# peça} other {# peças}}", "designers": "Design", "gallery": "Imagens da coleção", "piecesTitle": "Peças da coleção" }`

en: `{ "title": "Collections", "description": "Franccino collections and the pieces in each one.", "count": "{count, plural, one {# collection} other {# collections}}", "pieces": "{count, plural, =0 {no pieces} one {# piece} other {# pieces}}", "designers": "Design", "gallery": "Collection images", "piecesTitle": "Pieces in the collection" }`

- [ ] **Step 4: Rodar e commitar** — gates verdes; no navegador (com a API e a demonstração da P2 T14): `/pt/colecoes` e uma coleção em 375 e 1440 px, sem rolagem horizontal nem erro no console.

```bash
git add web
git commit -m "feat(web): leva colecoes ao design system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Designers (lista e detalhe)

**Files:**

- Modify (reescrever): `web/src/app/[locale]/designers/page.tsx`, `web/src/app/[locale]/designers/[slug]/page.tsx`
- Modify: `web/messages/{pt,en}.json`

**Interfaces:**

- Consumes: `getDesigners`, `getDesigner` (P3); `PageHead`, `Tile`, `EmptyNotice` (T2); `ProductGrid`; `ApiImage`, `RichText`, `Icon`, `buildMetadata`.
- Produces: rotas `/designers`, `/designers/[slug]`; mensagens `designers.*`. Detalhe sem `alternates` (D6).

- [ ] **Step 1: Lista** — igual à de coleções, com: namespace `designers`, `getDesigners(locale)`, `Tile` com `portrait`, `image={designer.portrait}`, `meta={designer.location ? [designer.location] : []}`, `text={designer.short_bio}`, `sizes="(max-width: 35rem) 100vw, (max-width: 56.25rem) 50vw, 25vw"`, e `href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}`. Metadata com `href: { pathname: '/designers' }`. Grade com 4 colunas no desktop: `<div className="tiles tiles--four">` e em `pages.css`:

```css
.tiles--four {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 56.25rem) {
  .tiles--four {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- [ ] **Step 2: Detalhe** — `web/src/app/[locale]/designers/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { RichText } from '@/components/content/RichText';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getDesigner, getDesigners } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const designers = await getDesigners(params.locale as Locale);
  return designers.map((designer) => ({ slug: designer.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const designer = await getDesigner(locale as Locale, slug);
  if (!designer) {
    return {};
  }
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/designers/[slug]', params: { slug } },
    title: designer.seo.title ?? designer.name,
    description: designer.seo.description ?? designer.short_bio,
    image: designer.seo.image ?? designer.portrait,
  });
}

export default async function DesignerPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const designer = await getDesigner(locale, slug);
  if (!designer) {
    notFound();
  }
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: 'designers' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
  const links = [
    designer.website_url ? { href: designer.website_url, label: t('website') } : null,
    designer.instagram_url ? { href: designer.instagram_url, label: t('instagram') } : null,
  ].filter((link): link is { href: string; label: string } => link !== null);
  return (
    <main className="wrap">
      <PageHead
        title={designer.name}
        lead={designer.short_bio}
        trail={[{ label: t('title'), href: '/designers' }]}
        meta={designer.location ? <p className="meta">{designer.location}</p> : null}
      />
      <div className="detail-hero">
        <div className="detail-hero__media designer__photo">
          {designer.portrait ? (
            <ApiImage image={designer.portrait} sizes="(max-width: 56.25rem) 100vw, 40vw" priority />
          ) : null}
        </div>
        <div className="detail-hero__copy">
          {designer.bio ? <RichText html={designer.bio} className="prose" /> : null}
          {links.length > 0 ? (
            <ul className="store__links">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <span>{link.label}</span>
                    <Icon name="arrow" />
                    <span className="visually-hidden">{common('opensInNewWindow')}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {designer.collections.length > 0 ? (
            <nav className="chips" aria-label={t('collections')}>
              {designer.collections.map((collection) => (
                <Link
                  key={collection.id}
                  className="chip"
                  href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}
                >
                  {collection.name}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
      {designer.products.length > 0 ? (
        <section aria-labelledby="designer-pieces">
          <h2 id="designer-pieces" className="section-title">
            {t('piecesTitle')}
          </h2>
          <ProductGrid products={designer.products} />
        </section>
      ) : null}
    </main>
  );
}
```

> `.designer__photo` (home.css) dá o fundo de retrato; o retrato do detalhe não fica em tons de cinza (só os cartões).

- [ ] **Step 3: Mensagens** (namespace `designers`)

pt: `{ "title": "Designers", "description": "Designers e estúdios que assinam peças com a Franccino.", "count": "{count, plural, one {# designer} other {# designers}}", "website": "Site", "instagram": "Instagram", "collections": "Coleções do designer", "piecesTitle": "Peças do designer" }`

en: `{ "title": "Designers", "description": "Designers and studios who sign pieces with Franccino.", "count": "{count, plural, one {# designer} other {# designers}}", "website": "Website", "instagram": "Instagram", "collections": "Designer's collections", "piecesTitle": "Pieces by this designer" }`

> A lista também mostra `meta={<p className="meta num">{t('count', { count })}</p>}` no `PageHead`.

- [ ] **Step 4: Rodar e commitar** (como na Task 3).

```bash
git commit -m "feat(web): leva designers ao design system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Projetos (lista, detalhe) e Corporativo

**Files:**

- Create: `web/src/lib/projects/type.ts`
- Modify (reescrever): `web/src/app/[locale]/projects/page.tsx`, `web/src/app/[locale]/projects/[slug]/page.tsx`, `web/src/app/[locale]/corporate/page.tsx`
- Modify: `web/messages/{pt,en}.json`
- Test: `web/src/lib/projects/type.test.ts`

**Interfaces:**

- Consumes: `getProjects`, `getProject`, `getClients`, `getPage` (P3); `firstValue`, `parsePositiveInteger` (P3, `lib/api/listing-params`); `Pagination` (P4 T6); `PageHead`, `Tile`, `EmptyNotice`, `Blocks` (T2); `ProductGrid`.
- Produces:
  - `PROJECT_TYPES = ['residential', 'corporate'] as const`; `type ProjectType`; `parseProjectType(value: string | undefined): ProjectType | undefined`.
  - Rotas `/projects` (`?type`, `?page`), `/projects/[slug]`, `/corporate`; mensagens `projects.*`, `corporate.*`.

- [ ] **Step 1: Teste que falha** — `web/src/lib/projects/type.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseProjectType } from './type';

describe('parseProjectType', () => {
  it('accepts only the data-model values', () => {
    expect(parseProjectType('corporate')).toBe('corporate');
    expect(parseProjectType('residential')).toBe('residential');
    expect(parseProjectType('hotel')).toBeUndefined();
    expect(parseProjectType(undefined)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Módulo** — `web/src/lib/projects/type.ts`:

```ts
/** Tipos de projeto do `docs/data-model.md` (a API manda texto livre; o filtro só usa estes). */
export const PROJECT_TYPES = ['residential', 'corporate'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export function parseProjectType(value: string | undefined): ProjectType | undefined {
  return PROJECT_TYPES.find((type) => type === value);
}
```

- [ ] **Step 3: Lista** — `web/src/app/[locale]/projects/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { SearchParams } from '@/components/catalog/area-pages';
import { Pagination } from '@/components/catalog/Pagination';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { Tile } from '@/components/content/Tile';
import { PageHead } from '@/components/layout/PageHead';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getProjects } from '@/lib/api/content';
import { firstValue, parsePositiveInteger } from '@/lib/api/listing-params';
import { PROJECT_TYPES, parseProjectType, type ProjectType } from '@/lib/projects/type';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };

const PER_PAGE = 12;

const projectsHref = (type: ProjectType | undefined, page?: number) =>
  ({
    pathname: '/projects',
    query: { ...(type ? { type } : {}), ...(page && page > 1 ? { page: String(page) } : {}) },
  }) as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/projects' },
    title: t('title'),
    description: t('description'),
  });
}

export default async function ProjectsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const query = await searchParams;
  const type = parseProjectType(firstValue(query.type));
  const page = parsePositiveInteger(firstValue(query.page));
  const [t, common, list] = await Promise.all([
    getTranslations({ locale, namespace: 'projects' }),
    getTranslations({ locale, namespace: 'common' }),
    getProjects(locale, { type, page, per_page: PER_PAGE }),
  ]);
  const typeLabel = (value: string) => (t.has(`types.${value}`) ? t(`types.${value}`) : value);
  return (
    <main className="wrap">
      <PageHead
        title={t('title')}
        meta={<p className="meta num">{t('count', { count: list.meta.total })}</p>}
      />
      <nav className="chips toolbar" aria-label={t('typeFilter')}>
        <Link className="chip" href={projectsHref(undefined)} aria-current={type ? undefined : 'true'}>
          {t('allTypes')}
        </Link>
        {PROJECT_TYPES.map((value) => (
          <Link
            key={value}
            className="chip"
            href={projectsHref(value)}
            aria-current={type === value ? 'true' : undefined}
          >
            {typeLabel(value)}
          </Link>
        ))}
      </nav>
      {list.data.length === 0 ? (
        <EmptyNotice text={common('nothingYet')} />
      ) : (
        <div className="tiles">
          {list.data.map((project, index) => (
            <Tile
              key={project.id}
              href={{ pathname: '/projects/[slug]', params: { slug: project.slug } }}
              title={project.title}
              image={project.cover}
              meta={[
                typeLabel(project.type),
                ...(project.location ? [project.location] : []),
                ...(project.year ? [String(project.year)] : []),
              ]}
              text={project.summary}
              priority={index < 3}
            />
          ))}
        </div>
      )}
      <Pagination meta={list.meta} hrefFor={(next) => projectsHref(type, next)} label={t('pagination')} />
    </main>
  );
}
```

- [ ] **Step 4: Detalhe** — `web/src/app/[locale]/projects/[slug]/page.tsx`: mesmo esqueleto do detalhe de coleção (Task 3, Step 2), com `projectHref = (slug) => ({ pathname: '/projects/[slug]', params: { slug } })`, `generateStaticParams` a partir de `getProjects(locale, { per_page: 100 })` (`.data`), `alternates: alternateHrefs(project.slugs, projectHref)`, `trail=[{ label: t('title'), href: '/projects' }]`, `lead={project.summary}` e, no `.detail-hero__copy`:

```tsx
<dl className="facts">
  {project.client_name ? (
    <div>
      <dt>{t('client')}</dt>
      <dd>{project.client_name}</dd>
    </div>
  ) : null}
  {project.architect ? (
    <div>
      <dt>{t('architect')}</dt>
      <dd>{project.architect}</dd>
    </div>
  ) : null}
  {project.location ? (
    <div>
      <dt>{t('location')}</dt>
      <dd>{project.location}</dd>
    </div>
  ) : null}
  {project.year ? (
    <div>
      <dt>{t('year')}</dt>
      <dd className="num">{project.year}</dd>
    </div>
  ) : null}
</dl>;
{
  project.description ? <RichText html={project.description} className="prose" /> : null;
}
```

Galeria em `.gallery-strip` e "Peças no projeto" (`t('piecesTitle')`) com `ProductGrid`, como na coleção.

> `per_page: 100` para os params estáticos: projetos são poucos (3 cases hoje); rotas além disso renderizam sob demanda.

- [ ] **Step 5: Corporativo** — `web/src/app/[locale]/corporate/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Blocks } from '@/components/content/Blocks';
import { Tile } from '@/components/content/Tile';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { getClients, getPage, getProjects } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'corporate' }),
    getPage(locale as Locale, 'corporate'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/corporate' },
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro,
    image: page?.seo.image ?? page?.cover,
  });
}

export default async function CorporatePage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, page, projects, clients] = await Promise.all([
    getTranslations({ locale, namespace: 'corporate' }),
    getTranslations({ locale, namespace: 'common' }),
    getPage(locale, 'corporate'),
    getProjects(locale, { type: 'corporate', per_page: 12 }),
    getClients(locale),
  ]);
  return (
    <main className="wrap">
      <PageHead title={page?.title ?? t('title')} lead={page?.intro} />
      {page?.cover ? <ApiImage image={page.cover} sizes="100vw" priority className="page-cover" /> : null}
      {page ? <Blocks blocks={page.content} /> : null}
      {projects.data.length > 0 ? (
        <section aria-labelledby="corporate-projects">
          <h2 id="corporate-projects" className="section-title">
            {t('projects')}
          </h2>
          <div className="tiles">
            {projects.data.map((project) => (
              <Tile
                key={project.id}
                href={{ pathname: '/projects/[slug]', params: { slug: project.slug } }}
                title={project.title}
                image={project.cover}
                meta={[
                  ...(project.client_name ? [project.client_name] : []),
                  ...(project.year ? [String(project.year)] : []),
                ]}
                text={project.summary}
                headingLevel="h3"
              />
            ))}
          </div>
        </section>
      ) : null}
      {clients.length > 0 ? (
        <section aria-labelledby="corporate-clients">
          <h2 id="corporate-clients" className="section-title">
            {t('clients')}
          </h2>
          <ul className="logo-wall">
            {clients.map((client) => {
              const mark = client.logo ? (
                <ApiImage image={client.logo} sizes="160px" />
              ) : (
                <span>{client.name}</span>
              );
              return (
                <li key={client.id}>
                  {client.url ? (
                    <a href={client.url} target="_blank" rel="noopener noreferrer" aria-label={client.name}>
                      {mark}
                      <span className="visually-hidden">{common('opensInNewWindow')}</span>
                    </a>
                  ) : (
                    mark
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
```

> O `alt` do logo vem da API (`client.logo.alt`); se vier vazio, o `aria-label` do link garante o nome.

- [ ] **Step 6: Mensagens**

`projects` pt: `{ "title": "Projetos", "description": "Projetos residenciais e corporativos com peças da Franccino.", "count": "{count, plural, one {# projeto} other {# projetos}}", "typeFilter": "Tipo de projeto", "allTypes": "Todos", "types": { "residential": "Residencial", "corporate": "Corporativo" }, "pagination": "Páginas de projetos", "client": "Cliente", "architect": "Arquitetura", "location": "Local", "year": "Ano", "gallery": "Imagens do projeto", "piecesTitle": "Peças no projeto" }`

`projects` en: `{ "title": "Projects", "description": "Residential and corporate projects with Franccino pieces.", "count": "{count, plural, one {# project} other {# projects}}", "typeFilter": "Project type", "allTypes": "All", "types": { "residential": "Residential", "corporate": "Corporate" }, "pagination": "Project pages", "client": "Client", "architect": "Architecture", "location": "Location", "year": "Year", "gallery": "Project images", "piecesTitle": "Pieces in the project" }`

`corporate` pt: `{ "title": "Corporativo", "projects": "Projetos corporativos", "clients": "Clientes" }` · en: `{ "title": "Contract", "projects": "Corporate projects", "clients": "Clients" }`

- [ ] **Step 7: Rodar e commitar** — gates; no navegador: filtro por tipo, paginação (se houver), detalhe e corporativo.

```bash
git commit -m "feat(web): leva projetos e corporativo ao design system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Fábrica e Acabamentos

**Files:**

- Modify (reescrever): `web/src/app/[locale]/factory/page.tsx`, `web/src/app/[locale]/finishes/page.tsx`
- Modify: `web/messages/{pt,en}.json`

**Interfaces:**

- Consumes: `getPage`, `getFinishes` (P3); `PageHead`, `Blocks`, `EmptyNotice` (T2); `ApiImage`.
- Produces: rotas `/factory`, `/finishes`; mensagens `factory.*`, `finishes.*`.

- [ ] **Step 1: Fábrica** — página de conteúdo do painel (`factory`):

```tsx
export default async function FactoryPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, page] = await Promise.all([
    getTranslations({ locale, namespace: 'factory' }),
    getTranslations({ locale, namespace: 'common' }),
    getPage(locale, 'factory'),
  ]);
  return (
    <main className="wrap">
      <PageHead title={page?.title ?? t('title')} lead={page?.intro} />
      {page?.cover ? <ApiImage image={page.cover} sizes="100vw" priority className="page-cover" /> : null}
      {page && page.content.length > 0 ? (
        <Blocks blocks={page.content} />
      ) : (
        <EmptyNotice text={common('nothingYet')} />
      )}
    </main>
  );
}
```

`generateMetadata` como no Corporativo (Task 5, Step 5), com a chave `factory` e `href: { pathname: '/factory' }`.

- [ ] **Step 2: Acabamentos**:

```tsx
export default async function FinishesPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, page, groups] = await Promise.all([
    getTranslations({ locale, namespace: 'finishes' }),
    getTranslations({ locale, namespace: 'common' }),
    getPage(locale, 'finishes'),
    getFinishes(locale),
  ]);
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  return (
    <main className="wrap">
      <PageHead
        title={page?.title ?? t('title')}
        lead={page?.intro}
        meta={total > 0 ? <p className="meta num">{t('count', { count: total })}</p> : null}
      />
      {groups.length === 0 ? (
        <EmptyNotice text={common('nothingYet')} />
      ) : (
        groups.map((group) => (
          <section key={group.id} className="finish-group" aria-labelledby={`finish-group-${group.id}`}>
            <h2 id={`finish-group-${group.id}`} className="section-title">
              {group.name}
            </h2>
            <ul className="finish-grid">
              {group.items.map((item) => (
                <li key={item.id} className="finish-card">
                  <div className="finish-card__swatch">
                    {item.swatch ? (
                      <ApiImage image={item.swatch} sizes="(max-width: 35rem) 50vw, 180px" />
                    ) : (
                      <span className="finish-card__fallback" aria-hidden="true">
                        {item.code ?? item.name.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <strong>{item.name}</strong>
                  {item.code ? <span className="meta num">{item.code}</span> : null}
                  {item.description ? <p className="meta">{item.description}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
```

> O fallback da amostra é o mesmo do `FinishSelector` (P4 T7).

- [ ] **Step 3: Mensagens** — `factory`: pt `{ "title": "Fábrica" }` · en `{ "title": "Factory" }`. `finishes`: pt `{ "title": "Acabamentos", "count": "{count, plural, one {# acabamento} other {# acabamentos}}" }` · en `{ "title": "Finishes", "count": "{count, plural, one {# finish} other {# finishes}}" }`.

- [ ] **Step 4: Rodar e commitar** — no navegador, fábrica com os blocos de demonstração (se a P2 T14 não tiver blocos, cadastrar um de cada tipo no painel local só para conferir e apagar depois).

```bash
git commit -m "feat(web): leva fabrica e acabamentos ao design system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Lojas

**Files:**

- Create: `web/src/lib/stores/filter.ts`, `web/src/lib/stores/map-link.ts`
- Modify: `web/src/components/stores/StoreFinder.tsx` (props novas; comportamento da home inalterado), `web/src/app/[locale]/stores/page.tsx` (reescrever), `web/messages/{pt,en}.json`
- Test: `web/src/lib/stores/filter.test.ts`, `web/src/lib/stores/map-link.test.ts`, `web/src/components/stores/StoreFinder.test.tsx` (acrescentar; R9)

**Interfaces:**

- Consumes: `getStores`, `getPage` (P3); `telHref`, `whatsappUrl` (P4 T2); `Icon`; `PageHead`, `EmptyNotice` (T2).
- Produces:
  - `STORE_TYPES = ['exclusive', 'reseller'] as const`; `filterStores(stores, { state, type })`.
  - `mapSearchUrl(store): string` (Google Maps, coordenadas ou endereço).
  - `StoreFinder({ stores, states, children?, allStates?, typeFilter?, detailed? })` — padrões `false` mantêm a home igual.
  - Rota `/stores`; mensagens `stores.{allTypes,typeFilter,whatsapp,email,website,instagram,map,hours}` e `storesPage.*`.

- [ ] **Step 1: Testes que falham**

`web/src/lib/stores/filter.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Store } from '@/lib/api/types';
import { filterStores } from './filter';

const store = (id: number, state: string, type: string) => ({ id, state, type }) as Store;
const stores = [store(1, 'MG', 'exclusive'), store(2, 'SP', 'reseller'), store(3, 'SP', 'exclusive')];

describe('filterStores', () => {
  it('filters by state and type, null meaning all', () => {
    expect(filterStores(stores, { state: null, type: null }).map((s) => s.id)).toEqual([1, 2, 3]);
    expect(filterStores(stores, { state: 'SP', type: null }).map((s) => s.id)).toEqual([2, 3]);
    expect(filterStores(stores, { state: 'SP', type: 'exclusive' }).map((s) => s.id)).toEqual([3]);
    expect(filterStores(stores, { state: null, type: 'reseller' }).map((s) => s.id)).toEqual([2]);
  });
});
```

`web/src/lib/stores/map-link.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { mapSearchUrl } from './map-link';

const base = {
  name: 'Franccino Lourdes',
  address: 'Rua Marília de Dirceu, 204',
  city: 'Belo Horizonte',
  state: 'MG',
  country: 'BR',
};

describe('mapSearchUrl', () => {
  it('uses the coordinates when both exist', () => {
    expect(mapSearchUrl({ ...base, latitude: -19.93, longitude: -43.94 })).toBe(
      'https://www.google.com/maps/search/?api=1&query=-19.93%2C-43.94',
    );
  });

  it('falls back to the full address', () => {
    expect(mapSearchUrl({ ...base, latitude: null, longitude: -43.94 })).toBe(
      'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent('Franccino Lourdes, Rua Marília de Dirceu, 204, Belo Horizonte, MG, BR'),
    );
  });
});
```

Acrescentar em `web/src/components/stores/StoreFinder.test.tsx` (mantendo o teste da home):

```tsx
it('starts with every state and shows contact details on the stores page', () => {
  const html = renderWithIntl(
    <StoreFinder
      stores={[
        store({
          whatsapp: '5531997469821',
          email: 'bh@franccino.com.br',
          opening_hours: 'Seg a sex, 9h às 18h',
        }),
        store({ id: 2, name: 'Grupo Robusti', type: 'reseller', state: 'SP' }),
      ]}
      states={['MG', 'SP']}
      allStates
      typeFilter
      detailed
    />,
  );
  expect(html).toContain('Franccino Lourdes');
  expect(html).toContain('Grupo Robusti');
  expect(html).toContain('aria-pressed="true">Todos os estados</button>');
  expect(html).toContain('>Revenda</button>');
  expect(html).toContain('href="https://wa.me/5531997469821"');
  expect(html).toContain('href="mailto:bh@franccino.com.br"');
  expect(html).toContain('https://www.google.com/maps/search/?api=1&amp;query=');
  expect(html).toContain('Seg a sex, 9h às 18h');
});
```

Run: `pnpm --filter web test` → Expected: FAIL.

- [ ] **Step 2: Módulos**

`web/src/lib/stores/filter.ts`:

```ts
import type { Store } from '@/lib/api/types';

/** Tipos de loja do `docs/data-model.md` (a API manda texto livre; o filtro só oferece estes). */
export const STORE_TYPES = ['exclusive', 'reseller'] as const;

type StoreFilter = { state: string | null; type: string | null };

/** `null` = sem filtro naquele campo. */
export function filterStores(stores: Store[], { state, type }: StoreFilter): Store[] {
  return stores.filter(
    (store) => (state === null || store.state === state) && (type === null || store.type === type),
  );
}
```

`web/src/lib/stores/map-link.ts`:

```ts
import type { Store } from '@/lib/api/types';

type MapTarget = Pick<Store, 'name' | 'address' | 'city' | 'state' | 'country' | 'latitude' | 'longitude'>;

/** Link de busca do Google Maps (sem chave nem embed, B2): coordenadas se houver as duas, senão o endereço. */
export function mapSearchUrl(store: MapTarget): string {
  const query =
    store.latitude !== null && store.longitude !== null
      ? `${store.latitude},${store.longitude}`
      : [store.name, store.address, store.city, store.state, store.country].join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
```

- [ ] **Step 3: `StoreFinder`** (substitui o da P4 T11; a home não passa as props novas):

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Store } from '@/lib/api/types';
import { telHref, whatsappUrl } from '@/lib/contact-links';
import { filterStores, STORE_TYPES } from '@/lib/stores/filter';
import { mapSearchUrl } from '@/lib/stores/map-link';

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  const common = useTranslations('common');
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="visually-hidden">{common('opensInNewWindow')}</span>
    </a>
  );
}

function StoreCard({ store, detailed }: { store: Store; detailed: boolean }) {
  const t = useTranslations('stores');
  const type = t.has(`types.${store.type}`) ? t(`types.${store.type}`) : store.type;
  const whatsapp = detailed ? whatsappUrl(store.whatsapp) : null;
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
      {detailed ? (
        <>
          {store.opening_hours ? <p className="store__hours">{store.opening_hours}</p> : null}
          <ul className="store__links">
            {whatsapp ? (
              <li>
                <ExternalLink href={whatsapp}>
                  <Icon name="chat" />
                  <span>{t('whatsapp')}</span>
                </ExternalLink>
              </li>
            ) : null}
            {store.email ? (
              <li>
                <a href={`mailto:${store.email}`}>{store.email}</a>
              </li>
            ) : null}
            {store.website_url ? (
              <li>
                <ExternalLink href={store.website_url}>
                  <span>{t('website')}</span>
                </ExternalLink>
              </li>
            ) : null}
            {store.instagram_url ? (
              <li>
                <ExternalLink href={store.instagram_url}>
                  <span>{t('instagram')}</span>
                </ExternalLink>
              </li>
            ) : null}
            <li>
              <ExternalLink href={mapSearchUrl(store)}>
                <Icon name="pin" />
                <span>{t('map')}</span>
              </ExternalLink>
            </li>
          </ul>
        </>
      ) : null}
    </article>
  );
}

type StoreFinderProps = {
  stores: Store[];
  states: string[];
  children?: ReactNode;
  /** Começa em "Todos os estados" (página de lojas); sem isso, no primeiro estado (home). */
  allStates?: boolean;
  typeFilter?: boolean;
  detailed?: boolean;
};

/** Lojas por estado (UF) e, na página de lojas, por tipo; filtro local, sem navegar. */
export function StoreFinder({
  stores,
  states,
  children,
  allStates = false,
  typeFilter = false,
  detailed = false,
}: StoreFinderProps) {
  const t = useTranslations('stores');
  const [state, setState] = useState<string | null>(allStates ? null : (states[0] ?? null));
  const [type, setType] = useState<string | null>(null);
  const types = typeFilter ? STORE_TYPES.filter((value) => stores.some((store) => store.type === value)) : [];
  const visible = filterStores(stores, { state, type });
  return (
    <div className="stores">
      <div className="stores__intro">
        {children}
        <div className="chips" role="group" aria-label={t('stateFilter')}>
          {allStates ? (
            <button
              type="button"
              className="chip"
              aria-pressed={state === null}
              onClick={() => setState(null)}
            >
              {t('allStates')}
            </button>
          ) : null}
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
        {types.length > 1 ? (
          <div className="chips" role="group" aria-label={t('typeFilter')}>
            <button type="button" className="chip" aria-pressed={type === null} onClick={() => setType(null)}>
              {t('allTypes')}
            </button>
            {types.map((value) => (
              <button
                key={value}
                type="button"
                className="chip"
                aria-pressed={type === value}
                onClick={() => setType(value)}
              >
                {t(`types.${value}`)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="store-list" aria-live="polite">
        {visible.length > 0 ? (
          visible.map((store) => <StoreCard key={store.id} store={store} detailed={detailed} />)
        ) : (
          <p className="lead">{t('empty')}</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Página** — `web/src/app/[locale]/stores/page.tsx`:

```tsx
export default async function StoresPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, page, list] = await Promise.all([
    getTranslations({ locale, namespace: 'storesPage' }),
    getTranslations({ locale, namespace: 'common' }),
    getPage(locale, 'stores'),
    getStores(locale),
  ]);
  return (
    <main className="wrap">
      <PageHead
        title={page?.title ?? t('title')}
        lead={page?.intro}
        meta={<p className="meta num">{t('count', { count: list.stores.length })}</p>}
      />
      {list.stores.length === 0 ? (
        <EmptyNotice text={common('nothingYet')} />
      ) : (
        <section className="section section--tight" aria-label={t('title')}>
          <StoreFinder stores={list.stores} states={list.states} allStates typeFilter detailed />
        </section>
      )}
    </main>
  );
}
```

`generateMetadata` como no Corporativo, chave `stores`, `href: { pathname: '/stores' }`.

- [ ] **Step 5: Mensagens** — acrescentar em `stores` (R7; mantém `stateFilter`, `allStates`, `empty`, `cityState`, `types`):

pt: `"typeFilter": "Tipo de loja", "allTypes": "Todos os tipos", "whatsapp": "WhatsApp", "website": "Site da loja", "instagram": "Instagram", "map": "Ver no mapa"` · en: `"typeFilter": "Store type", "allTypes": "All types", "whatsapp": "WhatsApp", "website": "Store website", "instagram": "Instagram", "map": "View on map"`

`storesPage` pt: `{ "title": "Lojas", "count": "{count, plural, one {# loja} other {# lojas}}" }` · en: `{ "title": "Stores", "count": "{count, plural, one {# store} other {# stores}}" }`

- [ ] **Step 6: Rodar e commitar** — no navegador: chips de estado e tipo por mouse, toque e teclado; "Ver no mapa" abre em nova aba; a seção de lojas da home continua começando no primeiro estado.

```bash
git commit -m "feat(web): leva lojas ao design system com filtro por tipo e link de mapa

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Downloads

**Files:**

- Create: `web/src/components/downloads/DownloadsTable.tsx`
- Modify (reescrever): `web/src/app/[locale]/downloads/page.tsx`
- Modify: `web/messages/{pt,en}.json`
- Test: `web/src/components/downloads/DownloadsTable.test.tsx`

**Interfaces:**

- Consumes: `getDownloads`, `getAreas` (P3); `firstValue`, `parsePositiveInteger`, `isValidationError` (P3); `DownloadButton` (`variant="link"`), `AreaDot`, `Pagination`, `ApiImage`; `PageHead`, `EmptyNotice` (T2).
- Produces: `DownloadsTable({ rows })`; rota `/downloads` (`?area`, `?category`, `?q`, `?page`); mensagens `downloads.{table,filters}` (acrescentadas; R7).

- [ ] **Step 1: Teste que falha** — `web/src/components/downloads/DownloadsTable.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { productCard } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { DownloadsTable } from './DownloadsTable';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('DownloadsTable', () => {
  it('lists each piece with its files in a scrollable, labelled table', () => {
    const html = renderWithIntl(
      <DownloadsTable
        rows={[
          {
            ...productCard({ slug: 'aura', name: 'Cadeira Aura' }),
            files: [{ id: 7, type: 'block_3d', title: 'Bloco 3D', format: 'dwg', size: 1024 }],
          },
        ]}
      />,
    );
    expect(html).toContain('class="table-scroll"');
    expect(html).toContain('<caption class="visually-hidden">');
    expect(html).toContain('href="/products/aura"');
    expect(html).toContain('Bloco 3D');
  });
});
```

- [ ] **Step 2: Componente** — `web/src/components/downloads/DownloadsTable.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { DownloadButton } from '@/components/products/DownloadButton';
import { AreaDot } from '@/components/ui/AreaDot';
import { Link } from '@/i18n/navigation';
import type { DownloadFile, ProductCard } from '@/lib/api/types';

export type DownloadRow = ProductCard & { files: DownloadFile[] };

export function DownloadsTable({ rows }: { rows: DownloadRow[] }) {
  const t = useTranslations('downloads.table');
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
            <th scope="col">{t('files')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.cover ? <ApiImage image={row.cover} sizes="64px" className="thumb" /> : null}</td>
              <th scope="row">
                <Link href={{ pathname: '/products/[slug]', params: { slug: row.slug } }}>
                  <strong>{row.name}</strong>
                </Link>
                <div className="meta">{row.category.name}</div>
              </th>
              <td>
                <AreaDot area={row.area.key} />
                {row.area.brand_name}
              </td>
              <td>
                <div className="file-links">
                  {row.files.map((file) => (
                    <DownloadButton key={file.id} file={file} variant="link" />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Página** — mantém a leitura de parâmetros e o tratamento de 422 do P3 (`isValidationError` → lista vazia) e troca a marcação:

```tsx
return (
  <main className="wrap">
    <PageHead
      title={page?.title ?? t('title')}
      lead={page?.intro}
      meta={<p className="meta num">{t('count', { count: downloads.meta.total })}</p>}
    />
    <form className="search-form" role="search">
      <div className="field">
        <label htmlFor="downloads-area">{t('filters.area')}</label>
        <select id="downloads-area" name="area" defaultValue={area ?? ''}>
          <option value="">{t('filters.allAreas')}</option>
          {areas.map((option) => (
            <option key={option.key} value={option.key}>
              {option.brand_name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="downloads-q">{t('filters.search')}</label>
        <input id="downloads-q" name="q" type="search" defaultValue={q} />
      </div>
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <button className="btn" type="submit">
        {t('filters.submit')}
      </button>
    </form>
    {downloads.data.length === 0 ? (
      <EmptyNotice text={t('empty')} />
    ) : (
      <DownloadsTable rows={downloads.data} />
    )}
    <Pagination
      meta={downloads.meta}
      label={t('pagination')}
      hrefFor={(next) => ({
        pathname: '/downloads',
        query: {
          ...(area ? { area } : {}),
          ...(category ? { category } : {}),
          ...(q ? { q } : {}),
          page: String(next),
        },
      })}
    />
  </main>
);
```

com `const [t, page, areas] = await Promise.all([getTranslations({ locale, namespace: 'downloads' }), getPage(locale, 'downloads'), getAreas(locale)])`.

- [ ] **Step 4: Mensagens** — acrescentar em `downloads` (usado pelo `DownloadButton`; R7):

pt: `"title": "Downloads", "count": "{count, plural, one {# peça com arquivos} other {# peças com arquivos}}", "empty": "Nenhuma peça com arquivos para estes filtros.", "pagination": "Páginas de downloads", "filters": { "area": "Linha", "allAreas": "Todas as linhas", "search": "Buscar peça", "submit": "Filtrar" }, "table": { "label": "Arquivos técnicos por peça", "caption": "Peças e arquivos técnicos para download", "image": "Imagem", "piece": "Peça", "area": "Linha", "files": "Arquivos" }`

en: `"title": "Downloads", "count": "{count, plural, one {# piece with files} other {# pieces with files}}", "empty": "No pieces with files for these filters.", "pagination": "Download pages", "filters": { "area": "Line", "allAreas": "All lines", "search": "Find a piece", "submit": "Filter" }, "table": { "label": "Technical files by piece", "caption": "Pieces and technical files to download", "image": "Image", "piece": "Piece", "area": "Line", "files": "Files" }`

> Se alguma chave já existir em `downloads` com o mesmo nome, mantenha a existente e registre no relatório.

- [ ] **Step 5: Rodar e commitar** — no navegador (a demonstração não tem arquivos; cadastrar um PDF de teste numa peça no painel local, conferir o download por link assinado e apagar depois).

```bash
git commit -m "feat(web): leva downloads ao design system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Contato (com canais e FAQ), Privacidade e Termos

**Files:**

- Create: `web/src/components/contact/ContactChannels.tsx`
- Modify (reescrever): `web/src/app/[locale]/contact/page.tsx`, `web/src/app/[locale]/privacy/page.tsx`, `web/src/app/[locale]/terms/page.tsx`
- Modify: `web/messages/{pt,en}.json`
- Test: `web/src/components/contact/ContactChannels.test.tsx`

**Interfaces:**

- Consumes: `getPage`, `getSettings`; `EMPTY_SETTINGS` (P4 T4); `ContactForm` (P4 T3); `telHref`, `whatsappUrl`; `PageHead`, `Blocks`, `EmptyNotice` (T2).
- Produces: `ContactChannels({ settings })`; rotas `/contact`, `/privacy`, `/terms`; mensagens `contactPage.*`, `legal.*`.

- [ ] **Step 1: Teste que falha** — `web/src/components/contact/ContactChannels.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { EMPTY_SETTINGS } from '@/lib/settings';
import { renderWithIntl } from '@/test/intl';
import { ContactChannels } from './ContactChannels';

describe('ContactChannels', () => {
  it('shows only the channels the panel filled in', () => {
    const html = renderWithIntl(
      <ContactChannels
        settings={{ ...EMPTY_SETTINGS, contact_phone: '(37) 3381-4204', quotes_whatsapp: '5511942900080' }}
      />,
    );
    expect(html).toContain('href="tel:+553733814204"');
    expect(html).toContain('href="https://wa.me/5511942900080"');
    expect(html).not.toContain('mailto:');
  });

  it('renders nothing without any channel', () => {
    expect(renderWithIntl(<ContactChannels settings={EMPTY_SETTINGS} />)).toBe('');
  });
});
```

- [ ] **Step 2: Componente** — `web/src/components/contact/ContactChannels.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import type { Settings } from '@/lib/api/types';
import { telHref, whatsappUrl } from '@/lib/contact-links';

/** Canais de `GET /settings`; cada linha só aparece se o painel preencheu (D7). */
export function ContactChannels({ settings }: { settings: Settings }) {
  const t = useTranslations('contactPage.channels');
  const common = useTranslations('common');
  const external = (href: string, text: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {text}
      <span className="visually-hidden">{common('opensInNewWindow')}</span>
    </a>
  );
  const quotes = whatsappUrl(settings.quotes_whatsapp);
  const assistance = whatsappUrl(settings.assistance_whatsapp);
  const rows: { key: string; label: string; value: ReactNode }[] = [
    settings.contact_phone
      ? {
          key: 'phone',
          label: t('phone'),
          value: <a href={telHref(settings.contact_phone)}>{settings.contact_phone}</a>,
        }
      : null,
    settings.contact_email
      ? {
          key: 'email',
          label: t('email'),
          value: <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>,
        }
      : null,
    quotes ? { key: 'quotes', label: t('quotes'), value: external(quotes, t('openWhatsapp')) } : null,
    assistance
      ? { key: 'assistance', label: t('assistance'), value: external(assistance, t('openWhatsapp')) }
      : null,
    settings.assistance_phone
      ? {
          key: 'assistancePhone',
          label: t('assistancePhone'),
          value: <a href={telHref(settings.assistance_phone)}>{settings.assistance_phone}</a>,
        }
      : null,
    settings.factory_address
      ? { key: 'address', label: t('address'), value: settings.factory_address }
      : null,
  ].filter((row): row is { key: string; label: string; value: ReactNode } => row !== null);
  if (rows.length === 0) {
    return null;
  }
  return (
    <dl className="facts">
      {rows.map((row) => (
        <div key={row.key}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
```

- [ ] **Step 3: Contato**:

```tsx
export default async function ContactPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, page, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'contactPage' }),
    getPage(locale, 'contact'),
    getSettings(locale),
  ]);
  return (
    <main className="wrap">
      <PageHead title={page?.title ?? t('title')} lead={page?.intro} />
      <div className="contact-layout">
        <aside aria-labelledby="contact-channels">
          <h2 id="contact-channels" className="section-title">
            {t('channelsTitle')}
          </h2>
          <ContactChannels settings={settings} />
        </aside>
        <section className="quote-form" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title">{t('formTitle')}</h2>
          <ContactForm typeSelectable />
        </section>
      </div>
      {page ? <Blocks blocks={page.content} /> : null}
    </main>
  );
}
```

> O FAQ é o bloco `faq` da página `contact` no painel (B3), renderizado pelo `Blocks` (Task 2).

- [ ] **Step 4: Privacidade e Termos** — as duas páginas iguais, trocando a chave (`privacy`/`terms`), o `href` e a mensagem de título:

```tsx
export default async function PrivacyPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'legal' }),
    getPage(locale, 'privacy'),
  ]);
  return (
    <main className="wrap">
      <PageHead title={page?.title ?? t('privacy')} lead={page?.intro} />
      {page && page.content.length > 0 ? (
        <Blocks blocks={page.content} />
      ) : (
        <EmptyNotice text={t('pending')} />
      )}
    </main>
  );
}
```

- [ ] **Step 5: Mensagens**

`contactPage` pt: `{ "title": "Contato", "channelsTitle": "Fale com a Franccino", "formTitle": "Envie uma mensagem", "channels": { "phone": "Telefone", "email": "E-mail", "quotes": "Orçamentos", "assistance": "Assistência técnica", "assistancePhone": "Telefone da assistência", "address": "Fábrica", "openWhatsapp": "Conversar no WhatsApp" } }`

en: `{ "title": "Contact", "channelsTitle": "Talk to Franccino", "formTitle": "Send a message", "channels": { "phone": "Phone", "email": "Email", "quotes": "Quotes", "assistance": "Technical assistance", "assistancePhone": "Assistance phone", "address": "Factory", "openWhatsapp": "Chat on WhatsApp" } }`

`legal` pt: `{ "privacy": "Política de privacidade", "terms": "Termos de uso", "pending": "O texto desta página ainda não foi publicado." }` · en: `{ "privacy": "Privacy policy", "terms": "Terms of use", "pending": "This page's text has not been published yet." }`

- [ ] **Step 6: Rodar e commitar** — no navegador: canais aparecem conforme o painel; formulário envia (com a API local); FAQ abre e fecha pelo teclado (Enter/Espaço no `summary`).

```bash
git commit -m "feat(web): leva contato, privacidade e termos ao design system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Busca

**Files:**

- Modify (reescrever): `web/src/app/[locale]/search/page.tsx`
- Modify: `web/messages/{pt,en}.json`

**Interfaces:**

- Consumes: `search` (P3), `isValidationError`, `firstValue`; `ProductGrid`; `PageHead`, `Tile`, `EmptyNotice` (T2).
- Produces: rota `/search` (`?q`, mínimo 2 caracteres, como no P3); mensagens `searchPage.*`.

- [ ] **Step 1: Página** (mantém `EMPTY_RESULT` e o tratamento de 422 do P3):

```tsx
return (
  <main className="wrap">
    <PageHead title={t('title')} />
    <form className="search-form" role="search">
      <div className="field">
        <label htmlFor="search-q">{tSearch('label')}</label>
        <input
          id="search-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder={tSearch('placeholder')}
        />
      </div>
      <button className="btn" type="submit">
        {tSearch('submit')}
      </button>
    </form>
    {results ? (
      <>
        <p className="meta" role="status">
          {tSearch('resultsFor', { query })}
        </p>
        {total === 0 ? (
          <EmptyNotice text={tSearch('noResults')} />
        ) : (
          <>
            {results.products.length > 0 ? (
              <section className="result-group" aria-labelledby="results-products">
                <h2 id="results-products" className="section-title">
                  {t('products')}
                </h2>
                <ProductGrid products={results.products} />
              </section>
            ) : null}
            {results.designers.length > 0 ? (
              <section className="result-group" aria-labelledby="results-designers">
                <h2 id="results-designers" className="section-title">
                  {t('designers')}
                </h2>
                <div className="tiles tiles--four">
                  {results.designers.map((designer) => (
                    <Tile
                      key={designer.id}
                      portrait
                      headingLevel="h3"
                      href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}
                      title={designer.name}
                      image={designer.portrait}
                      text={designer.short_bio}
                    />
                  ))}
                </div>
              </section>
            ) : null}
            {results.collections.length > 0 ? (
              <section className="result-group" aria-labelledby="results-collections">
                <h2 id="results-collections" className="section-title">
                  {t('collections')}
                </h2>
                <div className="tiles">
                  {results.collections.map((collection) => (
                    <Tile
                      key={collection.id}
                      headingLevel="h3"
                      href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}
                      title={collection.name}
                      image={collection.cover}
                      text={collection.summary}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </>
    ) : null}
  </main>
);
```

com `const total = results ? results.products.length + results.designers.length + results.collections.length : 0` e `t = getTranslations({ locale, namespace: 'searchPage' })`.

- [ ] **Step 2: Mensagens** — `searchPage` pt: `{ "title": "Busca", "products": "Peças", "designers": "Designers", "collections": "Coleções" }` · en: `{ "title": "Search", "products": "Pieces", "designers": "Designers", "collections": "Collections" }`.

- [ ] **Step 3: Rodar e commitar** — no navegador: busca a partir do ícone do header, termo com 1 caractere (sem busca), termo sem resultado, termo com os três grupos.

```bash
git commit -m "feat(web): leva a busca ao design system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Páginas de erro, sitemap, limpeza e verificação final

**Files:**

- Modify: `web/src/app/[locale]/not-found.tsx`, `web/src/app/[locale]/error.tsx`, `web/src/app/not-found.tsx` (só marcação e classes; **mantém** `defaultLocale` explícito, R24), `web/src/lib/seo/sitemap.ts`, `web/src/app/sitemap.ts`, `web/messages/{pt,en}.json`, `web/CLAUDE.md`
- Test: `web/src/lib/seo/sitemap.test.ts` (acrescentar; R9)

**Interfaces:**

- Produces: `webOnlyEntries(locales): MetadataRoute.Sitemap` (rotas que só existem no site — hoje `/room-planner`; `/quote-list` fica fora por ser `noindex`); páginas de erro no design system.

- [ ] **Step 1: Erros** — `[locale]/not-found.tsx`:

```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function LocaleNotFound() {
  const t = await getTranslations('errors.notFound');
  return (
    <main className="wrap error-page">
      <div className="empty">
        <h1>{t('title')}</h1>
        <p className="lead">{t('description')}</p>
        <div className="empty__actions">
          <Link className="btn" href="/">
            {t('backHome')}
          </Link>
          <Link className="btn btn--ghost" href="/products">
            {t('catalog')}
          </Link>
        </div>
      </div>
    </main>
  );
}
```

`[locale]/error.tsx`: mesma estrutura (cliente, `useTranslations('errors.serverError')`), com `<button className="btn" type="button" onClick={reset}>` e o link "Voltar ao início". `app/not-found.tsx`: só envolve o conteúdo em `<main className="error-page"><div className="empty">…</div></main>` — sem CSS do site nesse caso (fora do layout), aceitável para uma rota que só aparece com idioma inválido.

Mensagem nova: `errors.notFound.catalog` — pt `"Ver o catálogo"` · en `"See the catalogue"`.

> `getTranslations('errors.notFound')` sem `locale` é seguro **dentro** de `[locale]` (o layout chama `setRequestLocale`); fora dele, sempre com `locale` explícito (R24). Depois desta task, confira no build que as rotas estáticas continuam pré-renderizadas (não ƒ).

- [ ] **Step 2: Sitemap** — teste a acrescentar em `sitemap.test.ts`:

```ts
describe('webOnlyEntries', () => {
  it('adds the room planner in the default locale with alternates, and never the quote list', () => {
    const entries = webOnlyEntries(['pt', 'en']);
    expect(entries.map((entry) => entry.url)).toEqual([absoluteUrl('/pt/sala-para-montar')]);
    expect(entries[0].alternates?.languages).toMatchObject({ en: absoluteUrl('/en/room-planner') });
  });
});
```

Implementação em `lib/seo/sitemap.ts`, reaproveitando o mesmo construtor de URL/alternates usado para as entradas da API (siga a função existente; não duplique a lógica de `hreflang`):

```ts
/** Rotas que só existem no site (não vêm de `/sitemap` da API). A lista de orçamento fica fora (`noindex`). */
const WEB_ONLY_ROUTES: Href[] = [{ pathname: '/room-planner' }];

export function webOnlyEntries(locales: Locale[]): MetadataRoute.Sitemap {
  return WEB_ONLY_ROUTES.map((href) => entryFor(href, locales));
}
```

onde `entryFor` é a função (existente ou extraída nesta task) que monta `{ url, alternates: { languages } }` a partir de um `Href`. Em `app/sitemap.ts`, concatenar `webOnlyEntries(locales)` ao resultado atual.

- [ ] **Step 3: Limpeza de mensagens (R7)** — com todas as páginas reescritas, `grep` em `web/src` por cada chave de `pages.*` e `sections.*`; apagar dos dois idiomas só as que ficarem sem referência (textualmente, sem reformatar o arquivo). Registrar a lista no ledger.

- [ ] **Step 4: `web/CLAUDE.md`** — acrescentar ao mapa de pastas: `components/{layout/PageHead,content/{Tile,EmptyNotice},downloads,contact}`, `lib/{projects,stores}`, `styles/pages.css`.

- [ ] **Step 5: Verificação final (plano inteiro)**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web test && API_URL=http://127.0.0.1:9 ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` → verde. Build com a API no ar: rotas sem `searchParams` pré-renderizadas; só projetos, downloads, busca e as listagens do catálogo dinâmicas.

Checagens de regra (as mesmas do P4, Task 12 Step 5): hex fora de `tokens.css`, `ink-2`/`--ok`, `localStorage` em `.tsx`, `border-radius` só em `.list-count`/`.area-dot`.

Com a API local e a demonstração, em 375 e 1440 px, **todas** as rotas do menu e do rodapé: sem rolagem horizontal, sem erro no console, `h1` único, foco visível, Tab em ordem, alvos ≥ 44 px. Conferir que a home (seção de lojas) não mudou.

- [ ] **Step 6: Commit**

```bash
git add web
git commit -m "feat(web): estiliza as paginas de erro, inclui a sala no sitemap e fecha as paginas restantes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Depois da P5a

- **P5b** (plano a escrever): migração do WordPress, carga dos redirects e do catálogo real, importador de planilha (se aprovado), infraestrutura, analytics, banner de cookies, testes de ponta a ponta (Playwright), QA e go-live — base no checklist do [runbook](../runbook-deploy.md) e no roadmap.
- Pendentes que não são deste plano: logo em SVG e fonte definitiva (quando o manual de marca chegar), mapa embutido nas lojas (se aprovado, B2), proposta A4 do P4.
