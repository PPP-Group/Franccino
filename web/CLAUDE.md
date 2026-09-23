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
  components/
    layout/{SiteHeader,SiteFooter,LanguageSwitcher}.tsx
    media/ApiImage.tsx
    content/{RichText,Blocks}.tsx
    forms/{ContactForm,NewsletterForm,Turnstile}.tsx
    products/{DownloadButton,ModelViewer}.tsx
    seo/JsonLd.tsx
  i18n/{config,routing,navigation,request}.ts
  lib/
    api/{types,client,catalog,content,forms}.ts
    env.ts
    format/dimensions.ts
    images/srcset.ts
    seo/{metadata,jsonld,sitemap}.ts
    security/basic-auth.ts
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
- Nada de design elaborado neste plano: HTML semântico, classes Tailwind
  mínimas de estrutura. Sem sistema de design.
