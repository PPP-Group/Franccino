# 0004 — API, rotas localizadas e cache do front

- Status: Aceita (2026-09-23)

## Contexto

O front (Next.js) consome o Laravel. O roadmap pede geração estática com revalidação, seletor de idioma com
hreflang e formulários de contato e newsletter. O `CLAUDE.md` inicial fixou rotas com prefixo de idioma.

## Decisão

- **API** REST versionada em `/api/v1`, contrato em `docs/api.md`. Leitura pública; escrita (contato,
  newsletter, link de download) chamada direto do navegador, com CORS restrito ao domínio do front, limite por IP
  e Cloudflare Turnstile opcional.
- **Leitura pelo servidor do Next** com `fetch` + tags de cache. Requisições com `X-Frontend-Key` válido não têm
  limite de taxa.
- **Revalidação**: ao salvar conteúdo no painel, o Laravel enfileira um POST para `/api/revalidate` do front com as
  tags afetadas (ex.: `products`, `home`), protegido por segredo compartilhado.
- **Rotas**: prefixo de idioma sempre presente (`/pt`, `/en`), caminhos traduzidos pelo next-intl
  (`/pt/produtos/...`, `/en/products/...`). Pastas de rota em inglês.

## Consequências

- Conteúdo publicado aparece no site segundos depois de salvo, sem rebuild.
- Limite de taxa e Turnstile enxergam o IP real do visitante.
- Build do front precisa da API no ar; a CI usa `ALLOW_BUILD_WITHOUT_API=true` para validar sem API.
