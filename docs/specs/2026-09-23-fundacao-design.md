# Fundação do projeto — spec de design

- Data: 2026-09-23
- Status: aguardando revisão
- Branch: `feature/fundacao-projeto` (saindo de `develop`)
- Documentos que fazem parte desta spec: [data-model.md](../data-model.md), [api.md](../api.md),
  [content-inventory.md](../content-inventory.md)

## 1. Objetivo

Adiantar tudo o que não depende de conta de terceiros nem de aprovação do cliente, deixando o
repositório pronto para o time trabalhar em paralelo:

1. Fundação do monorepo (semana 1 do roadmap): ferramentas, convenções automatizadas, CI, docs, Claude Code.
2. Back-end completo de catálogo e CMS (semanas 3–4): banco, painel Filament, API pública, testes.
3. Front-end com direção visual própria (semanas 2–8, parcial): pesquisa de referências, direção de arte
   aprovada, design system e páginas consumindo a API.

Ficam fora: tudo que exige conta ou acesso externo (seção 10) e o que o roadmap posiciona mais adiante
com dependência do cliente (migração do WordPress, carga do catálogo, go-live).

## 2. Contexto

- Repositório `PPP-Group/Francciono-Website` criado em 2026-09-22 com `CLAUDE.md`, `.gitignore` e pastas
  vazias `api/` e `web/`. As convenções desse `CLAUDE.md` continuam valendo (PR obrigatório, Conventional
  Commits, schema só por migration, zero texto fixo, rotas `/pt` e `/en`, GLB como único formato 3D).
- O protótipo Lovable (`franccino-main.zip`) serve **apenas** como referência de conteúdo e de lista de
  páginas. O visual não será portado.
- Inventário do WordPress atual em [content-inventory.md](../content-inventory.md). Principais achados:
  não há GLB, não há inglês, campos do JetEngine não saem na API REST, 1.094 URLs para redirecionar.

## 3. Decisões

| # | Decisão | Motivo |
|---|---|---|
| D1 | **Laravel 13, PHP 8.4, Filament 5, Livewire 4, Pest 5** (roadmap citava Laravel 11 e PHP 8.3) | Laravel 11 está sem correção de segurança desde mar/2026. Pest 5 exige PHP 8.4. |
| D2 | **Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, next-intl 4, Node 24 LTS, pnpm** (roadmap citava Node 20) | Node 20 saiu de suporte em abr/2026. Versões estáveis atuais. |
| D3 | Tradução em colunas JSON (`spatie/laravel-translatable`), editadas em **abas PT/EN lado a lado** no Filament | Uma linha por registro, sem joins; integração simples com Filament; `en` opcional com fallback para `pt`. Alternativa descartada: tabelas `*_translations`. |
| D4 | Mídia com `spatie/laravel-medialibrary` + plugin oficial do Filament; conversões WebP por largura | Versões automáticas de imagem pedidas no roadmap; o front escolhe a conversão via loader próprio do `next/image`, sem custo de otimização de imagem da hospedagem. |
| D5 | Dois discos: `media` (público, CDN) e `downloads` (privado, URL temporária) | Bloqueio de acesso direto aos arquivos técnicos, pedido no roadmap. Localmente o Laravel gera URL temporária do disco local; em produção, URL pré-assinada do R2. |
| D6 | Painel com dois perfis (`admin`, `editor`) por coluna `role` + Policies, e 2FA nativo do Filament | Poucos perfis, sem pacote extra de permissões. |
| D7 | API REST versionada `/api/v1`, leitura pública, escrita (contato, newsletter, link de download) chamada direto do navegador com CORS restrito, limite por IP e Turnstile opcional | Limite de taxa precisa do IP real do visitante. |
| D8 | Cache no Next (fetch com tags) + webhook de revalidação disparado pelo Laravel | "Geração estática com revalidação" do roadmap sem depender de TTL curto. |
| D9 | Rotas localizadas com prefixo sempre presente e caminhos traduzidos (`/pt/produtos/...`, `/en/products/...`) | Mantém a convenção do `CLAUDE.md` existente; caminhos traduzidos ajudam SEO em inglês. |
| D10 | Testes do back-end em SQLite em memória localmente e em **MySQL 8.4** na CI | Rapidez local, paridade com produção na CI. |
| D11 | Monorepo com workspace pnpm na raiz, husky + lint-staged + commitlint, `.gitattributes` com LF | Padrão de código e de commit garantido no pre-commit, inclusive no Windows. |
| D12 | Ambiente local: PHP nativo + Docker só para MySQL e Mailpit; SQLite como alternativa sem Docker | Roadmap pede Docker para o banco; a máquina atual ainda não tem Docker. |
| D13 | Claude Code como ferramenta do time: `CLAUDE.md` na raiz + um por app, `.claude/settings.json` negando leitura de `.env`, Laravel Boost (MCP oficial do Laravel) | Código coerente entre os três devs, como pede o roadmap. |

As decisões viram ADRs em `docs/decisions/` durante a implementação.

## 4. Arquitetura

```
 Navegador ──► Next.js (web/) ──fetch com tags──► Laravel API (api/) ──► MySQL
     │              ▲                                  │   ▲
     │              └──── webhook de revalidação ──────┘   │
     │                                                     │
     ├──► POST contato / newsletter / link de download ────┘  (CORS, limite por IP, Turnstile)
     ├──► imagens e GLB ──► CDN (R2 público)
     └──► arquivo técnico ──► URL temporária (R2 privado)

 Equipe Franccino ──► Painel Filament (/admin no app Laravel)
```

Hospedagem (VPS/Forge para o Laravel, Vercel ou Node para o Next) segue pendente; o código não depende
de recurso exclusivo de uma plataforma.

## 5. Back-end (`api/`)

**Pacotes**: `filament/filament` 5, `filament/spatie-laravel-media-library-plugin`,
`filament/spatie-laravel-settings-plugin`, `spatie/laravel-translatable`, `spatie/laravel-medialibrary`,
`spatie/laravel-settings`, `symfony/html-sanitizer`, `league/flysystem-aws-s3-v3` (R2).
Dev: `pestphp/pest` 5 (+ plugin Laravel), `larastan/larastan`, `laravel/pint`, `laravel/boost`.

**Estrutura**:
- `app/Models` (um por tabela de [data-model.md](../data-model.md)), `app/Enums` (enums com rótulo
  traduzido), `app/Policies`.
- `app/Http/Controllers/Api/V1` enxutos; consultas e filtros em `app/Queries` (ex.: `ProductQuery`);
  serialização em `app/Http/Resources/V1`; validação em Form Requests.
- `app/Actions` para escrita (ex.: `SubmitContactMessage`, `CreateDownloadLink`).
- `app/Support`: `Localized` (resolução de idioma + fallback), `ImagePresenter` (monta `Image` da API),
  `HtmlSanitizer`.
- `app/Filament/Resources` (um por entidade editável), `app/Filament/Pages/ManageSettings`,
  `app/Filament/Support/Translatable` (gera as abas PT/EN para qualquer campo).
- Observers disparam o job `RevalidateFrontend` com as tags do recurso.

**Painel** (`/admin`), grupos de navegação:
- Catálogo: Produtos (abas Geral, Conteúdo, Medidas, Acabamentos, Mídia e 3D, Arquivos técnicos, SEO),
  Categorias, Linhas, Áreas (só edição), Acabamentos, Grupos de acabamento.
- Conteúdo: Coleções, Designers, Lançamentos, Projetos, Clientes, Banners, Páginas (só edição, com
  construtor de blocos).
- Relacionamento: Mensagens de contato (leitura, marcar como lida, exportar CSV), Newsletter
  (exportar CSV), Logs de download.
- Sistema (só admin): Redirects, Configurações, Usuários.

Tabelas com ordenação por arrastar onde existe `sort_order`, filtros por publicação/área/categoria,
busca por nome. Upload de GLB com limite de tamanho configurável (default 20 MB).

**Seeders**: áreas, páginas e grupos de acabamento sempre; usuário admin a partir de
`ADMIN_EMAIL`/`ADMIN_PASSWORD`; conteúdo de demonstração (factories) só em ambiente local.

## 6. Front-end (`web/`)

**Rotas** (todas sob `/[locale]`, com caminhos traduzidos):

| Página | pt | en |
|---|---|---|
| Home | `/pt` | `/en` |
| Área interna / externa | `/pt/indoor`, `/pt/outdoor` | `/en/indoor`, `/en/outdoor` |
| Categoria na área | `/pt/indoor/[categoria]` | `/en/indoor/[category]` |
| Todos os produtos (busca e filtros) | `/pt/produtos` | `/en/products` |
| Produto | `/pt/produtos/[slug]` | `/en/products/[slug]` |
| Lançamentos | `/pt/lancamentos`, `/pt/lancamentos/[slug]` | `/en/novelties`, `/en/novelties/[slug]` |
| Coleções | `/pt/colecoes`, `/pt/colecoes/[slug]` | `/en/collections`, `/en/collections/[slug]` |
| Designers | `/pt/designers`, `/pt/designers/[slug]` | `/en/designers`, `/en/designers/[slug]` |
| Projetos | `/pt/projetos`, `/pt/projetos/[slug]` | `/en/projects`, `/en/projects/[slug]` |
| Corporativo | `/pt/corporativo` | `/en/contract` |
| Fábrica | `/pt/fabrica` | `/en/factory` |
| Acabamentos | `/pt/acabamentos` | `/en/finishes` |
| Downloads (blocos 3D e fichas) | `/pt/downloads` | `/en/downloads` |
| Lojas | `/pt/lojas` | `/en/stores` |
| Contato | `/pt/contato` | `/en/contact` |
| Busca | `/pt/busca` | `/en/search` |
| Privacidade, Termos | `/pt/privacidade`, `/pt/termos` | `/en/privacy`, `/en/terms` |

**Dados**: Server Components por padrão; cliente da API tipado em `src/lib/api` (tipos de
[api.md](../api.md)), `fetch` com `next.tags` + revalidação por tempo como rede de segurança; rota
`/api/revalidate` protegida por segredo. `generateStaticParams` gera produtos, coleções, designers etc.
no build; se a API estiver fora do ar, o build falha em produção e segue vazio só quando
`ALLOW_BUILD_WITHOUT_API=true` (CI).

**Idiomas**: `messages/pt.json` e `messages/en.json`; regra de lint que proíbe texto literal em JSX.
Seletor de idioma usa `slugs` da API para cair na página equivalente.

**SEO**: `generateMetadata` em toda rota (canonical, `hreflang` pt-BR/en/x-default, Open Graph),
`sitemap.xml` a partir de `/sitemap`, `robots.txt` por ambiente, JSON-LD (Organization, Product,
BreadcrumbList). Redirects do site antigo aplicados a partir de `/redirects` (implementação final na
semana 10, estrutura pronta agora).

**Segurança**: cabeçalhos (HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`,
`Permissions-Policy`), `poweredByHeader: false`, staging com autenticação HTTP e `noindex`
(`SITE_ENV=staging`). CSP completa fica para quando GA, Turnstile e o visualizador 3D estiverem definidos.

**Formulários**: componentes cliente enviando direto para a API, validação acessível com mensagens
traduzidas, Turnstile quando `NEXT_PUBLIC_TURNSTILE_SITE_KEY` existir.

**3D**: `@google/model-viewer` carregado só quando o visitante pede o 3D, com estado de carregamento e
fallback (sem modelo ou 3D desligado mostra a galeria).

**Direção visual** (pedido explícito: nada do protótipo, resultado sofisticado):
1. Pesquisa de referências de marcas de mobiliário autoral e alto padrão, nacionais e internacionais,
   com capturas e análise de tipografia, grid, fotografia, navegação, página de produto, filtros,
   apresentação de acabamentos e movimento.
2. Duas ou três direções de arte (tipografia, paleta, ritmo de layout, tratamento de imagem, movimento)
   apresentadas para escolha.
3. Composições da home e da página de produto na direção escolhida, para aprovação.
4. Design system (tokens, escala tipográfica, grid, componentes) e construção das páginas.
5. Revisão final de acabamento visual, acessibilidade (WCAG 2.1 AA) e performance
   (LCP < 2,5 s, CLS < 0,1 em 4G).

As etapas 2 e 3 têm aprovação do usuário antes de seguir.

## 7. Ferramentas e repositório

- Raiz: `package.json` (workspace pnpm com `web/`), `pnpm dev` sobe API, fila e front juntos;
  `pnpm setup` prepara o ambiente do zero (cópia de `.env`, dependências, chave, migrations, seed).
- `compose.yaml`: MySQL 8.4 e Mailpit.
- Hooks: pre-commit (Pint nos PHP alterados, ESLint + Prettier nos TS alterados), commit-msg (commitlint).
- CI (`.github/workflows/ci.yml`) em PR e push para `develop`/`main`: job `api` (Pint, Larastan, Pest com
  MySQL) e job `web` (lint, typecheck, testes, build).
- Dependabot semanal (composer, npm, actions) apontando para `develop`. Template de PR com checklist.
  `CODEOWNERS` com `@pedrivobg` (Pedro Ivo) como revisor obrigatório de tudo — passa a valer quando a
  organização tiver plano que aplique proteção de branch.
- Idiomas ativos configuráveis por ambiente (`SITE_LOCALES=pt,en` no front, `APP_LOCALES` na API), para o
  site poder ir ao ar só em `pt` se o inglês atrasar.
- `docs/`: esta spec, data-model, api, inventário, ADRs, `runbook-deploy.md` (rascunho com pendências).

## 8. Testes

- **API**: Pest. Cada endpoint com caso feliz, idioma `en` com e sem fallback, filtros, `404` de item não
  publicado, validação `422`, limite `429`. Policies (editor sem acesso a usuários/configurações/redirects).
  Painel: teste de renderização de listagem, criação e edição de cada resource, e criação de produto com
  os dois idiomas.
- **Web**: Vitest para funções puras (cliente da API, loader de imagem, formatação de medidas, rotas
  localizadas), typecheck, lint e build. Teste de ponta a ponta (Playwright) fica para a fase de QA.
- Nada é dado como pronto sem rodar: testes verdes, build verde e verificação no navegador das telas.

## 9. Erros

- API: formato padrão do Laravel (`message`, `errors`), `404` para não publicado, `422`, `429`, `500` sem
  detalhe fora de `local`.
- Front: `not-found` e `error` por segmento, mensagens traduzidas; página de produto inexistente devolve 404
  de verdade; falha pontual da API em runtime mantém a última versão em cache.

## 10. Fora do escopo agora

Depende de conta ou acesso: Cloudflare R2 e DNS, e-mail transacional, Sentry, Google Analytics/Tag
Manager/Search Console, Turnstile, hospedagem e deploy, subdomínio de staging.

Depende do cliente: dump do banco do WordPress (para migração completa), modelos GLB, textos em inglês,
cartela de acabamentos, fotografia em alta.

Posterior no roadmap: script de migração do WordPress (semana 5), importador de planilha (decisão na
semana 2), carga do catálogo (semana 9), banner de cookies e integração de analytics (semana 10), testes
de carga e go-live.

## 11. Riscos levantados agora

| Risco | Situação | Encaminhamento |
|---|---|---|
| Não existe nenhum GLB | Confirmado no inventário | Levar ao tech lead já na semana 1: produção dos modelos ou 3D reduzido a um subconjunto. |
| Conteúdo em inglês inexistente | Confirmado | Tradução é do cliente; site pode ir ao ar só em `pt` (idiomas ativos configuráveis). |
| Campos do JetEngine fora da API REST | Confirmado | Pedir dump do banco ou habilitar REST nos campos. |
| 1.094 URLs + URLs com query string | Confirmado | Tabela `redirects` + geração a partir de `legacy_url`. |
| PDFs legais em `/wp-content/uploads/` | Confirmado | Redirect específico para os novos arquivos (configurações > documentos do rodapé). |
| Plano Free da organização não aplica proteção de branch | Confirmado | Decisão do tech lead (GitHub Team). Até lá, disciplina de PR. |

## 12. Frentes de trabalho

| Frente | Conteúdo | Depende de |
|---|---|---|
| F0 Fundação | raiz, docs, CI, Claude Code | — |
| F1 API base | Laravel, Filament, pacotes, auth, perfis, 2FA | F0 |
| F2 Dados | migrations, models, factories, seeders | F1 |
| F3 Painel | resources, configurações, páginas | F2 |
| F4 API pública | endpoints, recursos, testes, revalidação | F2 |
| F5 Web base | Next, i18n, cliente da API, SEO, segurança | F0 |
| F6 Direção visual | pesquisa, direções, composições (aprovação) | — |
| F7 Páginas | design system e telas com dados reais da API | F4, F5, F6 |
| F8 Verificação | tudo rodando junto, QA no navegador, docs, PR | todas |

F1–F4, F5 e F6 correm em paralelo.
