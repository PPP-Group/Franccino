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
git fetch origin && git checkout claude/awesome-keller-iv02zw
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

Um projeto (ex.: `franccino`) com dois serviços do tipo **App**, os dois a partir do GitHub
(`PPP-Group/Franccino`, branch `claude/awesome-keller-iv02zw` até o merge, depois `develop`).

### Serviço `api`

| Campo                   | Valor                                                       |
| ----------------------- | ----------------------------------------------------------- |
| Build                   | Dockerfile · caminho de build `/api` · arquivo `Dockerfile` |
| Porta do domínio        | `80`                                                        |
| Domínio                 | ex.: `api-preview.<seu-dominio>` (HTTPS pelo EasyPanel)     |
| Volume (mount)          | `/app/storage` (banco, fotos, arquivos e chave)             |
| Variáveis (Environment) | abaixo                                                      |

```env
APP_URL=https://api-preview.<seu-dominio>
FRONTEND_URL=https://preview.<seu-dominio>
FRONTEND_REVALIDATE_URL=http://franccino_web:3000/api/revalidate
ADMIN_EMAIL=<seu e-mail>
ADMIN_PASSWORD=<senha forte>
FRONTEND_API_KEY=<segredo 1>
FRONTEND_REVALIDATE_SECRET=<segredo 2>
MAIL_MAILER=log
SNAPSHOT_URL=<link direto do zip, opcional>
```

`APP_KEY` pode ficar vazia: a imagem gera uma e guarda no volume. `APP_LOCALE=pt_BR`, SQLite e fila já vêm de
fábrica na imagem. O nome interno `franccino_web` segue o padrão `<projeto>_<serviço>` do EasyPanel; confira no
painel se o projeto tiver outro nome.

### Serviço `web`

| Campo            | Valor                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Build            | Dockerfile · caminho de build `/` (raiz) · arquivo `web/Dockerfile` |
| Porta do domínio | `3000`                                                              |
| Domínio          | ex.: `preview.<seu-dominio>`                                        |

```env
API_URL=http://franccino_api
NEXT_PUBLIC_API_URL=https://api-preview.<seu-dominio>
SITE_URL=https://preview.<seu-dominio>
SITE_ENV=staging
NEXT_PUBLIC_SITE_LOCALES=pt,en
FRONTEND_API_KEY=<segredo 1>
REVALIDATE_SECRET=<segredo 2>
STAGING_BASIC_AUTH_USER=franccino
STAGING_BASIC_AUTH_PASSWORD=<senha que vai para o cliente>
```

`SITE_ENV=staging` liga a senha e o `noindex` (o Google não indexa o preview).

### Colocando o conteúdo no VPS

Escolha um:

1. **Link direto:** `SNAPSHOT_URL` com um link que baixe o zip direto (não serve página de "baixar" do Drive).
   A API importa sozinha no primeiro início e marca `storage/.snapshot-imported`.
2. **Pelo servidor:** copie o zip para o volume da API e importe pelo **Console** do serviço `api`:

   ```bash
   scp franccino-2026-10-01.snapshot.zip root@<vps>:/etc/easypanel/projects/franccino/api/volumes/storage/
   # Console do serviço api no EasyPanel:
   php artisan franccino:snapshot import storage/franccino-2026-10-01.snapshot.zip --force
   ```

   O caminho do volume aparece na aba de volumes do serviço; o acima é o padrão.

Depois de importar, faça **Redeploy** do `web` para o build pegar o conteúdo novo. Daí em diante, o que for
editado no painel atualiza o site sozinho (revalidação).

### Ordem do primeiro deploy

1. Criar `api` (variáveis + volume) e fazer deploy. Esperar `/up` responder.
2. Importar o snapshot (link ou console).
3. Criar `web` e fazer deploy (o build espera a API responder).
4. Abrir `https://preview.<seu-dominio>/pt`, entrar com a senha do preview, e o painel em
   `https://api-preview.<seu-dominio>/admin`.

## Observações

- O preview usa SQLite e disco local no volume. Produção usa MySQL e R2 (`runbook-deploy.md`); o snapshot
  serve para preview e revisão, não para produção.
- Formulários: com `MAIL_MAILER=log` as mensagens ficam só no painel (Mensagens), sem e-mail.
- Imagens base: `dunglas/frankenphp` (PHP 8.4 + Caddy) para a API e `node:24` para o site.
