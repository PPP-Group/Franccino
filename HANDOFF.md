# HANDOFF da sessão — Projeto Franccino

Documento de passagem de contexto, para continuar o trabalho em outra conta ou sessão. As seções 1 a 11 fecham a
sessão de 2026-09-30 a 2026-10-04; as seções 12 em diante registram cada sessão seguinte, em ordem. Cada seção
descreve o estado do dia dela: **o estado atual é o da última seção** (19, de 27/10/2026). Quando uma seção antiga
diz que um PR está aberto ou que não há outras branches, vale o que vem depois.

- **Estado técnico detalhado do projeto** (fases P1–P5, ledgers, pendências de contrato):
  [`docs/HANDOFF.md`](docs/HANDOFF.md). Este arquivo não repete aquele; complementa.
- **Regras de código:** [`CLAUDE.md`](CLAUDE.md), [`api/CLAUDE.md`](api/CLAUDE.md) e [`web/CLAUDE.md`](web/CLAUDE.md).

Nenhum segredo neste arquivo: só nomes de variáveis.

---

## 1. Objetivo

### Do projeto

Novo site institucional bilíngue (pt/en) da Franccino (móveis e design), no lugar do WordPress atual.

- Catálogo gerenciável pelo painel: produtos, coleções, designers, acabamentos, lançamentos, projetos e lojas.
- Visualizador 3D por produto, que se liga e desliga no painel.
- Área de downloads técnicos com URLs assinadas.
- Contrato de R$ 22 mil, em 10 a 12 semanas.
- Stack obrigatória no contrato: Next.js, Laravel, MySQL, WebGL com GLB e object storage com CDN.

### Desta sessão

1. Terminar PPP-109 (downloads em designer e lançamento) e PPP-54 (log de atividade do painel).
2. Corrigir o PDF de prévia enviado ao cliente: fotos dos designers e inglês.
3. Deixar o projeto rodando em localhost e no VPS (EasyPanel), para um preview com senha para o cliente.
4. Organizar as branches: só `main` e `develop`.
5. Resolver tudo o que quebrou no deploy do VPS.
6. Preparar o material para o teste de blocos 3D com IA, que o Pedro Fonseca executou, publicar uma
   apresentação para o cliente e propor um caminho profissional.

---

## 2. Histórico, em ordem, com decisões

### 2.1 PPP-109 e PPP-54 (concluídos e mergeados)

- **PPP-109.** `product_files` passou a aceitar designer e lançamento (migration `2026_10_01_150000`). Detalhes:
  - `product_id` virou nullable;
  - `ProductFile::owner()` e trait `HasDownloadFiles`;
  - `FilesRelationManager` compartilhado e `DownloadFileResource` no painel;
  - componente `web/src/components/downloads/FileDownloads.tsx`.
- **PPP-54.** Log de atividade (migration `2026_10_01_160000`, model `ActivityLog`):
  - observer `RecordsActivity` e listener `RecordPanelActivity` para login e configurações;
  - tela `ActivityLogs`, só para admin;
  - perfil `UserRole::Support`.
- **Decisão: descoberta automática de eventos desligada** (`withEvents(discover: false)` em
  `api/bootstrap/app.php`). Ela registrava listeners em dobro; os listeners passaram a ser registrados à mão.

### 2.2 PDF de prévia para o cliente

- **Problema:** retratos de designers quebrados ou vazios, e a página em inglês com texto em português.
- **Correção:**
  - 12 retratos trocados por fotos 640×960 no `demo-content.php`;
  - capas de projetos corrigidas;
  - 9 descrições fragmentadas unidas;
  - traduções aplicadas.
- O PDF foi entregue ao Pedro Ivo. Os scripts de geração ficaram na área temporária da sessão e não estão
  no repositório.

### 2.3 Snapshot de conteúdo e deploy

- **Comando `php artisan franccino:snapshot export|import`** (`api/app/Console/Commands/Snapshot.php`). Gera um zip
  com o banco SQLite e as fotos, sem dados pessoais. As tabelas `PRIVATE_TABLES` são esvaziadas no export.
- **Decisão: snapshot "leve"**, sem as fotos redimensionadas (81 MB contra 276 MB). O import coloca a geração
  das fotos na fila.
- **Imagens Docker:**
  - `api/Dockerfile`: FrankenPHP + SQLite + volume `/app/storage`;
  - `web/Dockerfile`: Next.js, que faz o build ao iniciar porque as páginas estáticas dependem da API;
  - `compose.preview.yaml` para rodar local igual ao VPS.
- **Guia:** [`docs/deploy-preview.md`](docs/deploy-preview.md).
- **Decisão: preview com SQLite e disco local no volume.** MySQL e R2 ficam para staging e produção
  ([`docs/runbook-deploy.md`](docs/runbook-deploy.md)).

### 2.4 Branches

- O Pedro Ivo apagou manualmente as branches antigas no GitHub; o proxy do git desta sessão não deixa apagar.
- **Regra a partir daí:** todo trabalho sobe para `develop`, depois vai por PR de `develop` para `main`.
- O EasyPanel faz **deploy automático** da `main` nos dois serviços.

### 2.5 Deploy no VPS: o que quebrou e como foi resolvido

O primeiro deploy levou mais de 4 horas por causa de defeitos na imagem e de fatores externos. Tudo foi
corrigido nos PRs #16, #17, #18 e #19.

| Problema no VPS                                         | Causa                                                                                                                                                | Correção                                                                                                                             |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| API reiniciando sem parar ("unhealthy")                 | O healthcheck da imagem base testava a porta 2019 (admin do Caddy), que o `php-server` não abre                                                      | `HEALTHCHECK` próprio na rota `/up` (#16)                                                                                            |
| "table categories already exists"                       | Dois containers rodando migrations ao mesmo tempo no redeploy                                                                                        | `flock storage/.migrate.lock` no entrypoint (#16)                                                                                    |
| "database is locked" no import                          | O import sobrescrevia o arquivo SQLite com conexões abertas                                                                                          | O import passou a copiar por `ATTACH` numa transação, preservando usuários e fila (#16)                                              |
| Fotos borradas                                          | O snapshot leve marcava as fotos redimensionadas como prontas sem trazer os arquivos; o `media-library:regenerate` perdia fotos com o worker rodando | A API mostra a original até a redimensionada existir; laço próprio para enfileirar; 2 workers; `DB_TRANSACTION_MODE=IMMEDIATE` (#16) |
| Fila de fotos parada (1665 → 1665)                      | Cada foto pronta salvava a mídia e enfileirava "revalidar todos os produtos"                                                                         | O observer ignora salvamentos que só registram conversões (#17)                                                                      |
| Site em 404 durante o deploy                            | O site compila ao iniciar e não tinha healthcheck                                                                                                    | Healthcheck do site em `/robots.txt`, com prazo de 30 min (#17)                                                                      |
| 3D falhando no preview (CORS)                           | O `php-server` não manda `Access-Control-Allow-Origin` em arquivo estático                                                                           | `api/docker/Caddyfile` com CORS em `/storage/*` só para as origens de `FRONTEND_URL` (#18)                                           |
| Upload pelo painel respondendo 403 (3D e qualquer foto) | Os campos `SpatieMediaLibraryFileUpload` não indicavam disco, e o Filament usava `FILESYSTEM_DISK=local` (privado)                                   | `configureUsing` global para o disco `media` (#19)                                                                                   |
| Senha do preview cortada                                | O EasyPanel corta o valor de variável no `#`                                                                                                         | Documentado: senhas só com letras e números                                                                                          |
| SSL de todos os sites do VPS caiu                       | YAML inválido gerado pelo roteador `vtx-dominios` (outro produto, VTX Tap) na pasta do Traefik                                                       | Roteador desligado (0 réplicas); texto de correção entregue para a sessão do VTX (seção 6)                                           |

### 2.6 Teste de blocos 3D com IA

1. **Pedido do cliente (24/09, grupo do WhatsApp):** 3 produtos com ficha técnica para testar em IA: Cadeira
   Marcela, Poltrona Maria e Sofá Campestre.
   - **Meta do Marcelo:** bloco para SketchUp e Revit, com texturas de alta qualidade e fidelidade total às
     proporções.
   - **Especificações:** o Vinicius as mandou ao Pedro Ivo em privado (25/09), não no grupo.
2. **Pasta no Drive** "Testes 3D com IA – Franccino (Pedro Fonseca)":
   - fotos das três peças;
   - um LEIA-ME de briefing;
   - a pasta "Fichas técnicas", ainda vazia, onde devem entrar as fichas do Vinicius.
3. **O Pedro Fonseca executou o teste** (`design/testes-3d/`, PR #16):
   - modelagem paramétrica por código (Claude no Blender);
   - medidas batendo com as fichas;
   - texturas procedurais;
   - os GLB ficaram só na máquina dele.
4. **Nesta sessão:**
   - os três GLB foram recriados a partir dos scripts do repositório (`bpy 5.0.1`), idênticos em medidas e
     tamanho;
   - foi publicada uma página de apresentação para o cliente (seção 3.2);
   - foi proposto o caminho profissional (seção 5).
5. **Comparação com as fotos:**
   - Marcela e Maria ficaram fiéis na forma.
   - O sofá ficou rígido; o real tem capa solta com caimento.
   - A Marcela Indoor tem encosto estofado em couro; a Giardini tem encosto de palhinha, e pede um bloco próprio.

### 2.7 Outras entregas da sessão

- **Resposta ao cliente sobre "Laravel cru × CMS headless":** a stack é exigência contratual, e o Filament é o
  CMS. Sobre as sugestões do cliente:
  - imagens: já usamos Cloudflare;
  - busca: MySQL atende hoje, com Meilisearch possível depois;
  - integração com WhatsApp Business: fora do escopo.
- **Texto de handoff do problema do VTX** para a sessão daquele produto (seção 6).

---

## 3. Estado atual

### 3.1 Pronto e no ar

- `main` e `develop` iguais em conteúdo; PRs #14 a #19 mergeados.
- Preview no VPS (EasyPanel, projeto `sites`):

  | Serviço | Nome interno               | Domínio                                                  |
  | ------- | -------------------------- | -------------------------------------------------------- |
  | API     | `sites_api-site-franccino` | `https://api-preview-franccino.valenteai.cloud`          |
  | Site    | `sites_site-franccino`     | `https://preview-franccino.valenteai.cloud` (basic auth) |

- Snapshot leve importado, com todas as fotos redimensionadas geradas (conferido em 03/10: 386 capas e amostra de
  galerias com 200).
- Deploy automático da `main` sem queda: os dois serviços têm healthcheck.
- CORS da mídia para o 3D ativo desde 03/10 às 16:01.

### 3.2 Pronto, aguardando ação

- **Página de apresentação do teste 3D** (Artifact privado):
  - endereço: https://claude.ai/artifact/GZ38uvFHvJj7sWAeXpx1Dg (versão 2, com visualizador three.js);
  - para o cliente abrir, o Pedro Ivo precisa compartilhar pelo menu Compartilhar da página;
  - código-fonte em `design/testes-3d/apresentacao/index.html`. Os arquivos `assets/` não estão no
    repositório; para recriar, veja a seção 4.4.
- **Correção dos uploads do painel (#19):** está na `main`. O deploy foi disparado às 18:07 de 03/10 e não
  foi conferido de fora.

### 3.3 Pela metade

- **GLB da Cadeira Marcela no preview:** foi enviado pelo painel antes do #19 e está no disco privado
  (`/storage/1736/…`, responde 403).
  - Precisa ser removido e reenviado no painel: Produtos → "Cadeira Marcela sem braço – Indoor" → Mídia e 3D →
    Modelo 3D.
  - Poltrona Maria e Sofá Campestre ainda não têm GLB no preview.
- **Fichas técnicas do Vinicius:** ainda no WhatsApp privado do Pedro Ivo; não foram para o Drive.

### 3.4 Quebrado ou desligado (fora deste repositório)

- **Roteador de domínios do VTX Tap** (`sites_vtx-dominios`): desligado (0/0). O YAML que ele gera com
  `routers: {}` derruba o file provider do Traefik inteiro. A correção vai no repositório `PPP-Group/app-vtx-tap`.

### 3.5 Pendências conhecidas do projeto

Estão em `docs/HANDOFF.md`, §5 e §6. Entre elas:

- arquivos 3D por URL assinada (contrato 13.2); hoje o GLB é mídia pública;
- P5a e P5b;
- contas de Cloudflare R2;
- staging e produção.

---

## 4. Arquitetura, arquivos e comandos

### 4.1 Estrutura

| Pasta               | O que é                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `api/`              | Laravel 13 + Filament 5 (PHP 8.4): API `/api/v1` e painel `/admin`                           |
| `web/`              | Next.js 16 App Router + next-intl + Tailwind 4 (Node 24): site público                       |
| `docs/`             | Specs, modelo de dados (`data-model.md`), contrato da API (`api.md`), ADRs, planos, runbooks |
| `design/testes-3d/` | Teste 3D com IA: scripts Blender, renders, prints, página de apresentação                    |

### 4.2 Arquivos principais desta sessão

| Arquivo                                         | Para quê                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| `api/app/Console/Commands/Snapshot.php`         | Export/import do conteúdo                                                      |
| `api/Dockerfile`                                | Imagem da API                                                                  |
| `api/docker/entrypoint.sh`                      | Chave, migrations com trava, `SNAPSHOT_URL` uma vez, workers (`QUEUE_WORKERS`) |
| `api/docker/Caddyfile`                          | Servidor (FrankenPHP) + CORS da mídia                                          |
| `api/app/Providers/AppServiceProvider.php`      | Políticas, revalidação, log de atividade, disco dos uploads do painel          |
| `api/app/Observers/RevalidatesFrontend.php`     | Revalidação do site; ignora o registro de conversões                           |
| `web/Dockerfile` e `web/docker/start.sh`        | Imagem do site; build ao iniciar, depois de esperar a API                      |
| `compose.preview.yaml` e `.env.preview.example` | Preview local igual ao VPS                                                     |
| `design/testes-3d/scripts/*.py`                 | Modelagem paramétrica das 3 peças                                              |
| `design/testes-3d/scripts/gerar_glb.py`         | Roda um script de modelagem e exporta o GLB                                    |

### 4.3 Comandos

Local:

```bash
pnpm install && pnpm bootstrap --sqlite
cd api && php artisan franccino:snapshot import ../snapshots/<arquivo>.snapshot.zip --force
pnpm dev                                  # API :8000, fila e site :3000
```

Testes e verificação:

```bash
cd api && php artisan test                # 272 testes em 03/10
cd api && composer lint && composer analyse
pnpm --filter web test
pnpm --filter web lint
pnpm --filter web typecheck
```

Preview em containers:

```bash
docker compose -f compose.preview.yaml up --build
```

No VPS, com o terminal:

```bash
API=$(docker ps -q -f name=sites_api-site-franccino | head -1)
docker exec $API sqlite3 storage/database.sqlite "select count(*) from jobs"    # fila de fotos
docker service logs --tail 40 sites_api-site-franccino
```

Deploy: merge em `main` dispara o deploy automático no EasyPanel. Não reimportar snapshot nem apagar o banco.

### 4.4 Recriar os GLB e a página do teste 3D

```bash
python3 -m venv .bpy && .bpy/bin/pip install bpy==5.0.1 numpy
.bpy/bin/python design/testes-3d/scripts/gerar_glb.py design/testes-3d/scripts/marcela.py marcela.glb
.bpy/bin/python design/testes-3d/scripts/gerar_glb.py design/testes-3d/scripts/maria.py maria.glb
.bpy/bin/python design/testes-3d/scripts/gerar_glb.py design/testes-3d/scripts/sofa_campestre.py sofa.glb
```

A página espera os arquivos abaixo em `assets/`.

- **Modelos:** `<peça>.glb.txt`, com o GLB em base64 (`base64 -w0 marcela.glb > marcela.glb.txt`). O servidor de
  Artifacts não serve `.glb` e bloqueia `data:` e WebAssembly; por isso o visualizador é three.js lendo base64.
- **Renders:** de `design/testes-3d/renders/`.
- **Prints:** de `design/testes-3d/prints-site/`.
- **Fotos:** `foto-*.jpg`, das galerias dos produtos.

---

## 5. Próximos passos exatos

1. **Reenviar o GLB da Marcela** no painel do preview e enviar os da Maria e do Sofá. Depois, conferir o botão
   3D nas páginas dos produtos. Os GLB podem ser recriados pela seção 4.4.
2. **Compartilhar a página de apresentação** com a Franccino (menu Compartilhar).
3. **Levar as perguntas ao cliente:**
   - Marcela: dois blocos, estofado e palhinha?
   - Maria: medidas da ficha (715 × 790 × 750) ou do cadastro (700 × 750 × 720)?
   - Sofá: versões de 2,00 e 2,70 m, e altura total com as almofadas.
4. **Pedir à Franccino** o material do piloto:
   - DWG ou 3D de produção;
   - amostras de acabamento;
   - versões do SketchUp e do Revit usadas pelos arquitetos parceiros.
5. **Piloto profissional com as mesmas 3 peças.** É fora do contrato: precisa de orçamento e aprovação por
   escrito antes de começar. O processo proposto:
   1. geometria a partir dos arquivos da fábrica;
   2. fotos 360° ou fotogrametria;
   3. biblioteca de materiais escaneados, com o mesmo código dos acabamentos do painel;
   4. especialista 3D, com IA acelerando e simulação de tecido nas capas;
   5. exportação automatizada (GLB, USDZ, SKP, RFA, DWG 2D, renders);
   6. conferência de medidas (±2 mm) e aprovação.
6. **Gerar chaves novas** da `SUPABASE_SERVICE_ROLE_KEY` (VTX) e do token da API da Hostinger. Os dois
   apareceram em texto nos chats.
7. **Apagar a variável `SNAPSHOT_URL`** da API no EasyPanel, se existir. A marca `storage/.snapshot-imported` já
   impede reimportar.
8. **Seguir o roadmap de `docs/HANDOFF.md`:** P5a, P5b, contas R2 e staging.

---

## 6. VTX Tap (outro produto, mesmo VPS)

- O roteador `vtx-dominios` gera `/etc/easypanel/traefik/config/vtx-dominios.yaml`. Sem domínios, o arquivo saía
  com estruturas vazias (`routers: {}`) e o Traefik 3.7 rejeitava a pasta inteira. Nenhum domínio novo de
  nenhum serviço ganhava SSL.
- **Correção a fazer no repositório `PPP-Group/app-vtx-tap`** (`deploy/dominios/main.mjs`), nunca direto no VPS,
  porque o próximo deploy sobrescreve: sem domínio, não escrever o bloco `http`.
- **Teste:** `docker logs --tail 50 $(docker ps -q -f name=traefik | head -1) 2>&1 | grep -i error` não pode
  mostrar "Error while building configuration".

---

## 7. Variáveis de ambiente (só nomes)

| Onde                                             | Variáveis                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API (`api/.env.example`)                         | `APP_NAME`, `APP_ENV`, `APP_KEY`, `APP_DEBUG`, `APP_TIMEZONE`, `APP_URL`, `APP_LOCALE`, `APP_FALLBACK_LOCALE`, `APP_FAKER_LOCALE`, `APP_LOCALES`, `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `FILESYSTEM_DISK`, `QUEUE_CONNECTION`, `CACHE_STORE`, `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`, `FRONTEND_API_KEY`, `FRONTEND_REVALIDATE_URL`, `FRONTEND_REVALIDATE_SECRET`, `TURNSTILE_SECRET_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_MEDIA_BUCKET`, `R2_MEDIA_PUBLIC_URL`, `R2_DOWNLOADS_BUCKET`, `WORDPRESS_BASE_URL` (e as demais padrão do Laravel) |
| Imagem da API (padrões no Dockerfile/entrypoint) | `DB_BUSY_TIMEOUT`, `DB_JOURNAL_MODE`, `DB_TRANSACTION_MODE`, `DB_QUEUE_RETRY_AFTER`, `QUEUE_WORKERS`, `RUN_QUEUE_WORKER`, `SNAPSHOT_URL`, `MEDIA_CORS_ORIGINS`, `SERVER_NAME`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Site (`web/.env.example`)                        | `API_URL`, `NEXT_PUBLIC_API_URL`, `SITE_URL`, `SITE_ENV`, `NEXT_PUBLIC_SITE_LOCALES`, `FRONTEND_API_KEY`, `REVALIDATE_SECRET`, `STAGING_BASIC_AUTH_USER`, `STAGING_BASIC_AUTH_PASSWORD`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_GTM_ID`, `ALLOW_BUILD_WITHOUT_API`, `REBUILD_ON_START`, `PORT`                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Preview (`.env.preview.example`)                 | `API_PUBLIC_URL`, `SITE_PUBLIC_URL` e as acima                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| VTX (outro produto)                              | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`, `CERT_RESOLVER`, `TRAEFIK_ARQUIVO`, `INTERVALO`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

Regra: senhas e segredos no EasyPanel só com letras e números. Os segredos vivem no cofre e nos `.env` locais,
nunca no repositório.

---

## 8. Conectores e MCPs usados nesta sessão

| Conector              | Para quê                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| GitHub (MCP)          | PRs #14–#19: criar, ler CI e mergear                                                                           |
| Google Drive          | Pastas do cliente, fotos, pasta do teste 3D e briefing                                                         |
| Gmail                 | Procurar as fichas técnicas; não estavam lá                                                                    |
| Linear                | Atualizar issues (PPP-109, PPP-54). É visível para o cliente: texto neutro, sem preço nem itens fora do escopo |
| Artifacts (claude.ai) | Página de apresentação do teste 3D                                                                             |
| claude-code-remote    | Assinatura de PRs, check-ins, documentação do ambiente                                                         |

Ferramentas locais: Docker, Playwright com Chromium, `bpy` (Blender 5.0.1 como módulo Python) e PHP 8.4.

Os conectores ClickUp, Apollo, Slack, Fathom, Miro, n8n e Supabase estavam disponíveis, mas não foram usados.

---

## 9. Branches e PRs (estado de 04/10; o atual está na seção 17)

| Branch    | Estado                                              |
| --------- | --------------------------------------------------- |
| `main`    | Produção do preview; deploy automático no EasyPanel |
| `develop` | Trabalho do dia a dia; vai para a `main` por PR     |

Não há outras branches nem PRs abertos. PRs desta sessão, todos mergeados:

- [#14](https://github.com/PPP-Group/Franccino/pull/14): PPP-109, PPP-54 e preview Docker.
- [#16](https://github.com/PPP-Group/Franccino/pull/16): healthcheck, snapshot e fila de fotos; testes 3D do Pedro Fonseca.
- [#17](https://github.com/PPP-Group/Franccino/pull/17): fila de fotos e healthcheck do site.
- [#18](https://github.com/PPP-Group/Franccino/pull/18): CORS da mídia para o 3D.
- [#19](https://github.com/PPP-Group/Franccino/pull/19): uploads do painel no disco de mídia.

---

## 10. Pedidos, preferências e restrições do Pedro Ivo

O Pedro Ivo é PO, tech lead e PM do projeto.

- **Fluxo de branches:** sempre `develop`, depois PR para a `main`. O merge pode ser feito depois do CI verde,
  como foi feito nesta sessão.
- **Commits:**
  - Conventional Commits em português, sem acentos;
  - sem identificador de modelo em commits e PRs;
  - não pular hooks.
- **Linear é visível para o cliente:** texto neutro, sem notas comerciais, sem itens fora do escopo, sem preços
  de terceiros nem do teste de IA.
- **Dados confidenciais:**
  - a senha da planilha do SharePoint, que veio do WhatsApp, nunca é copiada para lugar nenhum;
  - os `.env` não são lidos nem commitados;
  - snapshots e dados do cliente nunca vão para o repositório.
- **Dependências:** dependência nova só com aprovação do tech lead.
- **Arquivos pesados:** 3D e mídia pesada não vão para o repositório; vão para o R2 ou o Drive.
- **Fora do escopo:** pedido do cliente que não passou por orçamento não é executado. O teste 3D com IA foi
  cortesia; o piloto profissional precisa de orçamento.
- **Páginas publicadas:** nunca imitar a marca de terceiros. A página do teste é um relatório da equipe para o
  cliente.
- **Ritmo:** o Pedro quer as coisas funcionando de primeira, sem várias idas e vindas no terminal. Antes de
  subir, testar em container igual ao VPS.
- **Deploy:** o deploy automático na `main` não pode derrubar o site.

---

## 11. O que ficou só na sessão (não está no repositório)

- **Na área temporária, perdidos com a sessão:**
  - o dossiê consolidado do cliente;
  - a conversa exportada do WhatsApp (tem segredos, por isso não vai para o repo);
  - os scripts do PDF de prévia;
  - os GLB e os assets da página. Os GLB e a página podem ser recriados pela seção 4.4.
- **Na pasta `snapshots/` local**, ignorada pelo git: os zips de snapshot (completo e leve). Uma cópia do leve
  foi enviada ao Pedro Ivo em 5 partes; o banco do VPS já tem o conteúdo.

---

## 12. Sessão de 05/10/2026 (nova conta)

- **Fonte oficial:** Adobe Garamond Pro, no Drive em `_ARQUIVOS LIBERADOS PARA SITE / _FONTE FRANCCINO OFICIAL`. Os
  arquivos são .otf com licença de desktop da Adobe, que não cobre uso em site (PPP-105). A troca da fonte está pronta
  localmente (`web/src/app/fonts.ts`, `web/src/assets/fonts/`, tokens), mas **não foi commitada**: o commit foi
  bloqueado pela verificação de segurança da sessão por causa da licença. Sobe quando o Pedro Ivo liberar ou quando
  chegar a licença de webfont (Adobe Fonts ou compra).
- **Página do teste 3D** republicada nesta conta: https://claude.ai/artifact/7s5zRZ1pCunRQF9ta81XuS (privada; o
  Pedro Ivo compartilha).
- **Linear sincronizado com o código** em 05/10. Criadas PPP-116 (acesso ao painel do preview para a Franccino),
  PPP-117 (organização do painel) e PPP-118 (revisão técnica página por página).
- **Reunião com a Franccino (05/10):**
  - Material do cliente com prazo de 19/10/2026 (PPP-62): licença da fonte, logo em SVG, textos em inglês,
    descrição dos produtos, lista de acabamentos, fichas técnicas em PDF, fotos originais em alta (fundo branco,
    mesmo ângulo), fotos das lojas e da fábrica, blocos 3D e 2D que já existem, retorno consolidado do layout.
  - Retorno do layout em PPP-42 (rodada 1): Casa/Jardim ou Indoor/Outdoor, menu com categorias no hover, busca no
    cabeçalho com sugestões, 3 produtos por linha, card só com foto e nome, coleções no estilo do site atual,
    lançamentos sem bloco pequeno, fábrica com mais fotos e vídeo, lojas com foto.
  - 3D: a Franccino sobe os blocos que já tem; download em SketchUp é prioridade para os arquitetos (a área de
    downloads já aceita "Bloco 3D" e "Bloco 2D"). A Franccino testa a conversão de um modelo do teste para SketchUp.
  - A Franccino faz reunião interna em 06/10 e manda o retorno consolidado.

---

## 13. Sessão de 07/10/2026: ajustes do cliente, rodada 1 (PPP-42)

O cliente mandou o documento "Franccino — Ajustes no novo site" (06/10/2026), página por página. Branch
`feature/ajustes-cliente-rodada-1`, PR para a `develop`.

- **Fonte:** o cliente mandou Cormorant Garamond (títulos) e EB Garamond (texto). As duas são SIL Open Font
  License 1.1, que permite uso em site. Entram por `next/font/google`, que baixa no build e serve do próprio
  site (sem dependência nova). Substitui a pendência da Adobe Garamond Pro da seção 12.
- **Feito, por item do documento:**

  | Item                    | O que mudou                                                                                                                              |
  | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
  | Regras gerais           | Fundo branco (`--stone`), sem caixas brancas com borda; "Área técnica" fora do menu e do rodapé                                          |
  | 1. Página inicial       | Banner no estilo da versão do Marcelo: texto direto sobre a foto, sem a placa branca                                                     |
  | 2. Casa e Giardini      | Categorias num painel em colunas no menu; sem os botões de categoria; card só com foto e nome; 3 por linha; hover "vem para frente"      |
  | 3. Lançamentos          | Banner com foto; todas as peças juntas, sem dividir por lançamento; etiqueta "Lançamentos"                                               |
  | 4. Coleções             | Título centralizado, blocos grandes 2 por linha, hover escurece com nome e "Saiba mais"; página interna com banner largo, título e texto |
  | 6. Projetos/Corporativo | Banner; projetos em faixas com foto e texto alternando o lado e "Saiba mais"; "Alguns de nossos clientes" em faixa com setas             |
  | 7. Fábrica              | Banner com a capa da página; bloco novo "Vídeo" no painel; "Nossa História" na horizontal, com setas                                     |
  | 8. Lojas                | Mapa com os pinos de todas as lojas abaixo dos filtros (segue o filtro); lojas sem cartão                                                |

- **Conteúdo que entra pelo painel** (o layout já está pronto e usa o que for cadastrado):
  - capa (banner) das páginas Lançamentos, Projetos, Corporativo e Fábrica (foto da fachada), em Páginas;
  - Fábrica: bloco "Vídeo" com `https://youtu.be/OG_GNCn0HoQ` (o "Conheça a Franccino" do site antigo) e a capa;
  - as 3 imagens do banner da home (restaurante, piscina de dia, piscina à noite), em Banners;
  - logos dos clientes, em Clientes; foto de cada loja, em Lojas.
- **Para o tech lead decidir:** o mapa das lojas não usa biblioteca; monta os ladrilhos do OpenStreetMap
  (`web/src/lib/stores/map-view.ts`, constante `TILE_URL`) com a atribuição exigida. A política de uso do
  OpenStreetMap pede provedor comercial para uso pesado; trocar o provedor é só mudar `TILE_URL`.
- **Não testado em container:** esta máquina não tem Docker. Rodaram `php artisan test` (273), `composer lint`,
  `composer analyse`, `pnpm --filter web test` (277), `lint`, `typecheck` e o build como no CI.
- **Item 5 (Designers) e item 9 (Sala para montar):** sem mudança de layout, como pedido.

### 13.1 Complemento (07/10): busca com sugestões no cabeçalho

- A lupa do cabeçalho agora abre um campo de busca com sugestões enquanto a pessoa digita (a partir de 2 letras,
  peças, designers e coleções), e "Ver todos os resultados" leva à página de busca. Pendência do retorno de
  05/10 (PPP-42). Arquivos: `components/layout/HeaderSearch.tsx`, `lib/search/` (lógica, server action e teste).
- **Nomes das áreas:** o documento do cliente usa "Casa" e "Giardini". Fica assim; a dúvida "Casa/Jardim ou
  Indoor/Outdoor" da reunião de 05/10 está resolvida.
- Em 07/10 a fonte da Adobe foi abandonada: vale a seção 13 (Cormorant Garamond e EB Garamond, licença aberta).
- **Conteúdo ainda não cadastrado no painel do preview** (sem acesso ao painel nesta sessão): as 3 imagens do
  banner da home, capas das páginas, vídeo da Fábrica, logos dos clientes e fotos das lojas.

## 14. Para continuar em outra sessão (07/10/2026)

- **Terminar a rodada 1:** siga `docs/handoff/rodada-1-conteudo-passo-a-passo.md` (ordem de merge e deploy, o que
  cadastrar no painel e de onde vem cada arquivo). Branch `feature/ajustes-cliente-rodada-1`, PR #23.
- **Registro da reunião de 05/10** (decisões, pedidos e prazo de 19/10): `docs/reunioes/2026-10-05-reuniao-franccino.md`.
- A conta do Pedro Ivo nesta sessão tinha Linear, Google Drive e GitHub; Gmail não estava conectado.
- Dois commits antigos da `develop` (`5bbb856`, `3e6c5bd`) trazem o nome do modelo no rodapé, contra a regra da
  seção 10. Só se corrige reescrevendo o histórico, com aval do tech lead.
- Sem Docker nesta máquina de sessão: o teste em container ainda precisa ser feito antes do merge na `main`.

## 15. Sessão de 13/10/2026 (Pedro Leite)

Trabalho que não depende de material do cliente nem de contas. Cada item é um PR para a `develop`, com testes; nenhum
foi mergeado nesta sessão (merge e deploy ficam com o tech lead).

- **Já na `main` (PRs #25 e #26):** miniaturas (capa ou retrato) nas sugestões da busca do cabeçalho.
- **#29, redirects 301 (P5b T2 e T3, PPP-94):**
  - comando `php artisan franccino:redirects:generate {--dry-run}`, que grava o `legacy_url` dos registros publicados e
    os caminhos fixos de `config('franccino.legacy')` (páginas, fallback por prefixo `/*` e 410);
  - o `proxy.ts` aplica as regras antes do roteamento de idioma.
  - Depois do deploy, rodar o comando no preview.
- **#30, CSP completa (P5b T8):** em Report-Only até `CSP_ENFORCE=true`. Passos para virar para bloqueio em
  `docs/runbook-deploy.md`.
- **#31, revisão técnica (PPP-118, parte automatizada):** rastreio local de 316 páginas e checagem de celular em 27.
  Corrigidos:
  - a 404 sem layout;
  - 33 links do `/en` que davam 404 (peça, coleção ou projeto sem slug em inglês).

  Falta a passada manual da equipe (ícones, espaçamentos, conteúdo do painel) e o 3D, que não tem GLB no banco local.

- **#32, organização do painel (PPP-117):**
  - nomes do conteúdo em português (o fallback ia para `en`);
  - menus traduzidos, com coleções, lançamentos e designers no grupo Catálogo;
  - filtros por coleção, linha e capa na lista de produtos.
- **Não feito, depende de terceiros:**
  - cadastro do conteúdo da rodada 1 no painel do preview (precisa de acesso ao painel e dos arquivos do cliente,
    `docs/handoff/rodada-1-conteudo-passo-a-passo.md`);
  - infraestrutura (R2, staging, e-mail, monitoramento);
  - dependências que aguardam aprovação.
- **Regra de commit:** o commit `79c4e09` (busca com miniaturas) saiu com o rodapé `Co-Authored-By` com o nome do
  modelo, contra a seção 10. Os commits seguintes desta sessão não têm o rodapé.
- **Próximo da fila sem dependência externa:**
  - arquivos 3D por URL assinada (contrato 13.2): hoje o GLB é mídia pública;
  - revisão de segurança do painel (PPP-95).

## 16. Sessão de 16/10/2026: painel guiado, tradução para o inglês e merge geral

- **Merge de tudo na `develop`:** PRs #27 a #33 (os do Pedro Leite e as atualizações de dependência), #34 e #35.
  Conflitos em `docs/handoff/p5b-ledger.md` e `docs/api.md` resolvidos mantendo os dois lados, com commit de merge
  (sem reescrever histórico). Depois, PR da `develop` para a `main`.
- **#34, painel personalizado (PPP-117):**
  - visual da marca (marrom e pedra, Cormorant nos títulos), sempre claro, logo no topo e no login, menu recolhível;
  - tela "Início" com boas-vindas, atalhos (só os que o perfil pode usar) e "Saúde do conteúdo" (sem capa, sem
    descrição, sem nome em inglês, mensagens não lidas);
  - **Central de ajuda** (`/admin/ajuda`) com um guia por tela, botão "Ajuda desta tela" no topo de cada página e
    tour de boas-vindas no primeiro acesso (reabre pelo menu do usuário);
  - dica embaixo de cada campo (`lang/pt_BR/panel-help.php`, aplicada a todos os campos pelo `FieldHelp`);
  - **vídeos dos tutoriais:** Configurações → "Vídeos dos tutoriais" recebe um link (YouTube não listado, Vimeo ou
    Drive) por guia, que aparece na Central de ajuda. Os vídeos ainda precisam ser gravados (ex.: Loom).
- **#35, tradução do conteúdo para o inglês:**
  - `php artisan franccino:translations:export <arquivo>` e `franccino:translations:import <arquivo> {--force}
{--dry-run}`; o import casa pelo texto em português (não pelo id), só preenche o que está vazio e cria os
    slugs em inglês;
  - `api/database/data/translations/en.json`: 980 textos do preview traduzidos (`reviewed: false`, a Franccino
    confere depois);
  - passo a passo para rodar no VPS em `docs/deploy-preview.md` ("Traduzir o conteúdo para o inglês"). **Ainda não
    foi rodado no preview.**
- **Fonte:** Cormorant Garamond e EB Garamond estão no site inteiro desde o PR #24.
- **Teste em container (16/10):** imagem da API e do site montadas da `develop` e testadas juntas. Resultados:
  - o site compila ao iniciar, fica healthy e pede a senha do preview;
  - `/pt`, `/en` e o catálogo respondem;
  - CSP em Report-Only e `noindex` ativos;
  - as fontes são servidas pelo próprio site.

  Depois disso, o PR #36 (`develop` → `main`) foi mergeado.

- **Drive, uploads de 16/10** (pasta `_FOTOS E VÍDEOS FRANCCINO`, cerca de 26 GB):
  - cerca de 700 fotos (HEIC de iPhone) e 250 vídeos da fábrica (Metal, Cooper, Ateliê, captações de 14-05 e
    15-01) e de peças em produção (TEMPO, Bou, Sofá Rio, Martino, Apruma);
  - os vídeos editados `FRANCCINO FÁBRICA 4K` e vertical, e o manifesto da coleção TEMPO;
  - Clara Arte Resort: 47 fotos profissionais, 2 vídeos e o catálogo (PDF e docx).
  - As pastas `06 - Fábrica-…-001` a `-009` são partes do mesmo zip, e o `…-008.zip` da raiz é cópia.
  - Ainda faltam: logo em vetor, descrições, acabamentos, fichas técnicas, blocos 3D e 2D, fotos de catálogo,
    fotos das lojas, logos dos clientes e os originais do banner.
- **Lista de materiais para o Matheus:** PDF de 16/10 com 17 itens, sem o pedido de textos em inglês e sem os
  antigos itens 17 e 18, com o aviso de que imagens e logos podem ficar para depois. Junto vai a planilha de
  conferência do inglês (980 textos, com colunas de correção). Os dois foram entregues ao Pedro Ivo e não estão no
  repositório.
- **Vídeo próprio na página Fábrica** (pedido do Pedro Ivo em 16/10: sem YouTube, rodando no site):
  - o bloco Vídeo aceita um MP4 enviado no painel (até 150 MB, disco `media`, pasta `videos/`) ou, sem arquivo, o
    endereço do YouTube/Vimeo;
  - o site mostra a capa e só baixa o vídeo no clique (`<video>` nativo, com Range e CORS testados em container);
  - o limite de upload temporário do Livewire (12 MB por padrão) barrava qualquer arquivo maior pelo painel, inclusive
    GLB e PDFs. `config/livewire.php` e `docker/php.ini` passaram a seguir o maior limite (teste `UploadLimitsTest`);
  - o original em 4K (983 MB) não sai do Drive pelo conector. Otimizar antes de subir, conforme a seção 2.1 de
    `docs/handoff/rodada-1-conteudo-passo-a-passo.md`.
- **Depois do deploy, no VPS:** rodar `franccino:redirects:generate` e `franccino:translations:import` (com
  `--dry-run` antes) e fazer o deploy do site (passo a passo em `docs/deploy-preview.md`).
- **Ambiente desta sessão (para a próxima):**
  - o proxy bloqueia os zips do GitHub, e o `composer install` falha. O `vendor` foi montado clonando cada pacote do
    `composer.lock` na referência exata;
  - o Docker Hub devolveu 429. A imagem do Node veio de `mirror.gcr.io/library/node:24-bookworm-slim`, com o
    certificado do proxy num `FROM` local (só para teste, nada disso foi para o repositório).

## 17. Sessão de 21/10/2026: fechamento do mês 1

O mês 1 do contrato era o backend 100% pronto e testado; o mês 2 é o redesenho do site, e o mês 3, as auditorias de
desempenho e segurança. Nesta sessão:

- **Revisão do repositório** e lista do que dava para fazer sem o cliente:
  - a auditoria do backend ficou na área temporária da sessão e foi entregue ao Pedro Ivo;
  - o que ela apontou entrou nos PRs abaixo.
- **#40, 3D e segurança (mergeado):**
  - o GLB foi para o disco privado, e o site pede um link assinado no clique (contrato 13.2). Uma migration move
    os GLB antigos;
  - 2FA obrigatório para admin (`PANEL_ADMIN_MFA_REQUIRED`), cabeçalhos de segurança e cookie seguro;
  - senha com 12 caracteres, letras e números; o último admin ativo não pode ser apagado nem desativado;
  - arquivos técnicos com extensão e tamanho conferidos, e o nome original no download.
- **#41, regras do painel e da API (mergeado):**
  - ordem por arrastar nas peças de coleção e lançamento e nos acabamentos;
  - descadastro da newsletter no painel; `locale_fallback` em todos os recursos da API (`docs/api.md`);
  - retenção dos logs com dados pessoais (`RETENTION_*`) e scheduler na imagem (`RUN_SCHEDULER`);
  - backup diário do SQLite e semanal com fotos e arquivos (`franccino:backup`, em `storage/app/backups`);
  - e-mail aos admins quando um job falha, e o `/up` passou a testar o banco;
  - busca de designers e coleções sem acento (`search_text`);
  - Turnstile com prazo, e-mail de contato sem Markdown do visitante, avatar sem serviço externo, snapshot sem
    dados pessoais.
  - O CI em MySQL pegou a ordem ambígua das listas (o SQLite aceitava); corrigido antes do merge.
- **#42, CI e testes (mergeado):**
  - `composer audit` e `pnpm audit` no CI;
  - workflow `docker`, que sobe as duas imagens com o `compose.preview.yaml` e confere o que o EasyPanel confere;
  - `compose.staging.yaml` com MySQL 8.4;
  - relatório da CSP em `/api/csp-report`, validação das variáveis do build e `pnpm check:redirects`;
  - o bootstrap gera a chave do front e o segredo de revalidação;
  - testes que faltavam (API 422, site 309).
- **#43, arrumação (mergeado):**
  - este arquivo e o `docs/HANDOFF.md` atualizados;
  - `AGENTS.md` aponta para o `CLAUDE.md`, sem cópia;
  - `web/DESIGN.md` e `web/CLAUDE.md` com as fontes Garamond e o fundo branco;
  - status do `docs/data-model.md`, `.gitignore` e regra do Dependabot para o major do `@types/node`.
  - O `name` do `api/composer.json` continua `laravel/laravel`: ele entra no hash do `composer.lock`, e trocar pede
    `composer update --lock`.
- **3D com troca de acabamento** (pedido de pesquisa, exemplo do configurador do arqbrunomaciel):
  - PDF para o cliente entregue ao Pedro Ivo, com a opção A recomendada: model-viewer, uma aparência 3D por
    acabamento e partes por peça;
  - é escopo novo, com orçamento à parte. Nada foi implementado.
- **Documento "Alterações primeira versão" do cliente:** serve só como base do redesenho do mês 2; a versão enviada
  era um beta.

Tudo foi para a `main` pelo PR #44 (`develop` → `main`).

### 17.1 Depois do merge na `main`, no VPS

1. Deploy da API e do site no EasyPanel. Em 16/10 o deploy automático estava desligado; confira.
2. ~~No próximo login, o admin configura o 2FA.~~ Em 27/10 ficou decidido: 2FA desligado no preview (seção 19).
3. Rodar, nesta ordem (passo a passo em `docs/deploy-preview.md`):
   1. `php artisan franccino:redirects:generate`;
   2. `php artisan franccino:translations:import database/data/translations/en.json --dry-run`, depois sem
      `--dry-run`;
   3. o redeploy do site.
4. De uma máquina com Node: `pnpm check:redirects --site https://preview-franccino.valenteai.cloud --user <usuário>`,
   com a senha do preview na variável `CHECK_REDIRECTS_PASSWORD` (fora do histórico do terminal; passo a passo em
   `docs/deploy-preview.md`).

### 17.2 Para o Pedro Ivo fazer no GitHub

- Apagar as branches já mergeadas. A sessão não tem permissão para apagar:
  - `docs/handoff-2026-10-13`;
  - `feature/ajustes-cliente-rodada-1`, `feature/busca-com-imagens`, `feature/csp-completa`;
  - `feature/painel-organizacao`, `feature/painel-personalizado`, `feature/redirects-301`;
  - `feature/regras-painel-api`, `feature/seguranca-e-arquivos`, `feature/traducao-en`;
  - `feature/video-proprio-fabrica`, `fix/404-com-layout`.
- Dependabot: o #39 (Laravel 13.37) foi mergeado na `develop`; o #22 (`@types/node` 26) foi fechado, e a regra nova
  impede que ele volte.

## 18. Sessão de 22/10/2026: o que falta da fase 1 e Linear limpo

- **Nada da seção 17.1 foi feito ainda:**
  - o preview continua sem a entrega de 21/10;
  - os comandos não rodaram;
  - as branches da 17.2 continuam no GitHub, mais `feature/docs-arrumacao`, `feature/infra-ci-testes` e
    `fix/handoff-merges`.
- **PDF para a equipe** "Franccino - Fase 1, o que falta (22-10)": publicar, rodar, conferir, GitHub e decisões. Foi
  entregue ao Pedro Ivo e não está no repositório. O mesmo checklist está no Linear, no **PPP-119**.
- **Linear limpo** (é visível para o cliente; comentários neutros em cada item):
  - **Done:** o que já estava entregue no código:
    - PPP-64, 67, 70, 71, 73, 75 e 108;
    - PPP-51 (o bucket fica no PPP-11);
    - PPP-20 (formato GLB);
    - PPP-41 e 42 (apresentação e rodada 1);
    - PPP-36 a 40 (telas da beta).
  - **Atualizados:**
    - PPP-43 virou "Rodada 2 do design: redesenho do site";
    - PPP-105: fonte aplicada, falta o logo em SVG;
    - PPP-94 e 96 em andamento, com o que falta;
    - PPP-57 e 77 em Todo, dentro do PPP-119;
    - PPP-23 aguarda a lista de acabamentos.
  - **Notas de estado:** PPP-15, 59, 62, 79, 93 e 95.
  - **Duplicado:** PPP-82 foi juntado ao PPP-92.
  - **Novo:** PPP-119, "Publicar no preview e conferir a entrega do backend".
- **`docs/HANDOFF.md`:** as linhas que sobraram da tabela antiga no resumo foram removidas.

## 19. 27/10/2026: 2FA desligado no preview

- O Pedro Ivo publicou a entrega no preview, e o login do painel passou a pedir o código do app autenticador. Ninguém
  tinha configurado o app, e isso também travaria os testes da Franccino.
- **Decisão:** no preview, 2FA desligado (`PANEL_ADMIN_MFA_REQUIRED=false` nas variáveis da API no EasyPanel). No
  staging e na produção, ligado (é o padrão da imagem).
- Se o painel ainda pedir o código depois da variável, zerar o 2FA dos usuários do preview com o comando de
  `docs/deploy-preview.md` (seção "Serviço da API").
- `.env.preview.example` já traz a variável desligada.
