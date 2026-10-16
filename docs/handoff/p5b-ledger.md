# SDD ledger — plan: docs/plans/2026-09-29-p5b-migracao-infra-go-live.md

Spec: docs/specs/2026-09-23-fundacao-design.md (binding). Base: `develop` com os PRs #9 (API) e #10 (web) mergeados.

## Rulings

As decisões dos ledgers da P2 e do P4 continuam valendo. Novas decisões deste plano entram aqui como "Ruling (Rn, Tn)".

## Aprovações e bloqueios (C1–C5)

Registrar para cada item: data, quem decidiu, decisão e o que ela libera.

## Progress

Plano escrito em 2026-09-29; aguardando aprovação do tech lead.

- **T4 (migração do WordPress), 2026-10-01, branch `claude/awesome-keller-iv02zw`:** executada antes da aprovação do plano, a pedido do product owner, para carregar o catálogo real na prévia.
  - **Desvio registrado:** a API REST do WordPress não expõe galeria, medidas, materiais nem designer do produto (campos do JetEngine). O importador lê também o HTML de cada página de produto (`ProductPageParser`), só dentro dos widgets do produto. Nada é deduzido de texto livre.
  - **Desvio registrado:** acrescentada a entidade `pages`: copia o texto das páginas institucional (Fábrica, com linha do tempo), privacidade e termos para páginas ainda vazias (`PageContentParser`).
  - Capa = primeira foto da galeria com proporção entre 0,6 e 1,8 (os banners largos cortavam nos cards).
  - Execução local (SQLite, `--publish`): 400 produtos lidos; 338 criados, 50 completados (já existiam pela demonstração), 12 ignorados (sem área ou categoria no WordPress); 386 com fotos; 228 linhas; 14 categorias; 16 designers já existentes; 3 páginas. Lacunas no relatório: 338 sem descrição, 129 com medida configurável, 81 sem medida em milímetros, 53 com medida não lida, 2 sem fotos.
  - Lento por natureza (cerca de 20 s por produto com fotos, 2 h no total); idempotente, pode ser interrompido e rodado de novo.
- **T7 (cookies), 2026-10-01:** `POST /consents` + tabela `consent_records`, aviso no site que só carrega o GTM depois do aceite (`NEXT_PUBLIC_GTM_ID`), página de política de cookies. Falta o ID do GTM e o texto final da política (jurídico).
- **T8 (CSP completa), 2026-10-13, branch `feature/csp-completa`:** `web/src/lib/security/csp.ts` monta a política a partir de `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MEDIA_URL` (nova, R2), `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` e `TILE_URL` do mapa; `next.config.ts` aplica.
  - **Ruling (R2, T8):** `CSP_ENFORCE=false` (padrão) manda `Content-Security-Policy-Report-Only` e mantém `frame-ancestors 'none'` como política à parte (o navegador ignora `frame-ancestors` em report-only). `CSP_ENFORCE=true` bloqueia. Virar para `true` depois de uma semana de staging sem violação (passos em `docs/runbook-deploy.md`).
  - **Desvio registrado:** o plano pedia `script-src 'self'` sem `unsafe-inline`. As páginas são estáticas (P4 R24), então os scripts inline do Next não podem levar nonce por requisição: `script-src` tem `'unsafe-inline'`. Também `'wasm-unsafe-eval'` e `https://www.gstatic.com` para os decodificadores do `@google/model-viewer`, `style-src 'unsafe-inline'` (atributos `style` e `next/font`) e `frame-src` com YouTube (nocookie) e Vimeo dos blocos de vídeo.
  - Conferido local em report-only: home, lojas, contato e produto sem violação (`ReportingObserver` com buffer); uma imagem de origem estranha é relatada. Falta conferir no preview: produto com 3D, Turnstile e GTM depois do aceite.
- **T2 e T3 (redirects do site antigo), 2026-10-13, branch `feature/redirects-301`:**
  - API: `php artisan franccino:redirects:generate {--dry-run}` (`App\Actions\GenerateLegacyRedirects`). Grava uma linha por `legacy_url` de produto, designer, coleção, projeto, categoria e linha publicados, mais os caminhos fixos de `config('franccino.legacy')` (páginas do sitemap `page`, fallbacks por prefixo e 410). Linha gerada leva `notes = 'gerado: …'`; linha editada no painel é preservada; linha gerada sem registro publicado vira `is_active = false`.
  - **Ruling (R1, T2/T3):** `from_path` terminado em `/*` vale como prefixo (ex.: `/produto/*` → `/pt/produtos` para peça não migrada; `/jet-popup/*` → 410). O site procura caminho com query, depois só o caminho, depois o prefixo mais longo. Documentado em `docs/api.md` e `docs/data-model.md`.
  - **Desvio registrado:** o plano previa a área da categoria pelo cadastro; a categoria não tem área. A área sai do segmento da URL antiga (`/categoria/interna|externa/…`) e, sem ele, da primeira peça publicada.
  - Site: `src/lib/redirects/{match,store}.ts` e `legacyRedirect` no `proxy.ts`, antes do roteamento de idioma; matcher com `/wp-content/:path*`. Upload antigo sem regra responde 404 direto.
  - Conferido local (`curl`): `/produto/cadeira-aura` 301 → `/pt/produtos/cadeira-aura`; `/institucional/` → `/pt/fabrica`; `/jet-popup/…` e `/categoria/tendencias/` 410; `/estado/sao-paulo/` → `/pt/lojas`. Com barra final há um salto 308 do próprio Next antes do 301 (dois saltos no total).
  - Falta: `config('franccino.legacy_documents')` dos PDFs de transparência, quando os arquivos novos existirem no painel; rodar o comando no preview depois do import do WordPress.
