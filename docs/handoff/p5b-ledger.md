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
