# CLAUDE.md — web/

Este arquivo complementa o `CLAUDE.md` da raiz do monorepo. Leia os dois antes
de gerar ou alterar código em `web/`.

> Notas específicas do Next.js 16 (breaking changes desta versão) ficam em
> `AGENTS.md`, nesta mesma pasta — esse arquivo é escrito e mantido pelo
> próprio `next dev`; não remova o bloco `nextjs-agent-rules` dele.

---

## Comandos

Sempre pela raiz do workspace (`pnpm install` nunca dentro de `web/`); os
scripts do app rodam com `pnpm --filter web <script>`:

| Comando                                                | O que faz                              |
| ------------------------------------------------------ | -------------------------------------- |
| `pnpm --filter web dev`                                | Sobe o servidor de desenvolvimento     |
| `pnpm --filter web build`                              | Build de produção                      |
| `pnpm --filter web start`                              | Serve o build de produção              |
| `pnpm --filter web lint`                               | ESLint (`eslint .`)                    |
| `pnpm --filter web typecheck`                          | TypeScript sem emitir (`tsc --noEmit`) |
| `pnpm --filter web test`                               | Testes com Vitest (`vitest run`)       |
| `pnpm --filter web format`                             | Prettier (`prettier --write .`)        |
| `ALLOW_BUILD_WITHOUT_API=true pnpm --filter web build` | Build sem a API Laravel no ar (CI)     |

Antes de cada commit, `lint`, `typecheck`, `test` e o build acima precisam
estar verdes.

---

## Mapa de pastas

```
messages/{pt,en}.json
src/
  app/
    [locale]/layout.tsx, not-found.tsx, error.tsx, page.tsx
    [locale]/(rotas internas em inglês)/.../page.tsx
    api/revalidate/route.ts
    sitemap.ts, robots.ts, not-found.tsx (global)
    fonts.ts, globals.css
  components/
    layout/{SiteHeader,HeaderNav,SiteFooter,LanguageSwitcher,QuoteListLink,PageHead}.tsx, nav.ts
    ui/{Icon,Breadcrumbs,AreaDot,QuantityStepper,SnapshotImage,ToastRegion}.tsx
    media/{ApiImage,MediaLinks,VideoFacade}.tsx
    content/{RichText,Blocks,Tile,EmptyNotice}.tsx
    downloads/{DownloadsTable,FileDownloads}.tsx
    consent/ConsentBanner.tsx
    contact/ContactChannels.tsx
    forms/{ContactForm,NewsletterForm,Turnstile}.tsx
    catalog/{CatalogListing,CatalogToolbar,ProductGrid,TechTable,ViewToggle,Pagination,LaunchTile}.tsx, area-pages.tsx
    products/{ProductPlate,ProductRail,QuickAddButton,ProductStage,ModelViewer,ProductConfigurator,...}.tsx
    planner/{RoomPlanner,PlannerLibrary,PlanSvg}.tsx
    quote/QuoteListView.tsx
    home/{HeroSection,HeroCarousel,LaunchesSection,LinesSection,FeatureSection,PlannerTeaser,...}.tsx
    stores/StoreFinder.tsx
    seo/JsonLd.tsx
  i18n/{config,routing,navigation,request}.ts
  lib/
    api/{types,client,catalog,content,forms,empty,errors,listing-params}.ts
    catalog/{area,area-href,card,technical,view}.ts
    product/{finish-selection,gallery,dimension-drawing,model-source}.ts
    quote/{types,list,store,hooks,message,snapshot}.ts
    planner/{types,geometry,plan,plan-store,product,query,data,actions}.ts
    forms/contact.ts
    ui/{local-store,toast,roving,use-is-client,carousel}.ts
    media/links.ts
    consent/{store,gtm}.ts
    projects/type.ts
    stores/{filter,map-link}.ts
    contact-links.ts, settings.ts, env.ts
    format/{dimensions,file-size}.ts
    images/srcset.ts
    seo/{metadata,jsonld,sitemap,site-map}.ts
    security/basic-auth.ts
  styles/{tokens,base,components,forms,chrome,plates,catalog,product,planner,home,quote,pages}.css
  test/{fixtures,intl,navigation-mock}.ts(x)
  proxy.ts
  types/model-viewer.d.ts
```

Alias `@/*` aponta para `src/*`.

---

## Regras

- **Zero texto literal em JSX**: todo texto visível ao usuário vem de
  `messages/pt.json` e `messages/en.json`. Isso é verificado pelo lint
  (`react/jsx-no-literals` em `src/**/*.tsx`).
- Rotas internas (pastas em `src/app/[locale]/...`) ficam em inglês; os
  caminhos públicos (URLs) são traduzidos pelo mapa `pathnames` do roteamento
  de i18n. Os dois idiomas (`pt`, padrão, e `en`) sempre têm prefixo na URL
  (`/pt`, `/en`).
- Dados da API Laravel só chegam pelos módulos de `src/lib/api`; nenhum outro
  arquivo faz `fetch` direto na API.
- Imagens vindas da API usam o componente `ApiImage`; não usar `next/image`
  direto nesses casos.
- Metadata de página (`generateMetadata`) usa o helper `buildMetadata`; não
  montar `Metadata` manualmente em cada rota.
- Server Components por padrão; `"use client"` só quando há estado, evento de
  navegador ou biblioteca client-only.
- Design system: `DESIGN.md` (nesta pasta). Valores só por token (`src/styles/tokens.css`; hex só
  ali); utilitários Tailwind usam os tokens (`bg-stone`, `text-ink-muted`…), a paleta padrão do
  Tailwind está desligada. Classes de componente por área em `src/styles/*.css`, portadas do
  protótipo aprovado (`design/prototype/`).
- Cantos retos, sem sombra em repouso (só no hover do card de produto), madeira = Casa,
  verde = Giardini/sucesso, metadado nunca acima do título.
- Fonte provisória em `src/app/fonts.ts` (troca pelo manual de marca só ali).
- Lógica de estado (lista de orçamento, planta, acabamentos) em módulos puros de `src/lib/*`
  com testes; componentes só ligam estado a markup.
- Estado do navegador (lista e planta) só por `src/lib/quote/store.ts` e
  `src/lib/planner/plan-store.ts`; componentes leem com os hooks, nunca direto do `localStorage`.
- Nunca inventar preço, prazo, contagem ou especificação: sem dado da API, a seção some.
