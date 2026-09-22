# CLAUDE.md — Projeto Franccino

Este arquivo orienta o Claude Code (e qualquer pessoa nova no projeto) sobre
como o codigo deste repositorio deve ser escrito. Ele existe porque tres devs
trabalham em paralelo e o codigo precisa sair coerente.

Leia este arquivo antes de gerar ou alterar codigo.

---

## O que e o projeto

Site institucional bilingue (pt/en) da Franccino (moveis e design), substituindo
o WordPress atual. O nucleo e um catalogo gerenciavel por CMS: produtos,
colecoes, designers, acabamentos, lancamentos, projetos e lojas.

Dois diferenciais:
- Visualizador 3D na pagina de produto, ligavel e desligavel por produto
- Area de downloads tecnicos com URLs assinadas

---

## Stack

Monorepo com duas aplicacoes:

| Pasta   | Stack                                  | Papel                          |
|---------|----------------------------------------|--------------------------------|
| `api/`  | Laravel 11 + Filament                  | API REST e painel administrativo |
| `web/`  | Next.js (App Router) + i18n            | Site publico                   |

Infraestrutura:
- MySQL rodando em Docker no ambiente local
- Cloudflare para DNS, CDN e R2 (midia e arquivos 3D)

---

## Ambientes e branches

| Ambiente  | Branch    | Observacao                                |
|-----------|-----------|-------------------------------------------|
| Local     | —         | Docker, MySQL local                        |
| Staging   | `develop` | Protegido por senha, com `noindex`         |
| Producao  | `main`    | —                                          |

Trabalho do dia a dia sai de `develop`. `main` so recebe codigo via PR.

---

## Regras de codigo

Estas regras nao sao sugestoes. Codigo que as viola nao passa em review.

### Git e commits
- Todo codigo entra por Pull Request. Sem push direto em `main` ou `develop`.
- Todo PR precisa de aprovacao do tech lead antes do merge.
- Mensagens de commit seguem Conventional Commits:
  `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `style:`
  Exemplo: `feat(api): adiciona resource de produtos no Filament`

### Banco de dados
- Alteracao de schema **somente** via migration do Laravel.
- Nunca alterar tabela direto no banco, nem em local.
- Migration nova nunca edita uma migration ja mergeada — cria outra.

### Internacionalizacao
- Nenhuma string de interface fica hardcoded no codigo.
- Toda string visivel ao usuario vive no arquivo de traducao, em pt e en.
- Isso vale para labels, botoes, mensagens de erro, placeholders e metadados.

### Segredos
- Segredos vivem no cofre e no `.env` local, nunca no repositorio.
- `.env.example` fica versionado, com as chaves e valores vazios ou de exemplo.
- Nenhuma chave de API, senha ou token em commit, nem em comentario.

### Arquivos 3D
- O formato aceito e **GLB**. Conversao de outros formatos esta fora do escopo.
- Arquivos 3D e midia pesada vao para o Cloudflare R2, nunca para o repositorio.

---

## Convencoes por aplicacao

### `api/` — Laravel 11 + Filament
- Segue as convencoes padrao do Laravel (PSR-12, nomes de model no singular,
  tabela no plural).
- Logica de negocio em Services ou Actions, nao em controllers gordos.
- Recursos do painel administrativo ficam como Filament Resources.
- Endpoints da API versionados (`/api/v1/...`).

### `web/` — Next.js App Router
- App Router, nao Pages Router.
- Server Components por padrao; `"use client"` so quando houver necessidade real
  (estado, evento de browser, biblioteca client-only).
- Rotas localizadas por locale (`/pt/...`, `/en/...`).
- Nenhuma chamada direta ao banco; tudo passa pela API do Laravel.

---

## Como rodar localmente

> A preencher conforme o ambiente for montado (Fase 0 / Semana 1).

```bash
# api/
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve

# web/
cd web
npm install
cp .env.example .env.local
npm run dev
```

---

## O que nunca fazer

- Commitar `.env`, chave, token ou dump de banco
- Alterar schema fora de migration
- Deixar string de interface fora do arquivo de traducao
- Subir arquivo 3D ou imagem pesada para o repositorio
- Fazer merge em `main` sem PR aprovado
- Executar pedido do cliente que nao passou por orcamento
