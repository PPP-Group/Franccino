# HANDOFF da sessão — Projeto Franccino

Documento de passagem de contexto, para continuar o trabalho em outra conta ou sessão. As seções 1 a 11 fecham a
sessão de 2026-09-30 a 2026-10-04; as seções 12 em diante registram cada sessão seguinte, em ordem. Cada seção
descreve o estado do dia dela: **o estado atual é o da última seção** (30, de 13/11/2026, até o complemento 30.6). Quando uma seção antiga
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

## 20. 30/10/2026: banco de ideias aprovado e início da rodada 2 do design

- **Retorno do banco de ideias (26/10):** reunião com o Matheus e texto do Marcelo, registrados ideia por ideia em
  [`docs/reunioes/2026-10-26-retorno-banco-de-ideias.md`](docs/reunioes/2026-10-26-retorno-banco-de-ideias.md). Quando
  as duas respostas divergem, vale a da Franccino. O PDF do banco de ideias e o PDF de respostas não estavam no
  repositório nem no Linear: a numeração foi reconstruída pela conversa e precisa ser conferida.
- **Plano e o que já foi feito:** [`docs/plans/2026-10-30-rodada-2-banco-de-ideias.md`](docs/plans/2026-10-30-rodada-2-banco-de-ideias.md).
  Branch `claude/banner-cover-images-vcdpmb`, saída da `develop`. Entraram as ideias aprovadas:
  - esteira só com foto e nome (1); o nome vem para frente com a peça (2); cabeçalho branco sólido (5);
  - banner sem texto por cima quando a arte já tem texto, carrossel sem botões na tela (3, 14);
  - vídeo curto em loop no banner, enviado no painel (14);
  - revelação na rolagem e a peça em destaque que "vira e se desfaz" (4), tudo em `web/src/styles/motion.css`;
  - **ambientes com pontos clicáveis (7):** painel Conteúdo → Ambientes, `GET /scenes`, seção na home;
  - acabamento em detalhe na página Acabamentos (9); a foto do card cresce até a página da peça (10);
  - números que contam e faixa de carregamento nas fotos (12).
- **Migration nova:** `2026_10_30_100000_create_scenes_tables` (`scenes` e `scene_hotspots`). O banner ganhou a mídia
  `video` (sem migration). `docs/api.md` e `docs/data-model.md` atualizados.
- **Para o tech lead decidir:** a pausa do carrossel ficou só para teclado e leitor de tela (o cliente pediu sem botões);
  o `docs/HANDOFF.md` §5.2 listava "hotspots" como escopo novo, e a ideia 7 entrou por ter sido aprovada no banco de
  ideias da etapa 2 (a ideia 8 e o configurador 3D seguem fora).
- **Depois do merge, no preview:** cadastrar um ambiente de teste e, se houver, um vídeo curto num banner, antes de
  mostrar à Franccino. O Matheus recebe o acesso ao painel.

### 20.1 Complemento (30/10): Linear limpo e o que faltava das ideias

- **Linear** (visível para o cliente, texto neutro):
  - PPP-43 em andamento, com as sub-tarefas da rodada 2: PPP-120 (esteira, cards e cabeçalho), PPP-121 (banner limpo
    com vídeo), PPP-122 (ambientes com pontos), PPP-123 (acabamento em detalhe), PPP-124 (animações) e PPP-125
    (publicar no preview e consolidar o retorno, com o Pedro Ivo);
  - PPP-98 marcada como duplicada da PPP-116, que passou para em andamento (acesso ao painel para o Matheus);
  - descrições vazias ou desatualizadas preenchidas: PPP-10, 13, 15, 59, 61, 84 a 88, 91, 93 (agora "Enviar o sitemap
    ao Search Console") e 99;
  - dependências ligadas: PPP-28 bloqueia 56 e 63; PPP-11 bloqueia 59 e 79; PPP-10 bloqueia 13 e 15; PPP-16 bloqueia 93;
    PPP-13 e 18 bloqueiam 97; PPP-43 bloqueia 44 e 87; PPP-23 bloqueia 84;
  - retorno de 26/10 registrado em PPP-62, 23 e 105; PPP-119 com o deploy de 27/10 e o 2FA desligado marcados.
  - Os marcos ("Sprint 0" a "Sprint 5") continuam com as datas do plano original; a rodada 2 está no "Sprint 2". Mudar
    as datas é decisão do tech lead.
- **Código:** marcar o ponto clicando na foto, no painel do ambiente; "Ver em detalhe" do acabamento escolhido na página
  da peça.

## 21. 06/11/2026: novo preview revisado (rodada 3 do layout)

Pedido do Pedro Ivo: preview novo, revisado página por página, com a hierarquia de fonte e os espaços padronizados,
mais premium (quadrado, preto no branco) e com os 31 pontos de retorno dele e o pedido de mais imagem e fundos
alternados na home. Branch `claude/banner-cover-images-vcdpmb`, PR para a `develop` e depois `develop` → `main`.

- **Escala única** (`web/src/styles/tokens.css`, regras em `web/DESIGN.md`): 9 tamanhos de texto, espaços na grade de
  4 px, 5 tempos de movimento, tom areia (`--sand`) para alternar fundos. Sem sombra em lugar nenhum: o hover de foto é o
  zoom (`.hover-zoom`). Aparecer ao rolar por `data-reveal` (`RevealObserver`), uma vez só.
- **Global:** tela de abertura com o logo (uma vez por sessão), troca de página com fade, cabeçalho transparente sobre o
  banner que fica branco no hover e ao rolar, menus por clique e por hover com atraso (Coleções ganhou submenu), busca
  animada, ícones oficiais (`@tabler/icons-react`, dependência nova pedida pelo tech lead), página abre no topo.
- **Home:** banner em tela cheia (100svh), fixo enquanto o conteúdo sobe; seções novas de coleções e projetos com fotos
  grandes; fundos alternando branco e areia.
- **Catálogo e peça:** card sem sombra, etiqueta "Lançamento" em versalete abaixo do nome, grade sempre completa
  (célula vazia vira outro conteúdo), quantidade e botões da peça refeitos, tabela técnica com a linha inteira marcada e
  2 a 3 fotos perto do cursor, "Peças que você viu" no fim das páginas.
- **Coleções, projetos e designers:** retratos dos designers na coleção, "Outras coleções", filtros de projeto em chips
  quadrados, página do projeto editorial, foto do topo fixa.
- **Fábrica, lojas e sala:** fábrica editorial, linha do tempo horizontal de verdade, clique no mapa destaca a loja e
  rola até ela, a sala para montar mostra a foto da peça.
- **Fotos:** a API passou a servir a original quando nenhuma conversão cobre a largura (até 2560 px) e as conversões
  grandes saem com qualidade 90 (`ImagePresenter`, `HasImageConversions`). A maior parte da perda vem das próprias
  fontes: os banners e capas do WordPress têm 1920×500 e as fotos de produto vieram comprimidas.
- **Página das ideias aprovadas** (`/pt/ideias`, `noindex`, fora do sitemap): cada ideia com o exemplo funcionando e o
  que falta para entrar de vez.
- **Pesquisa** (`docs/pesquisas/2026-11-06-fonte-fundo-e-capas.md`): fonte oficial (PPP-129), fundo branco sem perder
  qualidade (PPP-130) e capa sempre na diagonal virada para a esquerda (dica no painel já entrou).
- **Verificação local:** lint, typecheck, 374 testes do site e o build como no CI. O PHP 8.4 não roda nesta máquina:
  Pest e Larastan só no CI.
- **Linear:** PPP-126 (layout), PPP-127 (fotos), PPP-128 (microinterações), PPP-129 (fonte) e PPP-130 (fundo branco).

### 21.1 Do Pedro Ivo, depois do merge na `main`

1. Conferir o deploy da API e do site no EasyPanel (o automático pode estar desligado).
2. Painel → Páginas → Fábrica: bloco "Vídeo" com `https://youtu.be/OG_GNCn0HoQ` (ou um MP4 de até 150 MB).
3. Painel → Conteúdo → Ambientes: um ambiente de teste com 2 ou 3 pontos.
4. Conteúdo a corrigir: bio da Andrea Zanocchi começa em minúscula; banners sem texto alternativo; a capa da Fábrica é
   uma sala, não a fábrica; a capa da Coleção Caminhos responde 403; a descrição do Clara Arte repete parágrafos.
5. Opcional, com os workers parados: `php artisan media-library:regenerate --force` para gerar as fotos na qualidade
   nova.

### 21.2 Da Franccino

Banners em 16:9 (2560 px) e em 4:5; capas das coleções e das páginas; fotos originais das peças em fundo branco e na
diagonal; fotos de ambientes com as peças de cada um; acabamentos digitalizados (2500 px ou mais); números da fábrica;
MP4 curto para o banner; logo em SVG; decisão da fonte (PPP-129) e ok para o piloto do fundo branco (PPP-130).

### 21.3 Complemento (06/11): o PDF de respostas, capas e fundo branco

- **PDF de respostas do banco de ideias (16/10, preenchido pela Franccino):** é a fonte oficial e a numeração dele vale
  sobre a reconstruída em `docs/reunioes/2026-10-26-retorno-banco-de-ideias.md`. Aprovadas: 01 (carrossel com a peça em
  destaque, com ajustes: sem acabamentos, sem "ver peça" e sem "ver em 3D", o clique na foto abre a peça), 04
  (paralaxe e revelação), 07 (ambiente com pontos), 09 (acabamento em detalhe, na página de acabamentos), 10
  (transição com a foto), 12 (microinterações, "validar quais serão usadas") e 13 (vídeo em loop). Mais tarde: 02, 05, 08. Descartadas: 03, 06, 11, 14. A página `/pt/ideias` segue essa numeração.
- **Entrou nesta complementação:** o carrossel da ideia 01 (`FeatureCarousel`, na home, coleções e designers); a
  paralaxe e a revelação em cortina (`data-parallax`, `data-reveal="curtain"`); as microinterações 12a a 12f, cada uma
  num bloco de `motion.css` que dá para desligar (lista em `web/DESIGN.md`); no painel, o ponto do ambiente marcado com
  um clique na foto e a peça escolhida ali mesmo.
- **Capas:** 182 capas trocadas no preview pela foto na diagonal, virada para a esquerda
  (`database/data/covers/2026-11-06-diagonal-esquerda.json`, aplicada no deploy) e uma segunda lista com 7 peças
  (`…-2.json`). As 7 peças de estúdio da TEMPO com fundo bege (Toé, Sopro, Orvalho, Terezinha, Melina Estofada, Royale e
  Majestic) foram limpas para fundo branco com o BiRefNet (licença MIT, rodado fora do servidor) e enviadas pelo painel.
  Detalhes de perto e fotos com fundo preto não ficam bons com a limpeza: nessas peças a capa virou outra foto da
  galeria.
- **Logo em SVG:** não está no Drive compartilhado da Franccino nem no do Pedro Ivo. O Marcelo disse em 26/10 que está
  num Drive que ele passou; falta o link.

### 21.4 Complemento (06/11, noite): retorno do Pedro Ivo sobre o preview (PR #66)

- **Campos:** lista de opções própria (`components/ui/Select.tsx`, lógica em `lib/ui/listbox.ts`) no lugar do
  `<select>` nativo; seleção de texto e barra de rolagem nas cores da marca; textos mais formais em `messages/`.
- **Foto que cresce e volta (ideia 10):** `components/media/MorphImage.tsx`, `lib/ui/morph.ts` e o controle da
  navegação em `components/layout/navigation-motion.ts`. Só a navegação que abre a peça (ou volta dela pelo navegador,
  pelo caminho ou pelo logo) anima; entre listagens nada se mexe. A rolagem de cada página do histórico é guardada e
  devolvida na hora. Vale para peça, peça em destaque da home, coleção, projeto e os blocos Casa/Giardini (que agora
  abrem com o banner da foto da área). Conferido no build de produção quadro a quadro, sem quadro branco.
- **Carrossel da ideia 01** em leque e o campo novo **"Foto sem fundo (carrossel)"** no painel (coleção `cutout`,
  PNG/WebP com transparência). Sem a foto sem fundo, o carrossel usa a capa.
- **Layout:** menu com o clique indo para a listagem completa e as subcategorias no hover; peça em destaque ao lado do
  título nas páginas que tinham metade vazia; coluna dos designers alinhada na coleção; fundos alternados na peça;
  banner fixo da home só atrás da primeira seção; paralaxe mais forte.
- **Peça em destaque da home:** é a primeira peça marcada como "Destaque" (Produtos → Geral), pela ordem das peças.
- **Qualidade das fotos do topo:** limite das fontes, não do recorte. Os banners do WordPress têm 1920×500 e as capas
  de Casa e Giardini 900×576; esticadas para a tela inteira, perdem nitidez. Precisa das fotos originais (Banners e
  Áreas, no painel), em 2560 px ou mais.
- **Capas:** as 7 da TEMPO foram limpas de novo (fundo branco sem halo nem cinza) e reenviadas. Sofá Antônio e Sofá
  Royale não têm foto em diagonal: precisam de foto nova.
- **Depois do deploy:** enviar a foto sem fundo das 15 peças de lançamento (recortes prontos na área temporária da
  sessão; script de envio pelo painel em `painel/enviar-recorte.js` dessa área). O usuário de teste do painel criado
  para isso deve ser apagado pelo Pedro Ivo.

### 21.5 Complemento (06/11, noite): auditoria do Drive, logo e Corporativo (PR #68)

- **Auditoria do Drive** (planilha "Auditoria_Drive_Site_Franccino.xlsx", de outra sessão; não está no repositório):
  532 arquivos para subir ou substituir, 518 marcados "Usar". **Ainda não subidos:** o conector do Drive só entrega
  arquivos até ~4 MB, e os pequenos voltam inteiros na conversa (gasto alto). O caminho barato é pôr
  "Qualquer pessoa com o link: Leitor" nas pastas `_PEDRO VAI EXTRAIR DO SITE`, `_FOTOS E VÍDEOS FRANCCINO` e nas pastas
  de produto da raiz (nunca na `_A PLANILHA`); aí um script baixa tudo de uma vez. Nem o Pedro Ivo nem a conta da
  sessão são gerentes do Drive compartilhado: o pedido foi feito à Franccino.
- **Logo:** FRANCCINO em SVG (`web/src/components/layout/Logo.tsx`), com as letras da Adobe Garamond Pro do Drive e o
  espaçamento da logo do site atual. Só os contornos entram no site, nunca o arquivo da fonte.
- **Fonte:** Jost no site inteiro, títulos e texto (pedido do Pedro Ivo, mais tarde no mesmo dia; licença SIL OFL,
  servida pelo próprio site via `next/font`). Substitui Cormorant Garamond e EB Garamond. O painel continua como estava.
- **Projetos virou "Corporativo"** (menu, título, rodapé e seção da home), sem os filtros Todos e Residencial.
- **Movimento:** saiu a faixa de carregamento das fotos; a cortina da esquerda para a direita ficou só nas coleções.

## 22. 07/11/2026: revisão do preview (carrossel, fotos, tabela técnica, Corporativo, Cadeira Toé)

Retorno do tech lead sobre o preview publicado em 06/11. Branch `claude/francine-site-review-htegfp`. Tudo conferido
num `next dev` local apontado para a API do preview, com Playwright (capturas e vídeo da navegação).

- **Carrossel da home (ideia 01):** saiu o degradê do palco (quebrava nos cantos); as peças ficam direto no fundo da
  seção e as das pontas passam da largura do conteúdo. As distantes deixaram de ficar transparentes (uma aparecia dentro
  da outra): agora um véu branco por filtro (`invert` + `brightness` + `invert`) as clareia e elas continuam opacas. A
  peça do centro cabe com o nome embaixo numa tela de notebook (altura limitada pela janela, nome logo abaixo da sombra).
- **Fotos carregando:** sem a prévia borrada (`blur_data_url` não é mais usado). Enquanto a foto não chega, a caixa
  mostra um tom claro com brilho lento, e a foto entra com fade (`ApiImage` marca `data-img`; o `BootScript` marca
  `data-loaded`; bloco 12g de `motion.css`). Foto que já estava no cache entra sem animar.
- **Cortina das coleções:** só abre com a foto pronta (espera carregar e decodificar, até 2,5 s); a foto começa a baixar
  600 px antes de entrar na tela.
- **Fábrica na home:** o "tranco" da foto fixa vinha da revelação ao rolar aplicada na faixa inteira (o `transform`
  mudava a referência do `position: fixed`). A revelação ficou só no texto.
- **Tabela técnica:** as fotos do hover (até 4) saem empilhadas e se abrem lado a lado; clicar em qualquer lugar da
  linha abre a peça (`RowLinks`); categoria, linha (Franccino Casa/Giardini) e designer são links próprios.
- **Corporativo → projeto:** a foto passava do tamanho do banner e depois "pulava". Causa: o `object-fit: cover` da
  camada do movimento não era recortado; `motion.css` recorta o par (`overflow: clip`).
- **Cadeira Toé cortada:** no palco da peça, a foto em pé (4:5, coleção TEMPO) ignorava a altura do quadro 4:3 e
  transbordava. A foto agora ocupa o quadro por posição absoluta (`product.css`). Vale para todas as fotos em pé.
- **Fotos repetidas na galeria:** a API não manda na galeria um arquivo igual ao da capa (mesmos bytes e tipo;
  `docs/api.md`). Entre as 15 peças do carrossel, afetava Toé, Sopro, Orvalho, Terezinha, Royale e Buffet Heritage.
- **Capa da Toé:** nova lista de capas `api/database/data/covers/2026-11-07-diagonal-esquerda-3.json` (foto 1972, marrom,
  na diagonal para a esquerda), aplicada no deploy. O recorte do carrossel precisa acompanhar: ver a seção 23 (o arquivo
  não fica no repositório).
- **Recortes das outras 14 peças:** a borda está limpa (conferido sobre fundo escuro). O "embaçado em volta" vinha do
  estilo antigo do carrossel (transparência, filtros e degradê) e da resolução das fontes: os recortes da TEMPO têm de
  600 a 1000 px e o carrossel mostra a peça do centro com até 520 px (1040 px em tela retina). Fica nítido só com as
  fotos originais em alta.
- **Rolagem:** não entrou rolagem suavizada por script (seria dependência nova, como Lenis, ou código que briga com o
  trackpad). O que deixava a rolagem estranha era a foto da Fábrica, as fotos aparecendo de uma vez e a cortina sobre o
  tom de carregamento, corrigidos acima.
- **Verificação:** lint, typecheck e 415 testes do site. API: testes novos em `ProductShowTest` e `CoversTest` (rodar no
  CI: nesta máquina o PHP é 8.3 e o Composer não termina a instalação).

### 22.1 Depois do merge na `main`

1. Conferir o deploy da API e do site. O entrypoint troca a capa da Toé na primeira subida (o recorte, seção 23).
2. Diagonal para a esquerda: além da Toé, Sofá Antônio e Sofá Royale continuam sem foto na diagonal (seção 21.4);
   precisam de foto nova da Franccino.

## 23. 07 e 08/11/2026: conteúdo do site antigo, ambientes nos projetos, importação em massa e capas

Mesma branch (`claude/francine-site-review-htegfp`). **O push foi recusado (403):** o app do Claude não tem acesso ao
`PPP-Group/Franccino` nesta conta. Os commits estão só na sessão até o acesso ser liberado (claude.ai → conectar o
GitHub, ou um dono da organização instala o app do Claude no repositório).

- **Extração do site antigo (o que faltou na P5b T4):** o importador nunca lia a frase de destaque nem a descrição das
  peças (ficam em blocos de texto do Elementor, não na API REST do WordPress). Corrigido em
  `ProductPageParser::texts()` e no `WordPressImporter`. A extração de 07/11 está em
  `api/database/data/wordpress/2026-11-07-site-antigo.json`, aplicada no deploy por `franccino:content:apply` (uma vez;
  só preenche o que está vazio; baixa as fotos de franccino.com.br na hora):
  - frase e descrição de 377 das 400 peças (23 não têm texto no site antigo);
  - foto de 13 lojas (Porto Alegre não existe no preview; as 10 revendas sem foto no site antigo também não);
  - galeria dos 3 projetos do Corporativo (Clara Arte +3, Boa Vista +1, Kûara +2) e os logos de 6 clientes (Cyrela e
    Botânico Shopping não têm logo no site antigo);
  - Fábrica: bloco Vídeo ("Conheça a Franccino", YouTube, com a capa do site antigo) e galeria com as fotos
    institucionais e a fachada;
  - ambiente de teste com pontos no Fazenda Boa Vista (espreguiçadeira → Chaise Madri; poltrona de madeira → Poltrona
    Derby; as peças exatas da foto não estão no catálogo).
- **Ambiente ligado a projeto:** migration `2026_11_07_100000_add_project_id_to_scenes_table`; campo "Projeto" no
  Ambiente (painel); `ProjectCard.scene` em `GET /projects` e `GET /projects/{slug}`; `GET /scenes` só traz os sem
  projeto (`docs/api.md`, `docs/data-model.md`). No site: pontos sobre a foto da faixa do Corporativo (acompanham o
  recorte 3:2 e o zoom do hover; `ScenePoints`, `coverPoint`) e a seção "Peças no ambiente" na página do projeto.
- **Importação em massa (`/api/import/*`):** fotos (capa, galeria, foto sem fundo de peça; capa e galeria de projeto;
  foto de loja; logo; foto de ambiente) e listas de capas ou de conteúdo, por `curl`, sem painel e sem passar pelo
  repositório. Desligada sem `CONTENT_IMPORT_TOKEN` na API. Uso em `design/recortes/LEIA-ME.md`; contrato em
  `docs/api.md`. É o caminho para a auditoria do Drive: baixar as pastas e enviar com o laço do LEIA-ME.
- **Recorte da Toé:** saiu do repositório (regra de mídia), junto com o comando de recortes. O script que gera o recorte
  (rembg + borda refinada no fundo branco) está em `design/recortes/recortar.py`; depois do deploy, gerar da foto 1972 e
  enviar como `cutout` pela importação.
- **Capas na diagonal para a esquerda:** revisadas as 197 peças fora das listas de 06/11 (139 têm outra foto além da
  capa). Entraram na lista de 07/11: Aparador Hera, Balanço Dome, Cadeira Arp e Mesa de centro Noá Quadrada, além da
  Toé. As demais já estão na diagonal para a esquerda ou não têm essa foto (Sofá Antônio, Sofá Royale, Poltrona Costa,
  Banco Adhara, Banco Julia, entre outras: precisam de foto nova).
- **Volta do projeto para o Corporativo:** a foto pousava e "piscava" (trocava de versão com o fade de carregamento) e a
  faixa estava 20 px abaixo, invisível, até o observador marcá-la. Agora a volta já começa com os blocos à vista
  (`data-reveal-instant` no `popstate`), a foto do movimento não refaz o fade e, nas fotos recortadas, só a de destino
  aparece durante o movimento (sem imagem dupla). Conferido em vídeo, ida e volta.
- **Paralaxe:** só na home: blocos Casa e Giardini, peça em destaque, mosaico de projetos e o texto da faixa da Fábrica
  (e em `/pt/ideias`, ideia 04). Não há paralaxe nas páginas de peça.
- **Verificação:** lint, typecheck, 418 testes e build do site; pontos e volta conferidos num `next dev` contra a API do
  preview, com o ambiente injetado por um proxy local. API: testes novos (`LegacyContentTest`, `ImportTest`,
  `ScenesTest`, `ProductPageParserTest`), só no CI (PHP 8.3 aqui e o Composer não instala).

### 23.1 Depois do merge na `main`

1. Deploy da API e do site. Nos logs da API, a tabela do `franccino:content:apply` mostra o que foi preenchido.
2. Preencher `CONTENT_IMPORT_TOKEN` na API (só letras e números), redeploy, e enviar o recorte da Toé
   (`design/recortes/LEIA-ME.md`). Depois dos lotes, apagar a variável.
3. Conferir no preview: Corporativo → Fazenda Boa Vista (pontos na faixa e na página), Lojas (fotos), Fábrica (vídeo e
   galeria), uma peça sem descrição antes (ex.: Mesa Joey).

## 24. 08/11/2026: depois do deploy, retorno do tech lead e o que faltava do site antigo

PRs #71 e #72 mergeados (`develop` e `main`) e o deploy conferido de fora: textos das peças, lojas, Boa Vista, logos,
Fábrica e capas no preview. Com o `CONTENT_IMPORT_TOKEN` (guardado como segredo de rede da sessão, ninguém vê o valor),
os recortes do carrossel foram refeitos e enviados pela importação: as 15 peças de lançamento e mais 59 peças dos
carrosséis das coleções e dos designers, que agora seguem o padrão da home (peças juntas, com o véu).

- **Versões misturadas e serviço cinza no EasyPanel:** de fora, a API e o site passam no teste de saúde e o site devolve
  sempre a mesma versão (16 de 16). A mistura aparece na janela do deploy (o site compila ao iniciar, e o container
  antigo responde até o novo ficar pronto) e em abas abertas com o JavaScript antigo: recarregar a página depois do
  deploy. O cinza no EasyPanel não deu para ver daqui; se continuar, mandar o texto do status do serviço.
- **Corrigido no site:**
  - grade em branco ao voltar da tabela técnica (o observador da revelação não via a grade nova; agora revisa a página
    a cada mudança e revela assim que qualquer parte entra na tela);
  - Toé cortada nas miniaturas ("peça em destaque" e fotos do hover da tabela): foto em pé por posição absoluta;
  - paralaxe forte o bastante para ver (8% da altura da foto) e também nas faixas de coleções da home;
  - borda do "O" do logo; sublinhado do seletor de idioma só embaixo do "EN";
  - sala para montar: a planta salva troca as fotos pelas atuais do catálogo (as antigas tinham sumido com a troca de capas);
  - tabela técnica: peças com medida primeiro;
  - lista de orçamento: faixa areia com as peças vistas e as recomendadas;
  - rodapé: selo "uma solução Vortex" (desenho do `endosso-negativo.svg` do repositório app-vtx-tap).
- **Foto que cresce e encaixa:** agora também na miniatura da tabela técnica, no cartão dos pontos do ambiente, no caminho
  (breadcrumb) da peça para a categoria e em todo retrato de designer (lista, home, coleção e página da peça) até a página
  do designer. No preview atual as transições medidas rodaram inteiras (uma por navegação, ~800 ms); o "às vezes não
  funciona" coincidiu com as versões misturadas do deploy.
- **Inglês:** 317 peças mostravam o texto em português no `/en`. Tradução por máquina (OpenNMT/Argos, rodada fora do
  servidor) com os nomes das peças e um glossário protegidos, em `api/database/data/translations/en-2026-11-08-produtos.json`
  (`reviewed: false`, como o arquivo anterior); rota nova `POST /api/import/translations` para aplicar sem esperar deploy.
- **Site antigo, segunda parte** (`api/database/data/wordpress/2026-11-08-site-antigo-2.json`, aplicada no deploy):
  - as 10 lojas e revendas que faltavam (Porto Alegre, Móveis Modernos, Hanna Decor, Espaço Fátima Lima, Casa TMG,
    Armazém 401, Casal Design, Paux, Forma e Conforto, Franttone), com endereço, contato e posição no mapa;
  - 4 fotos de ateliê da home antiga (2560 px) na galeria da Fábrica;
  - as fotos das coleções no site antigo são as miniaturas das peças e o banner, que o preview já tem; as fotos de
    ambiente residencial ficaram de fora (o Corporativo não tem mais Residencial).
- **Scroll suave:** descartado pelo tech lead.
- **Publicado (08/11, 22h30 UTC):** PRs #73 e #74 mergeados; no preview, 22 lojas no mapa, 7 fotos na galeria da
  Fábrica e o inglês das peças aplicado pela rota `POST /api/import/translations` (amostra de 40 peças no `/en`: nenhuma
  volta para o português).

## 25. 09/11/2026: retorno do tech lead sobre o preview de 08/11

Mesma branch (`claude/francine-site-review-htegfp`). Cada item conferido num `next dev` local contra a API do preview,
com Playwright (medidas, capturas e quadros da transição).

- **Paralaxe:** funcionava no Chrome, mas a foto andava só 8% da altura na passagem inteira (quase imperceptível), e no
  Safari sem `animation-timeline` dependia de um script que só existia na home. Agora o componente `Parallax` (script,
  todos os navegadores) escreve `--parallax-shift` em cada bloco: a foto anda 14% da altura em cada sentido (escala 1.3)
  e o texto 80 px no sentido oposto. A peça em destaque anda menos (foto de estúdio, 5%).
- **Capa da Tempo cortada na home:** era a escala da paralaxe nas faixas das coleções (a arte tem texto). As coleções
  saíram da paralaxe.
- **Grade em branco ao voltar da tabela técnica (Casa):** o nó da grade voltava sem a classe `is-revealed` e ficava
  fora da observação. O `RevealObserver` observa de novo qualquer bloco sem a classe (também quando o `class` muda).
- **Foto que cresce e encaixa em todo lugar:** peça em destaque (projeto, Corporativo, Designers, Lançamentos), sugestões
  da busca do cabeçalho (peça, designer e coleção), miniaturas da lista de orçamento e da área de downloads.
- **Carrossel → página da peça (o "tranco" no fim):** a página da peça mostrava a peça sem fundo do carrossel como foto
  provisória e trocava pela foto real (com margem branca) só no fim. Agora o par usa o encaixe `cutout`: a página usa a
  própria foto (o carrossel a baixa quando o mouse passa pela peça) e as duas se misturam do começo ao fim.
- **Caminho (breadcrumb) da peça para a categoria:** anima quando a peça está na primeira página da categoria. Se a peça
  está numa página seguinte da lista, não há foto de destino na tela, e a troca é sem movimento.
- **Banner da home:** a troca não pausa mais com o mouse em cima (o banner ocupa a tela toda; era por isso que "às vezes
  não trocava"); 6 s por slide, aproximação de 8% no mesmo tempo; no lugar do traço embaixo do título, uma barra por
  slide que enche no tempo dele (clicar leva ao slide).
- **Clientes (Corporativo e Projetos):** faixa em loop contínuo, para no hover; logos em preto e branco com a cor no
  hover, todas com o mesmo peso visual (`logoBox`). As 6 logos foram recortadas (sem fundo nem margem; a da Clara, que
  era clara em fundo verde, ficou verde) e reenviadas pela importação. Cyrela e Botânico Shopping seguem sem logo (nome).
- **Selo Vortex:** a regra `.site-footer a` (inline-block) deixava o selo no topo da área de toque; agora alinhado.
- **Lojas na home:** as lojas mostram a foto também ali.
- **Fábrica:** o vídeo com capa não mostra mais o nosso botão de play (a capa já tem o desenho).
- **"+" no card:** no hover, o "+" no canto da foto põe a peça na lista sem abrir a página. Ao adicionar (card, tabela,
  destaque ou página da peça), a foto vira um quadradinho que voa até o ícone da lista, que pulsa quando ela chega
  (`lib/ui/fly-to-quote.ts`).
- **Etiqueta "Lançamentos":** fica como está (o tech lead acha que não precisa voltar).

## 26. 09/11/2026 (tarde): segundo retorno do dia

- **Busca do cabeçalho como a tabela técnica:** cada peça sugerida mostra foto, nome e categoria, linha, designer e
  medida, e as fotos se abrem ao lado do ponteiro no hover (`RowPeek` passou a servir à lista da busca). A ação da
  busca pede o detalhe das peças sugeridas; sem ele, a linha sai só com foto e nome. O clique faz a foto crescer: a lista
  some no mesmo quadro em que a página nova entra (o cabeçalho não desmonta, e sem isso não havia foto de origem).
- **Esteiras ("Peças que você viu", "Recomendadas", da mesma linha, relacionadas, do designer, carrossel e ambiente):**
  cada uma com o próprio nome na transição (`ProductRail scope`, `ProductPlate morphScope`). A mesma peça em duas
  esteiras dava dois nomes iguais, e a transição falhava na ida (na volta funcionava).
- **Sala para montar:** a foto e o nome de cada peça da biblioteca abrem a página da peça, com a foto que cresce; o "+"
  continua pondo na planta. **Lista de orçamento:** o nome também abre a peça com a foto que cresce.
- **Coleções e designers no mesmo formato:** carrossel (quando cabe) e, embaixo, grade e tabela técnica com a barra do
  catálogo (`PiecesSection`, troca no navegador; as páginas seguem estáticas). Na Avito, por exemplo, só havia o
  carrossel. Lançamento já tinha a barra.
- **Designer na coleção:** retrato com no máximo 168 px, mesmo sozinho (ocupava a coluna e deixava o texto com vão).
- **Coleções (índice):** sem a faixa branca entre a última linha e o rodapé.
- **Banner das páginas pelo menu:** sobe de leve e encaixa com fade (650 ms) quando a página abre sem a foto que cresce
  (`is-arriving` no `MorphImage` de destino).
- **Favicon:** F da logo em preto num quadrado branco de cantos arredondados (`src/app/icon.svg`, `favicon.ico`,
  `apple-icon.png`).
- **Volta da página da peça com outra foto:** a foto do palco é sempre a da transição; trocada a foto na galeria, a volta
  encolhe a foto que está à vista até o card (sair e voltar de novo mostra a capa).
- **Capas na diagonal para a esquerda, segunda revisão:** "virada para a esquerda" = a frente da peça voltada para a
  esquerda da foto (o encosto fica à direita; nas mesas, bancos e aparadores, a ponta direita mais perto). A revisão a olho
  em miniatura errava o lado. Lista `api/database/data/covers/2026-11-09-diagonal-esquerda-4.json` (11 peças: cadeiras
  com a vista de trás como capa, viradas para a direita e mesas de frente), aplicada no deploy; a capa antiga passa a ficar
  na galeria (`franccino:covers:apply`). A medida automática da direção serve nas cadeiras (lado do encosto), mas
  erra nas peças compridas (a sombra no chão engana o lado do pé mais perto): nelas, só a conferência a olho vale.
  Espelhadas pela importação, com o ok do tech lead e a foto original na galeria: Mesa lateral Petra, Rack Coda e
  Poltrona Tereré. Banco Hera, Mesa de jantar Minas, Sofá Mumbai e Sofá Snodo chegaram a ser espelhados por engano da
  medida (já estavam virados para a esquerda) e voltaram à capa original no mesmo dia. Sem foto para a esquerda e
  assimétricas (o espelho mostraria uma configuração que não existe), à espera de foto nova da Franccino: Mesa de centro
  Kit, Buffet Bloco e Sofá Nu.
- **Troca de página nas listas:** "Anterior" e "Próxima" também na barra de cima, lado a lado logo depois da contagem
  (`Pagination position="top"`); a lista nova entra peça por peça (a seção remonta pela página) e, quando o clique foi
  na paginação de baixo, a página rola suave até o começo da lista (`PageScroll`, `[data-page-anchor]`). Vale no
  catálogo e nos downloads.
- **Filtro sem recarregar:** "Aplicar" (designer no catálogo; linha, busca e área nos downloads) troca só a lista, pelo
  roteador e sem rolar (`FilterForm`); a lista remonta e as peças entram de novo com a revelação. Sem JavaScript, o
  formulário GET continua funcionando.
- **"Peças que você viu" no catálogo:** o mesmo respiro em cima e embaixo (saiu a regra que zerava o de cima).
- **"Outros projetos", "Outras coleções" e "Outros designers":** a foto cresce até o topo da página aberta e volta
  (`CardRail` com `morph`).
- **Troca de foto na página da peça:** fade cruzado; a foto anterior fica por cima e some quando a nova carrega
  (`gallery__leaving` no `ProductStage`), sem desmontar a foto da transição de abrir e voltar.
- **Filtro de designer:** ao passar o mouse num nome da lista aberta, o retrato do designer flutua ao lado da lista
  (em preto e branco, como nas páginas de designer), como as fotos da tabela técnica (`SelectOption.image`,
  `RowPeek beside`).
- **Faixa da Fábrica na home → página da Fábrica:** a foto cresce até o banner e volta (`morphName('page', 'factory')`).
  Durante a transição a foto da faixa deixa de ser fixa (`:active-view-transition`), para o movimento partir do recorte
  à vista.
- **Logo:** recarrega a página inicial e abre no topo, sempre (link comum, `data-no-motion`), sem a foto que volta.
- **Banner da home com fotos dos projetos:** a importação aceita `target=banner` (`key` = posição no carrossel, 1 a n).
  Depois do deploy, as três fotos (Clara Arte 2042, Kûara 2046 e Boa Vista 1721, todas com 2560 px) entram nos três
  banners por ela.

### 26.0 Complemento (09/11, noite)

- **Painel:** favicon com o F claro no fundo escuro, o contrário do site (`api/public/favicon-panel.svg`, `favicon.ico`,
  `->favicon()` no `AdminPanelProvider`).
- **Lojas na home:** cada loja ganhou o "Ver no mapa", como na página Lojas.
- **Tabela técnica nas listas:** as fotos do hover saíam longe do ponteiro (no topo e no fim da página). A animação de
  entrada da lista ficava presa no fim (`both`) e o `transform` dela virava a referência do `position: fixed` da prévia;
  agora a animação não fica depois do fim (`backwards`). Na home e na busca já funcionava (sem essa animação).
- **Carrossel nas coleções e designers grandes:** a Tempo (15 peças) ficava sem carrossel, que ia só até 12. Agora aparece
  a partir de 2 peças e mostra até 24 (`carouselPieces`); a grade embaixo continua com todas.

### 26.1 Deploy de 09/11: duas versões do site no ar

Depois do merge do #76, o preview passou a servir duas versões do site ao mesmo tempo: o mesmo arquivo de script responde
200 num minuto e 404 no seguinte (mesmo `buildId`, pedaços diferentes). Uma página de uma versão pede scripts da outra, a
parte interativa não carrega (banner parado, sem as barras) e às vezes aparece a tela "Algo deu errado". A causa está no
EasyPanel (dois containers do serviço do site respondendo pelo mesmo domínio), não no código. Paliativo no site: ao
falhar o carregamento de um script, a página recarrega uma vez (`lib/ui/chunk-reload.ts`, nas telas de erro).

### 26.2 Próximo passo: auditoria do Drive (pedido do tech lead, para quando o resto terminar)

Usar a planilha "Auditoria_Drive_Site_Franccino.xlsx" (532 arquivos, 518 "Usar"). Caminho combinado em 08/11: o tech lead
gera um token de acesso só de leitura do Drive no OAuth Playground do Google (`drive.readonly`, vale cerca de 1 hora) e o
entrega pelo formulário seguro da sessão (`request_credential`, host `www.googleapis.com`); a sessão baixa os arquivos
marcados "Usar" e envia pela importação em massa (`design/recortes/LEIA-ME.md`), sem passar pelo repositório nem pelo painel.

## 27. 12/11/2026: revisão da Franccino ("Revisão Novo website", 29 itens)

Branch `claude/banner-cover-images-vcdpmb`, PR #80 para a `develop`. Decisões tomadas por padrão (o tech lead pode
mudar): menu "Produtos" com as abas Área interna e Área externa em cima (exemplo 2 do PDF); "Ver mais" traz 24 peças
por vez, 3 vezes, e depois um link para a página seguinte; todo download pede o cadastro.

- **Bloco 1 (visual e textos):** paralaxe removida do site inteiro; carrossel mais arrumado (círculo de arrastar menor,
  a peça do centro sempre a maior, peças largas e altas na mesma medida visual); categorias do menu em ordem
  alfabética com "Ver todos"; "Lista de desejos" (ícone de sacola) e envio "por e-mail à equipe de vendas" ou pelo
  WhatsApp; o cabeçalho some ao rolar para baixo e volta ao subir; botão "Topo" no rodapé; Área do Profissional
  (`/pt/area-do-profissional`, com 301 do `/pt/downloads`); designers sem a peça em destaque, retrato colorido no
  hover; logos dos clientes no mesmo peso; títulos das páginas legais sem repetição.
- **Bloco 2:** menu Produtos (Área interna e externa); "Ver mais" na grade (a tabela técnica continua paginada);
  peça em destaque escolhida no painel em cada página (Páginas → "Peça em destaque"; migration
  `2026_11_12_100000`), sem a peça automática; páginas novas **Tire suas dúvidas** (`/pt/tire-suas-duvidas`) e **Seja um
  parceiro** (`/pt/seja-um-parceiro`, formulário de parceria), com o texto pelo painel (migration `2026_11_12_110000`);
  banner de campanha: com um banner no período (`starts_at`/`ends_at`), só ele aparece, e o agendador revalida o site
  no início e no fim.
- **Bloco 3:**
  - **Cadastro antes do download** (Boca do Lobo): perfil, nome, sobrenome, e-mail, interesse e telefone opcionais,
    aceite da privacidade. O navegador guarda o token; sem ele, a API recusa o link (`422`). Tabela
    `download_leads` (retenção de 730 dias, `RETENTION_DOWNLOAD_LEADS_DAYS`); no painel, "Quem baixou" e "Perfil" no
    registro de downloads.
  - **"Integre ao seu projeto"** na peça: um botão por programa (SketchUp `.skp` e Revit `.rfa` como "Bloco 3D",
    AutoCAD `.dwg`/`.dxf` como "Bloco 2D", em Arquivos da peça) e o caminho para a Área do Profissional.
  - **Medidas com intervalo** (largura, profundidade e altura "até", no painel) e setas por medida.
  - **Ambientes** (Produtos → Geral → Ambientes) e o filtro "Ambiente" no catálogo (some enquanto nenhuma peça tiver
    ambiente).
  - **Variações** (Produtos → Geral → Variações): ligar numa peça mostra nas duas.
  - **Vista de cima** (Produtos → Mídia e 3D): na sala para montar, entra no lugar da foto.
  - Migrations `2026_11_12_120000` e `2026_11_12_130000`; `docs/api.md` e `docs/data-model.md` atualizados.
- **Bloco 4 (prontos para ligar, dependem das contas):** GA4 pelo Tag Manager; AdOpt pelo modelo dela no Tag Manager,
  ligada com `NEXT_PUBLIC_CONSENT_PROVIDER=adopt` (o aviso do site some e o Consent Mode nasce negado); newsletter:
  exportação do painel até confirmar a ferramenta (Zoho?) e a chave; saúde do site com UptimeRobot. Passo a passo em
  `docs/runbook-deploy.md`, seção "Cookies, Analytics, marketing e monitoramento".
- **Verificação:** site com lint, typecheck e 443 testes; API com Pint (Pest e Larastan só no CI: PHP 8.3 aqui).

### 27.1 Pendências

- Da Franccino: o conteúdo das páginas Tire suas dúvidas e Seja um parceiro; ambientes, variações e vistas de cima
  das peças; os arquivos de bloco por programa; as contas do Tag Manager, GA4 e AdOpt; confirmar a ferramenta de
  marketing; o slogan; quem decide o lugar das abas do menu e a grade dos designers (Marcelo); o que é a "Coleção
  Franccino".
- Do tech lead: rodar `php artisan migrate` (vai no deploy) e conferir o cadastro do download no preview.
- A auditoria do Drive continua à espera do link das pastas (seção 26.2).

## 28. 12/11/2026 (tarde): segundo retorno do dia e o que faltava do PDF

Branch `claude/banner-cover-images-vcdpmb`, recriada da `develop` depois do merge do #80 e do #81.

- **PDF, o que tinha ficado para trás:**
  - **Slogan (item 1):** o banner sem texto no painel mostra "Feito para permanecer" (a primeira opção do PDF), com
    "Móveis de design autoral" na linha de apoio. O título e a linha de cada banner continuam editáveis em Banners.
  - **Corporativo na home (item 4):** todos os nomes no mesmo tamanho e à mesma distância da borda de baixo.
  - **Ambientes (item 8):** a lista do PDF (Varanda e jardim, Sala de jantar, Living, Quarto, Escritório). Ainda não
    havia peça com ambiente, então nada mudou de dado.
  - "Adicionar ao orçamento" que tinha sobrado virou "Adicionar à lista de desejos".
- **Carrosséis:** dão a volta (a partir de 3 peças), começam na primeira peça no centro e andam sozinhos (4,5 s por
  peça; param com o mouse em cima, com o foco do teclado e fora da tela). A volta da página da peça cai na peça que
  estava no centro (guardada por página na sessão). O encaixe até a página da peça: a caixa do movimento no carrossel
  tem o tamanho da capa (com o recorte no meio) e, na página, a foto ocupa a caixa da proporção dela (`--stage-ratio`);
  o recorte vira a capa no primeiro terço e o resto é só a foto encaixando, sem fade no fim.
- **Filtros nas listagens:** categoria (com a foto de uma peça quando a categoria não tem capa), ambiente, coleção e
  designer, todos com a foto flutuando no hover. A barra presa no topo sobe e desce junto com o cabeçalho
  (`--header-offset`).
- **API:** o `GET /categories` mandava, a partir do segundo item, a forma do detalhe sem `product_count` (a coleção
  passava o índice como "detalhe"). Corrigido, com teste.
- **Animações:** a volta da peça aberta por um ponto do ambiente reabre o cartão do ponto e a foto encolhe até ele;
  durante a foto que cresce nenhuma foto mostra o tom bege de carregamento; o cabeçalho tem camada própria no movimento e
  fica sempre por cima; as duas primeiras coleções também abrem em cortina; o texto do banner que se repete nos slides
  entra uma vez só.
- **Projeto:** "Peça em destaque" no painel (Projetos), migration `2026_11_12_140000`. Sem escolha, a primeira peça dos
  pontos do ambiente ou a primeira do projeto (nunca uma peça de fora). Tamanho compacto, como nas outras páginas.
- **Conteúdo:**
  - Política de cookies e "Tire suas dúvidas" com texto inicial (migration `2026_11_12_150000`, só onde a página estava
    vazia; a Franccino revisa no painel). O FAQ não promete prazo, preço nem garantia.
  - Aviso de cookies sempre na primeira visita: Aceitar todos, Recusar e Personalizar (necessários, análise,
    marketing), com "Preferências de cookies" no rodapé. A versão da política mudou, então todos veem o aviso de novo.
  - Mapa do site em ordem alfabética (seções e itens), com as categorias de cada área.
  - Favicon do painel: o endereço saía com `http://` numa página `https://` e o navegador bloqueava.
  - "Ver no mapa" nas lojas da home: estava dentro do bloco que só aparece na página Lojas.
  - Setas das medidas com 16 px (a regra do desenho as deixava com 360 px).
- **Lista de desejos por link:** `POST /quote-lists` e `GET /quote-lists/{code}` (migration `2026_11_12_160000`,
  tabela `quote_lists`, validade `QUOTE_LIST_DAYS`, padrão 90 dias). O WhatsApp manda um link curto
  (`/pt/lista/{código}`) no lugar das linhas; "Copiar link da lista"; o pedido por e-mail guarda a lista com a mensagem
  e o e-mail da equipe leva o botão "Ver a lista com as fotos". A página da lista mostra foto, quantidade, acabamentos e
  observação, com "Adicionar à minha lista". No painel: Relacionamento → Listas de desejos.

### 28.1 Depois do deploy

- As migrations rodam no deploy. Conferir no painel: Projetos → Peça em destaque; Páginas → Política de cookies e
  Tire suas dúvidas (revisar o texto); Relacionamento → Listas de desejos.
- Marcar ambientes nas peças (Produtos → Geral → Ambientes) para o filtro aparecer.

## 29. 12/11/2026 (noite): auditoria do Drive pronta para enviar

Pedido do Pedro Ivo: subir o que a auditoria do Drive marcou como "Usar", principalmente os blocos 3D e 2D (a
Franccino pergunta todo dia). Branch `claude/banner-cover-images-vcdpmb`.

- **API:** `POST /api/import/files` grava um arquivo técnico (bloco 3D/2D, ficha, catálogo) de peça, designer ou
  lançamento, publicado, no disco privado; o mesmo nome de arquivo no mesmo dono troca o arquivo. `/api/import/media`
  ganhou os destinos `designer`, `collection`, `launch` e `page` (galeria da Fábrica) e ignora a mesma `source` de novo.
  O limite do arquivo técnico subiu de 50 para 200 MB (o bloco da Poltrona Noa tem 188 MB), com o PHP em 210M.
- **Site:** "Integre ao seu projeto" agrupa por programa; com várias versões (o Sofá Noa tem 15 blocos SketchUp), o
  nome do programa fica em cima e cada botão mostra a versão.
- **Lote:** `design/drive/2026-11-12-auditoria.json` (255 arquivos: 53 blocos de 12 peças, 83 fotos de galeria de
  peça, 56 da Fábrica, 46 de projetos e 17 de coleções) e `design/drive/importar.py`, que baixa do Drive e envia.
  O que ficou fora do lote e por quê: `design/drive/LEIA-ME.md`.
- **Não enviado ainda:** a sessão não tem os tokens do Drive nem da importação, e token não se cola no chat.

### 29.1 Para rodar o envio

1. Merge do PR na `develop` e na `main`, e o deploy (a rota nova e o limite de 200 MB precisam estar no ar).
2. Gerar o token do Drive no OAuth Playground (`drive.readonly`, passo a passo em `design/drive/LEIA-ME.md`) e pôr
   `GOOGLE_DRIVE_TOKEN` e `CONTENT_IMPORT_TOKEN` nas configurações do ambiente da sessão. Abrir uma sessão nova e pedir
   para rodar `design/drive/importar.py`: primeiro `--so files` (os blocos), depois `--so media`.

### 29.2 13/11/2026: o envio feito e o que ficou para a Franccino

Com os tokens no ambiente da sessão (`GOOGLE_DRIVE_TOKEN` e `CONTENT_IMPORT_TOKEN`), o lote foi enviado ao preview:

- **Blocos:** os 53 blocos 3D e 2D (12 peças das linhas ARP, Adhara e Noa).
- **Fotos do lote:** as 202. As 56 da Fábrica em HEIC passaram pelo Pillow com `pillow-heif` (o ImageMagick da sessão não lê o
  HEIC do iPhone); `importar.py` usa o Pillow quando ele está instalado.
- **Decisões do tech lead (13/11):**
  - as imagens com cara de IA sobem;
  - no Clara Arte, só as versões editadas (`replaces` troca a foto e mantém a posição);
  - os 48 trechos brutos de vídeo ficam de fora.
- **PRs #86 e #87:**
  - vídeo em projeto e coleção (`video` e `video_poster`);
  - filme como bloco Vídeo de página;
  - galeria com legenda na página;
  - assinatura (logo) do designer;
  - `new_products` no `content:apply`, com a lista `2026-11-13-drive.json`: 11 peças do site antigo, publicadas com
    área e categoria deduzidas, e o texto do Clara Arte.
- **Também no preview:**
  - os filmes do Clara Arte (60 MB) e do Manifesto TEMPO (46 MB);
  - o filme novo da marcenaria (86 MB), que não é o do YouTube; os dois ficam na Fábrica;
  - na Fábrica, as galerias "Peças em produção" (12 fotos) e "Lojas e ambientes" (11) e a foto dos sócios;
  - 6 RAW da Mesa Polux;
  - 4 imagens de IA da Mesa Joey e da Poltrona Pinot;
  - a Pitá sem braço cinza (das 23 "outro ângulo", 22 já estavam no site, na versão certa da peça);
  - as 12 assinaturas dos designers, recortadas das faixas do site antigo.
- **Correção de 13/11:** o upload de MP4 em projeto e coleção dava 500. A conversão `lqip` (síncrona) tentava tirar um
  quadro do vídeo. `HasImageConversions` não gera tamanhos para vídeo.
- **PDF para a Franccino**, entregue ao Pedro Ivo (não está no repositório):
  - 36 peças novas, a cadastrar com os dados deles;
  - o que falta nas 11 peças do site antigo;
  - 7 fotos de peça sem dono nas pastas dos designers;
  - os catálogos do Clara Arte;
  - os pedidos de lojas do texto do Clara Arte;
  - o filme novo no YouTube.

## 30. 13/11/2026: retorno do tech lead sobre o preview (16 pontos)

PRs [#90](https://github.com/PPP-Group/Franccino/pull/90) (para a `develop`) e [#91](https://github.com/PPP-Group/Franccino/pull/91)
(para a `main`). Branch `claude/banner-cover-images-vcdpmb`.

- **Grade e tabela técnica:** a troca é no navegador, sem ir ao servidor (antes, às vezes recarregava, mais com filtro).
  A página já vem com as duas vistas; o endereço muda por `history.replaceState` (`ViewToggle`, `CatalogViewProvider`,
  `ByView`). Vale no catálogo e nos lançamentos.
- **Galerias:** no projeto e na Fábrica, as primeiras fotos e "Ver mais"; aberta, o "Ver menos" fica preso ao pé da tela
  (`ShowMore`). Na coleção, as peças vêm logo depois da introdução; embaixo do texto, 3 miniaturas e "Ver imagens", que
  abre a galeria inteira numa janela (`GalleryDialog`); o vídeo vai para depois das peças.
- **FAQ** no desenho do site (perguntas numeradas, "Ainda com dúvidas?" ao lado). **Cookies:** um link só no rodapé; as
  preferências ficam dentro da página Política de cookies (migration `2026_11_13_100000` troca a frase do texto).
- **Área do Profissional:** o layout da tabela técnica (fotos no hover, foto que cresce, "+"); na peça, o link leva à
  Área do Profissional já filtrada por ela; várias versões no mesmo formato viram um link só ("SKP (15 versões)").
- **Filtros:** a foto do hover na proporção dela (coleção deitada, retrato em pé). **Retrato do designer:** sem o fundo
  bege no destino da animação.
- **Medidas:** 81 peças com a medida do site antigo (`api/database/data/wordpress/2026-11-13-medidas.json`, aplicada no
  deploy; só preenche peça sem medida) e o campo "Diâmetro até" no painel. Continuam sem medida 19 peças que nem o site
  antigo tem (ex.: Sofá Noa, Sofá Antônio, Sofá Majestic, Sofá Pinot Square, Mesa de centro Noa redonda).
- **Sala para montar:** a peça sem medida aparece na busca, com "Medidas a confirmar", em vez de sumir (o Sofá Noa "não
  existia" por isso). Nenhuma peça tem vista de cima cadastrada ainda; o caminho no código está pronto.
- **Importação:** `POST /api/import/media/remove` tira fotos de um registro (`docs/api.md`). O limite da biblioteca de
  mídia subiu para 200 MB: era ele que dava 500 no envio dos filmes do Clara Arte e do Manifesto TEMPO.
- **Fotos em produto errado (do lote do Drive de 13/11):** a planilha ligava a pasta de uma peça a um produto só, e fotos
  de versões irmãs entraram no produto errado ("com braço" no "sem braço", Noa quadrada na redonda, Samburá individual no
  duplo, Barcelona sem encosto no com encosto e outras). Todas já existiam, iguais, no produto certo: saem do errado.
  Junto, as fotos repetidas dentro do mesmo produto e as 3 cópias antigas do começo da galeria do Clara Arte. São 70
  fotos em 25 registros (lista em `remover.json` na área temporária da sessão), removidas pela rota nova depois do deploy.
- **Capas:** revisadas as 338 peças com mais de uma foto. Só duas fugiam da regra: Mesa de cabeceira Xove (capa de
  perfil) e Sofá Dara Indoor (diagonal virada para a direita). Lista `api/database/data/covers/2026-11-13-diagonal-esquerda-5.json`.
- **Respostas de dados (sem mudança de código):**
  - arquivos com a mesma extensão numa peça são versões diferentes (tamanhos e configurações), não duplicados;
  - Estante Bloco e Sofá Pinot Square não têm foto no site antigo nem no Drive: despublicar ou pedir as fotos;
  - Acabamentos vazio: não há lista de acabamentos no Drive "Site Franccino" nem no site antigo (PPP-23);
  - o 3D da página da peça precisa de GLB. Os blocos SketchUp e AutoCAD não abrem no navegador, e converter formato
    está fora do escopo. Só a Cadeira Marcela tem GLB, e o "Produto de Teste" publicado no preview deve ser apagado.

### 30.1 Depois do deploy (13/11, conferido)

- No ar: os filmes do Clara Arte e do Manifesto TEMPO, as capas novas da Xove e do Sofá Dara Indoor e as medidas das 81
  peças (conferido pela API do preview).
- **Falta tirar as 70 fotos** (`design/drive/2026-11-13-remover.json`, comando em `design/drive/LEIA-ME.md`): a
  verificação de segurança da sessão bloqueou a remoção no preview. Roda com o ok do tech lead, numa máquina com o
  `CONTENT_IMPORT_TOKEN`, ou numa sessão com a permissão liberada.
- Apagar o "Produto de Teste" publicado no preview (painel).

### 30.2 13/11/2026 (tarde): remoções, Produto de Teste, blocos que faltavam, acabamentos e 3D

- **Remoções aprovadas e feitas:** as 70 fotos de `design/drive/2026-11-13-remover.json` saíram do preview.
- **Produto de Teste:** a migration `2026_11_13_110000_remove_test_product` o tira do ar no deploy. A exclusão é
  reversível (soft delete) e só pega a peça com esse nome e esse endereço.
- **Blocos que faltavam:** o Drive "Site Franccino" tem 410 blocos (250 SketchUp, 159 AutoCAD, 1 DXF), quase todos
  enviados em 16/10, e o lote de 12/11 levou só 53. Os outros estão em `design/drive/2026-11-13-blocos.json`: 324
  arquivos. A peça vem da planilha de dados dos produtos ("_DADOS DOS PRODUTOS EXTRAIDOS DO SITE"), e o com e sem braço
  se separa pelo código do nome do arquivo (C-BR, S-BR). A pasta "POLTRONA MAJESTIC" tem os 16 módulos do Sofá Majestic.
  Ficaram de fora 33 arquivos de peças que não estão no site e 3 da Melina Casa na pasta da Giardini. Enviados 323
  (conferidos pela API: os títulos no ar batem com a lista); o SketchUp do Balanço Pina (258 MB) passa do limite de 200 MB
  e foi pedido mais leve no PDF.
- **Acabamentos:** não há mostruário em nenhum dos 5.667 arquivos do Drive "Site Franccino", nem no outro Drive
  compartilhado. Os textos das peças só dizem "conforme mostruário Franccino". O pedido entrou no PDF para a Franccino.
- **3D:** o navegador não abre SketchUp nem AutoCAD. O SDK da Trimble não tem versão para Linux. A OpenSKP (MIT, lê
  SketchUp e exporta glTF) é a saída; instalá-la nesta sessão foi bloqueado pela verificação de segurança e precisa do
  ok do tech lead. O AutoCAD aqui é desenho 2D: não serve para o visualizador 3D.
- **PDF para a Franccino** ("O que precisamos para terminar o site", 13/11): reúne o PDF da manhã e todas as
  pendências com eles (acabamentos, medidas, fotos, blocos, peças novas, textos, dados dos filtros, Clara Arte, vídeos,
  contas e decisões). Entregue ao Pedro Ivo; não está no repositório.

### 30.3 13/11/2026 (noite): 3D a partir dos blocos SketchUp, página do projeto e sala

- **3D:** o OpenSKP foi instalado com o ok do tech lead. A importação aceita o GLB da peça (`collection=model_3d`, PR
  [#94](https://github.com/PPP-Group/Franccino/pull/94)). O processo está em `design/3d/LEIA-ME.md`.
  - A 1ª conversão (119 de 154 peças) saiu toda branca e não foi enviada. O conversor clareava as cores para um tom
    neutro, e o OpenSKP perdia o material dos componentes.
  - O conversor novo mantém a cor de cada material do arquivo, com a cor em linear, e o patch do OpenSKP lê o material
    do componente.
  - Conferido em 11 peças contra a miniatura que o próprio SketchUp grava no arquivo: Chaise Coce bege com alumínio e
    rodas pretas, Sofá Antonio cinza com base escura, Sofá Majestic com pés pretos.
  - Vários blocos da Franccino não têm material nenhum (Banco Dublin, Escrivaninha Pampulha, Mesa lateral Eros, Mesa de
    jantar Noa): no SketchUp eles também aparecem brancos. Nenhum dos arquivos conferidos tem textura.
  - **Falta:** rodar a conversão nova, que precisa de um token novo do Drive (o anterior expirou), e enviar os GLB.
- **Página do projeto:** o resumo aparecia em destaque mesmo quando o texto já o trazia no meio. No Clara Arte, ele é o
  3º parágrafo. Agora o resumo some sempre que o texto já o traz (`distinctLead`).
- **Sala para montar:** o código atual acha o Sofá Noa na busca ("Medidas a confirmar"), conferido num `next dev` contra
  a API do preview. Se o preview não mostra, a aba aberta está com a versão anterior do site: recarregar a página depois
  do deploy.

### 30.4 13/11/2026 (noite): 3D no ar, GLB para baixar, filtros e medidas

- **Conversão feita** com o token do Drive que o tech lead mandou na conversa: o valor salvo no ambiente continuava o
  antigo, e nem a sessão nem um subagente remoto conseguiam ler o novo. A cópia foi apagada no fim. Como o token também
  trazia o refresh token, com acesso ao Drive inteiro, o tech lead deve revogar o acesso do OAuth Playground na conta
  Google.
- **3D no preview:** 126 de 154 peças têm o modelo 3D (`model_3d`), com as cores e texturas do arquivo. As peças com
  textura (Aparador Xove, Banqueta Apruma, Cadeira Dara) pedem o Pillow no venv.
- **Não entraram:**
  - 7 blocos que o OpenSKP não abre, de formato antigo (Banco ARP, Banco Coda, Banqueta Júlia, Buffet Twin, Cadeira
    Lorena, Cadeira Páglia, Mesa de centro Irene);
  - 2 SketchUp acima de 150 MB (Balanço Pina, Poltrona Noa);
  - 8 GLB acima de 20 MB (Banqueta Dara, Cadeira Melina sem braço, Cadeira Noa, Poltrona Caeté, Poltrona Irani, Sofá
    Adhara, Sofá Snodo, Sofá Sol), que pedem otimização (simplificar a malha);
  - 11 blocos cujo tamanho não bate com a peça, com objetos a mais ou outra versão (ex.: Cadeira Toé com 6,7 m, Mesa
    Polux com 9,1 m). Esses foram pedidos à Franccino no PDF.
- **GLB para baixar:** os 126 também viraram arquivo da peça ("Modelo 3D (GLB)", tipo `block_3d`). "Integre ao seu
  projeto" ganhou o GLB como programa.
- **Área do Profissional:** filtro "Tipo de arquivo" (`GET /downloads?format=`, com `meta.formats`). PR
  [#96](https://github.com/PPP-Group/Franccino/pull/96).
- **Filtro de categoria:** `GET /categories` manda a capa da primeira peça quando a categoria não tem capa no painel
  (`CategorySampleCovers`, a mesma regra de `GET /areas/{key}`).
- **Medidas a partir dos blocos:** como dado do site, não servem. Em 94 peças com medida cadastrada, só 29 batem: o
  bloco costuma ser outra versão ou trazer objetos a mais. Das 19 peças sem medida, 6 têm bloco (Sofá Antônio, Majestic,
  Noa e Boto, Sofá Pinot Square e Mesa de centro Noa redonda). Elas foram medidas versão por versão e entraram no PDF
  para a Franccino confirmar. As outras 13 não têm arquivo nenhum.
- **PDF final para a Franccino** ("O que precisamos para terminar o site", 13/11, 13 páginas), entregue ao Pedro Ivo.
  Ele inclui as medidas para confirmar e a situação do 3D.

### 30.5 13/11/2026 (noite): acabamentos genéricos, revisão do 3D e GitHub limpo

- **Revisão do 3D peça por peça** (render × capa, folhas na área temporária):
  - a forma bate em quase todas;
  - cerca de 2/3 dos blocos da Franccino não têm material (são brancos no próprio SketchUp);
  - onde há cor, é a do modelador, não a do acabamento real (ex.: Cadeira Arp rosa na foto e marrom no arquivo).
- **Erro da conversão corrigido:** Sofá Noa, Antônio e Majestic estavam com o pufe (o arquivo escolhido era o módulo).
  `design/3d/escolha.json` passou a apontar o sofá inteiro (INTEIRO 2 ASS). Convertidos de novo com um token novo do
  Drive (o Noa quantizado, 16 MB) e enviados: o 3D e o "Modelo 3D (GLB)" para baixar (mesmo nome de arquivo, trocou o
  do pufe). A cópia do token foi apagada; com isso, 131 peças têm 3D.
- **Acabamentos genéricos (teste pedido pelo tech lead):** `design/3d/acabamento.py` aplica madeira, couro e trama de
  tecido da Poly Haven (CC0), mais alumínio e borracha, pelas cores do arquivo (mapas em `design/3d/acabamentos/`).
  - O acabamento vai na malha original, e as repetições (a trama da palhinha) ficam; sem isso, o arquivo passava de 150 MB.
  - No preview, com o 3D acabado: Chaise Coce, Cadeira Arreda, Cadeira Aura, Cadeira Brisa com braço e Banco Adhara.
  - Página Acabamentos: 6 acabamentos "(exemplo)" com amostra (madeira clara, madeira escura, linho cru, couro caramelo,
    trama natural, alumínio), ligados a essas 5 peças, pela rota nova `POST /api/import/finishes` (PR #99). Saem quando
    o mostruário real chegar (mesmo código, `EX-…`, ou apagando no painel).
- **GLB pesados:** a quantização (`KHR_mesh_quantization`, lida pelo visualizador sem decodificador extra) trouxe a
  Cadeira Melina sem braço e a Banqueta Dara para menos de 20 MB. `design/3d/simplificar.py` (solda os vértices e
  reduz a malha a cerca de 400 mil faces, mantendo as repetições) levou mais 4: Cadeira Noa, Poltrona Caeté, Poltrona
  Irani e Sofá Adhara, todas conferidas contra o original. Com os 3 sofás refeitos, **135 peças têm 3D**. Ficaram de
  fora: Sofá Snodo (o arquivo traz uma figura humana de escala, já pedido à Franccino) e Sofá Sol (a malha do arquivo
  quebra na simplificação; pede o arquivo mais leve ou ajuste no SketchUp).
- **GitHub:** PRs #96 a #98 mergeados (filtros, GLB para baixar, Next.js 16.4.5 com correções de segurança e pacotes da
  API). O #47 (ESLint 10) fica de fora: os plugins do Next.js ainda não suportam; o Dependabot foi mandado ignorar
  essa versão major.
- **Revalidação do site:** a mudança do painel ou da importação aparece na primeira visita (`revalidateTag` com
  `{ expire: 0 }`).

### 30.6 13/11/2026 (noite): Linear revisado e planilha para a Franccino

- **Linear** (visível para o cliente, texto neutro):
  - **novos, já feitos:** PPP-134 (3D a partir dos blocos SketchUp, 135 peças), PPP-135 (conteúdo do Drive no site) e
    PPP-136 (retorno de 13/11, 16 pontos);
  - **PPP-133** virou "Pendências da Franccino para terminar o site": a lista inteira do PDF de 13/11, em 10 grupos
    (acabamentos, medidas, fotos, blocos, peças, filtros, textos, projetos e vídeos, contas, decisões). Ela bloqueia
    PPP-23, 44, 83, 84, 87, 127 e 130;
  - **fechados:** PPP-62 (relatório entregue: o PDF de 13/11) e PPP-127 (a parte do código; as fotos em alta ficam no
    PPP-133);
  - **importador de planilha:** PPP-28 decidido (sem importador no painel; planilhas entram pela importação em massa da
    equipe) e PPP-63 cancelado. O tech lead pode reabrir;
  - **PPP-56** virou "Enviar à Franccino a planilha para preencher os dados que faltam";
  - comentários de estado em PPP-23, 43, 77 (3D pronto para o teste em celular), 83, 84 e 130.
- **Planilha para a Franccino** ("Franccino - dados que faltam no catalogo (13-11).xlsx"), entregue ao Pedro Ivo, não está
  no repositório. Abas: como preencher, peças novas (36), peças do site antigo (11), medidas (19 peças; nas 6 com bloco,
  a medida do bloco para confirmar), descrições (21), ambientes e variações (as 399 peças) e acabamentos. Volta
  preenchida e entra pela importação em massa (`new_products` do `content:apply`, `/api/import/finishes` e o painel).
