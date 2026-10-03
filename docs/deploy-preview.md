# Preview: rodar local e subir no VPS (EasyPanel)

Guia rápido para revisar o site completo no computador e publicar um preview com senha para a Franccino.
Para o deploy definitivo (MySQL, R2, produção) vale o [`runbook-deploy.md`](runbook-deploy.md).

O conteúdo (388 peças, fotos, textos em pt e en) viaja num **snapshot**: um zip gerado por
`php artisan franccino:snapshot export`. O snapshot leva banco SQLite e fotos, **sem** usuários, mensagens,
newsletter, aceites e logs. Ele é dado do cliente: guarde no Drive do projeto, nunca no repositório.

---

## 1. Local, sem Docker (o jeito mais rápido)

Requisitos do `CLAUDE.md` (Node 24, pnpm 11, PHP 8.4 + Composer). Na raiz do repositório:

```bash
git fetch origin && git checkout develop
pnpm install
pnpm bootstrap --sqlite      # cria api/.env e web/.env.local, mostra a senha do admin
cd api
php artisan franccino:snapshot import ../snapshots/franccino-2026-10-01.snapshot.zip --force
cd ..
pnpm dev                     # API :8000 · fila · site :3000
```

- Site: http://localhost:3000/pt e http://localhost:3000/en
- Painel: http://localhost:8000/admin, com `ADMIN_EMAIL` e `ADMIN_PASSWORD` do `api/.env` (o bootstrap mostra).
- O snapshot com as fotos redimensionadas importa em poucos minutos. Um snapshot sem elas (exportado sem
  `--with-conversions`) gera as fotos no import, cerca de 20 minutos.

## 2. Local, com Docker (igual ao VPS)

```bash
cp .env.preview.example .env.preview     # preencha ADMIN_*, segredos e a senha do preview
mkdir -p snapshots && cp <snapshot>.zip snapshots/
# no .env.preview: SNAPSHOT_URL=file:///snapshots/<snapshot>.zip
docker compose -f compose.preview.yaml up --build
```

A API sobe em http://localhost:8000 e o site em http://localhost:3000 (pede o usuário e a senha de
`STAGING_BASIC_AUTH_*`). O site faz o build ao iniciar, depois que a API responde: 2 a 3 minutos.

## 3. VPS com EasyPanel

Um projeto com dois serviços do tipo **App**, os dois a partir do GitHub (`PPP-Group/Franccino`, branch `main`).
O nome interno de cada serviço é `<projeto>_<serviço>`; `docker service ls` no VPS lista os nomes certos.

**Preview atual:** VPS `72.60.49.32`, projeto `sites`.

| Serviço              | Nome interno               | Domínio                                         |
| -------------------- | -------------------------- | ----------------------------------------------- |
| `api-site-franccino` | `sites_api-site-franccino` | `https://api-preview-franccino.valenteai.cloud` |
| `site-franccino`     | `sites_site-franccino`     | `https://preview-franccino.valenteai.cloud`     |

**Senhas e segredos só com letras e números.** O EasyPanel corta o valor no `#` (`Franccino#2026` vira
`Franccino`), e `$`, aspas e espaços também dão problema. Para os segredos, use `openssl rand -hex 32`.

### Serviço da API

| Campo                   | Valor                                                       |
| ----------------------- | ----------------------------------------------------------- |
| Build                   | Dockerfile · caminho de build `/api` · arquivo `Dockerfile` |
| Porta do domínio        | `80`                                                        |
| Volume (mount)          | `/app/storage` (banco, fotos, arquivos e chave)             |
| Variáveis (Environment) | abaixo                                                      |

```env
APP_URL=https://<domínio da api>
FRONTEND_URL=https://<domínio do site>
FRONTEND_REVALIDATE_URL=http://<nome interno do site>:3000/api/revalidate
ADMIN_EMAIL=<seu e-mail>
ADMIN_PASSWORD=<senha só com letras e números>
FRONTEND_API_KEY=<segredo 1>
FRONTEND_REVALIDATE_SECRET=<segredo 2>
MAIL_MAILER=log
```

O resto já vem de fábrica na imagem e não precisa de configuração no EasyPanel:

- `APP_KEY` vazia: a imagem gera uma e guarda no volume.
- `APP_LOCALE=pt_BR`, SQLite e fila.
- Dois workers da fila (`QUEUE_WORKERS`).
- Healthcheck na rota `/up`.

### Serviço do site

| Campo            | Valor                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Build            | Dockerfile · caminho de build `/` (raiz) · arquivo `web/Dockerfile` |
| Porta do domínio | `3000`                                                              |
| Volume           | nenhum                                                              |

```env
API_URL=http://<nome interno da api>
NEXT_PUBLIC_API_URL=https://<domínio da api>
SITE_URL=https://<domínio do site>
SITE_ENV=staging
NEXT_PUBLIC_SITE_LOCALES=pt,en
FRONTEND_API_KEY=<segredo 1>
REVALIDATE_SECRET=<segredo 2>
STAGING_BASIC_AUTH_USER=franccino
STAGING_BASIC_AUTH_PASSWORD=<senha do cliente, só letras e números>
```

`SITE_ENV=staging` liga a senha e o `noindex` (o Google não indexa o preview).

### Ordem do primeiro deploy

1. Criar a API (variáveis e volume) e fazer Deploy. Esperar a bolinha verde e `https://<domínio da api>/up` responder.
2. Importar o snapshot (abaixo).
3. Criar o site e fazer Deploy. O build espera a API responder e leva de 2 a 3 minutos.
4. Abrir `https://<domínio do site>/pt` com a senha do preview, e o painel em `https://<domínio da api>/admin`.

### Importar o snapshot (conteúdo)

O zip tem banco e fotos (`php artisan franccino:snapshot export`). Ele não vai para o repositório: fica no Drive
do projeto. Com a API no ar, no terminal do VPS:

```bash
cat franccino-*.snapshot.zip.part* > franccino.snapshot.zip    # se veio em partes
API=$(docker ps -q -f name=<nome interno da api> | head -1)
docker cp franccino.snapshot.zip $API:/app/storage/
docker exec $API php artisan franccino:snapshot import storage/franccino.snapshot.zip --force
docker exec $API rm storage/franccino.snapshot.zip
```

Depois, faça **Deploy do site** para o build pegar o conteúdo.

- **Pode rodar com a API ligada.** O import copia o conteúdo por dentro do SQLite, numa transação só. Usuários
  do painel, mensagens e fila ficam como estão.
- **Substitui o conteúdo.** O que foi editado no painel depois do snapshot se perde.
- **Fotos:** o site mostra a foto original logo de cara. As versões redimensionadas saem em segundo plano, em
  cerca de meia hora para o catálogo todo. Para acompanhar, rode o comando abaixo: o número tem que cair até 0.

  ```bash
  docker exec $API sqlite3 storage/database.sqlite "select count(*) from jobs"
  ```

- **Importação automática:** a alternativa é a variável `SNAPSHOT_URL`, com um link que baixe o zip direto.
  Ela importa só no primeiro início. Os dois caminhos gravam `storage/.snapshot-imported`, e um redeploy nunca
  reimporta.

### Atualizar o preview depois de um merge na `main`

1. Fazer Deploy da API. As migrations novas rodam sozinhas, e o conteúdo do painel continua.
2. Esperar a bolinha verde.
3. Fazer Deploy do site.

Não reimportar o snapshot e não apagar o banco.

### Problemas comuns

| Sintoma                                                                                                     | Causa e correção                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `failed to populate volume ... no such file or directory`                                                   | Volume no serviço do site, que não leva volume: apague o mount. Na API, crie a pasta da mensagem com `mkdir -p` e faça Deploy de novo.                                                                                                                           |
| Site com bolinha laranja e "Aguardando a API" no log                                                        | `API_URL` com nome interno errado, ou a API fora do ar.                                                                                                                                                                                                          |
| "Service not found" no domínio                                                                              | O container não está rodando, ou a porta do domínio está errada (API = 80, site = 3000). Veja a aba Logs.                                                                                                                                                        |
| HTTPS não sai, e o domínio mostra 404 do EasyPanel ou certificado inválido (vale para qualquer site do VPS) | Um arquivo inválido em `/etc/easypanel/traefik/config` derruba as rotas novas de todos os serviços. Rode `docker logs --tail 50 easypanel-traefik` e procure "Error while building configuration". Em 10/2026 foi o `vtx-dominios.yaml`, do roteador do VTX Tap. |
| Fotos borradas por muito tempo                                                                              | É a fila de fotos redimensionadas. Confira com o comando `select count(*) from jobs` acima. Com a fila parada, rode `docker service update --force <nome interno da api>`.                                                                                       |
| Senha do preview ou do painel não entra                                                                     | Tem `#` (ou outro símbolo) no valor. Use só letras e números e faça Deploy de novo.                                                                                                                                                                              |

## Observações

- O preview usa SQLite e disco local no volume. Produção usa MySQL e R2 (`runbook-deploy.md`); o snapshot
  serve para preview e revisão, não para produção.
- Formulários: com `MAIL_MAILER=log` as mensagens ficam só no painel (Mensagens), sem e-mail.
- O visualizador 3D baixa o GLB de `/storage` a partir do domínio do site. O `api/docker/Caddyfile` responde
  `Access-Control-Allow-Origin` nesses arquivos só para as origens de `FRONTEND_URL` (o entrypoint monta a regra).
  Para ligar o 3D de um produto: painel → produto → **Modelo 3D** (GLB até 5 MB) e o "3D" ativado.
- Imagens base: `dunglas/frankenphp` (PHP 8.4 + Caddy) para a API e `node:24` para o site. O healthcheck da
  imagem base testa a porta 2019, que o `php-server` não abre; o `api/Dockerfile` troca pela rota `/up`.
