# 0005 — Ambiente local, testes e ferramentas do time

- Status: Aceita (2026-09-23)

## Contexto

Três devs trabalham em paralelo, em Windows, todos usando Claude Code. O roadmap pede Docker para o banco,
padrão de código no pre-commit e na CI, e um `CLAUDE.md` que mantenha o código coerente.

## Decisão

- **Ambiente local**: PHP e Node nativos; Docker só para MySQL 8.4 e Mailpit (`compose.yaml`). Sem Docker, o
  back-end roda em SQLite. Clonar o repositório **fora do OneDrive** (o sync trava `node_modules` e `vendor`).
- **Testes**: Pest com SQLite em memória localmente (rápido) e MySQL 8.4 na CI (paridade com produção). Vitest no
  front. Nada é dado como pronto sem teste verde e verificação no navegador.
- **Monorepo**: workspace pnpm na raiz; husky + lint-staged (Pint, ESLint, Prettier nos arquivos alterados) e
  commitlint (Conventional Commits); `.gitattributes` força LF.
- **CI**: um workflow por app (`api.yml`, `web.yml`), disparado só quando a pasta do app muda. Dependabot semanal.
- **Claude Code**: `CLAUDE.md` na raiz e um por app; `.claude/settings.json` nega leitura de `.env`;
  Laravel Boost como servidor MCP oficial do Laravel (`.mcp.json`).

## Consequências

- Diferenças sutis entre SQLite e MySQL aparecem só na CI; por isso a CI roda MySQL.
- Proteção de branch depende do plano da organização no GitHub (o plano Free não aplica regras em repositório
  privado). Até a decisão do tech lead, a regra de PR é disciplina do time.
