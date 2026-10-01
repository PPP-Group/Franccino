# Runbook de deploy

Status: rascunho (2026-09-23). Hospedagem ainda não definida; os passos abaixo valem para VPS/Forge no Laravel e

Preview com senha (EasyPanel/Docker) e revisão local com o conteúdo real: ver [`deploy-preview.md`](deploy-preview.md).
Vercel ou Node no Next. Completar quando as contas existirem.

## Ambientes

| Ambiente | Branch               | API (Laravel)                                   | Site (Next)                                 | Acesso                                         |
| -------- | -------------------- | ----------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| Local    | `feature/*`, `fix/*` | `http://localhost:8000`                         | `http://localhost:3000`                     | time                                           |
| Staging  | `develop`            | a definir (ex.: `api-staging.franccino.com.br`) | a definir (ex.: `staging.franccino.com.br`) | time e Franccino, autenticação HTTP, `noindex` |
| Produção | `main`               | a definir (ex.: `api.franccino.com.br`)         | `franccino.com.br`                          | público; deploy só pelo tech lead              |

## Variáveis de ambiente

### API (`api/.env`)

| Variável                                                  | Staging / produção                                                                    |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `APP_ENV`, `APP_DEBUG`                                    | `staging`/`production`, `false`                                                       |
| `APP_KEY`                                                 | gerada uma vez por ambiente (`php artisan key:generate --show`), guardada no cofre    |
| `APP_URL`                                                 | URL pública da API                                                                    |
| `APP_LOCALES`                                             | `pt,en` (ou `pt` se o inglês não estiver pronto)                                      |
| `DB_*`                                                    | MySQL 8.4 do ambiente                                                                 |
| `QUEUE_CONNECTION`                                        | `database` (worker rodando)                                                           |
| `MAIL_*`                                                  | serviço de e-mail transacional (a definir)                                            |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`                           | só no primeiro deploy (seed do admin); depois remover                                 |
| `FRONTEND_URL`                                            | domínio(s) do site, separados por vírgula (CORS)                                      |
| `FRONTEND_API_KEY`                                        | segredo compartilhado com o Next (`FRONTEND_API_KEY`)                                 |
| `FRONTEND_REVALIDATE_URL`, `FRONTEND_REVALIDATE_SECRET`   | `https://<site>/api/revalidate` e segredo compartilhado (`REVALIDATE_SECRET` no Next) |
| `TURNSTILE_SECRET_KEY`                                    | Cloudflare Turnstile                                                                  |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT` | credenciais do R2                                                                     |
| `R2_MEDIA_BUCKET`, `R2_MEDIA_PUBLIC_URL`                  | bucket público e domínio de mídia (ex.: `media.franccino.com.br`)                     |
| `R2_DOWNLOADS_BUCKET`                                     | bucket privado de arquivos técnicos                                                   |

### Site (`web/.env`)

| Variável                                                 | Staging / produção                          |
| -------------------------------------------------------- | ------------------------------------------- |
| `API_URL`, `NEXT_PUBLIC_API_URL`                         | URL pública da API                          |
| `FRONTEND_API_KEY`                                       | igual ao da API                             |
| `SITE_URL`                                               | URL pública do site                         |
| `SITE_ENV`                                               | `staging` ou `production`                   |
| `NEXT_PUBLIC_SITE_LOCALES`                               | `pt,en` (ou `pt`)                           |
| `REVALIDATE_SECRET`                                      | igual a `FRONTEND_REVALIDATE_SECRET` da API |
| `STAGING_BASIC_AUTH_USER`, `STAGING_BASIC_AUTH_PASSWORD` | só em staging                               |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                         | Cloudflare Turnstile                        |

## Deploy da API

```bash
git pull
composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force
php artisan optimize          # config, rotas, views e eventos em cache
php artisan filament:optimize
php artisan storage:link      # só no primeiro deploy (disco local)
php artisan queue:restart     # recarrega o worker
```

Serviços permanentes: worker da fila (`php artisan queue:work --tries=3`) e agendador (`* * * * * php artisan
schedule:run`). PHP com `upload_max_filesize` e `post_max_size` de pelo menos 64M (GLB e PDFs) e o limite
equivalente no servidor web (ex.: `client_max_body_size` no nginx).

CORS da mídia: o visualizador 3D (`@google/model-viewer`) baixa o GLB com `fetch` a partir do domínio do site, então
o bucket de mídia do R2 (ou o servidor que entrega `/storage` no disco local) precisa responder
`Access-Control-Allow-Origin` para as origens de `FRONTEND_URL` em `GET`/`HEAD`. O `config/cors.php` da API cobre só
`api/*`; arquivos estáticos não passam por ele. Sem isso o 3D falha com erro de CORS (inclusive no ambiente local,
onde a mídia vem de `http://localhost:8000/storage`).

## Deploy do site

- Build com `pnpm install --frozen-lockfile && pnpm --filter web build`, com a API do ambiente no ar (o build
  gera as páginas estáticas a partir dela).
- Depois do deploy, as páginas se atualizam sozinhas pela revalidação disparada pelo painel.
- Limite de requisições na borda (CDN/proxy do site): o servidor do Next fala com a API usando `X-Frontend-Key`,
  que a API não limita. Por isso o limite fica na frente do site e cobre a busca e as listagens com `q` (sem cache
  de dados) e o POST da Server Action de busca da sala para montar (`/pt/sala-para-montar`, `/en/room-planner`),
  que faz até 13 chamadas à API por requisição.

## Checklist de go-live (roadmap, seção 7)

- [ ] Redirects 301 de todas as URLs antigas testados um a um (tabela `redirects` + `legacy_url`)
- [ ] Sitemap gerado nos dois idiomas e enviado ao Search Console
- [ ] hreflang correto entre as versões pt e en
- [ ] Metadados preenchidos em todas as páginas principais
- [ ] `noindex` removido da produção e mantido em staging
- [ ] SSL ativo e redirecionamento de http para https
- [ ] Analytics e Tag Manager disparando
- [ ] Formulário de contato e newsletter testados com envio real
- [ ] Downloads técnicos entregando arquivo por URL assinada
- [ ] CORS do bucket de mídia liberado para o domínio do site (GLB do 3D)
- [ ] Visualizador 3D testado em iOS e Android reais
- [ ] Banner de cookies e política de privacidade publicados
- [ ] Backup automatizado rodando e restauração testada uma vez
- [ ] Monitoramento de erro recebendo eventos
- [ ] Credenciais do painel criadas para a equipe da Franccino
- [ ] Treinamento do CMS realizado e gravado
- [ ] Aceite formal recebido por escrito
- [ ] PDFs legais (relatórios de transparência salarial) acessíveis no endereço novo e redirecionados do antigo

## Pendências de conta e acesso

Cloudflare (DNS, R2, Turnstile), hospedagem da API e do site, serviço de e-mail transacional, monitoramento de
erro (Sentry ou similar), Google Analytics / Tag Manager / Search Console, subdomínio de staging, dump do banco do
WordPress atual (migração completa), modelos GLB dos produtos.
