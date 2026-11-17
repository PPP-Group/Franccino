# API de gestão e conector do Claude e do ChatGPT

Nota para quem mantém (17/11/2026). Adaptação do desenho da API do VTX Tap: uma API com o que o painel faz, um
conector MCP para o Claude e o ChatGPT e o OAuth para conectar, tudo saindo de um catálogo só. O guia para quem usa
fica no ar em `{API}/api/manage/docs` (gerado do catálogo); o OpenAPI, em `{API}/api/manage/v1/openapi.json`.

## A ideia central

**A API não tem regra própria.** Cada operação grava pelos mesmos modelos Eloquent do painel, com as mesmas
validações do formulário, a mesma política (`ContentPolicy`, `AdminOnlyPolicy`, `FixedRecordPolicy`) e os mesmos
observadores (atualização do site, registro de atividade, texto de busca). Quem chama age como a **conta interna** da
credencial, um usuário "API · nome" ligado por `users.api_credential_id`:

- administradora e ativa, para as políticas do painel valerem iguais;
- nunca entra no painel (`User::canAccessPanel`), não aparece em Usuários, não conta como "último administrador" e
  não recebe e-mails;
- aparece no registro de atividade em cada mudança.

## Onde está cada peça

| Arquivo                                                | O que tem                                                                                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `api/app/Manage/Areas.php`                             | As áreas (escopos `area:ler` / `area:escrever`) e o que fica de fora                                                                |
| `api/app/Manage/Resources.php`                         | As telas do painel descritas: campos, regras, relações e coleções de foto                                                           |
| `api/app/Manage/Catalog.php`                           | O catálogo: as operações saem de `Resources` (listar, ler, criar, mudar, apagar, fotos, arquivos, vídeos) e as especiais ficam aqui |
| `api/app/Manage/Schema.php`                            | Os campos em JSON Schema (conector, OpenAPI) e em regras do Laravel                                                                 |
| `api/app/Manage/Engine.php`                            | Executa a operação: escopo, campo desconhecido, conta interna, transação                                                            |
| `api/app/Manage/ResourceHandler.php`                   | O tratamento genérico dos recursos (gravação, fotos, arquivos técnicos, vídeos e links, ETag)                                       |
| `api/app/Manage/Specials.php`                          | Configurações, imagens dos blocos das páginas, caixa de entrada (só leitura)                                                        |
| `api/app/Manage/Settings.php`                          | Os campos e regras das Configurações gerais                                                                                         |
| `api/app/Manage/IncomingFile.php`                      | Arquivo por `url` (https público, contra SSRF) ou `data` (base64)                                                                   |
| `api/app/Manage/Gateway.php`                           | A porta comum: credencial, limites, Idempotency-Key, registro                                                                       |
| `api/app/Manage/Mcp.php`                               | O servidor MCP (Streamable HTTP sem estado, JSON-RPC) e as instruções do modelo                                                     |
| `api/app/Manage/OAuth.php`                             | O servidor de autorização (metadados, registro, CIMD, authorize, token, revoke)                                                     |
| `api/app/Manage/OpenApi.php`                           | O OpenAPI 3.1 montado do catálogo                                                                                                   |
| `api/app/Http/Controllers/Manage/ManageController.php` | As rotas: REST, `/mcp`, `/oauth/*`, `/.well-known/*`, docs                                                                          |
| `api/routes/manage.php`                                | As rotas (fora dos grupos web e api: sem sessão nem CSRF)                                                                           |
| `api/app/Filament/Pages/ApiConnections.php`            | Painel › Sistema › API e conectores (chaves, conexões, últimas chamadas, passo a passo)                                             |
| `api/app/Filament/Pages/ConnectApp.php`                | A janela de aprovar a conexão (`/admin/connect-app?request=...`)                                                                    |
| `api/resources/views/manage/docs.blade.php`            | A página `/api/manage/docs` (guias + referência do catálogo)                                                                        |
| `api/tests/Feature/Manage/`                            | REST, MCP e OAuth de ponta a ponta, e o teste de cobertura                                                                          |

## Endereços

- REST: `{API}/api/manage/v1/...` (o `/api/v1` continua sendo a API pública do site).
- Conector: `{API}/mcp` (o mesmo para o Claude e o ChatGPT).
- OAuth: `{API}/oauth/register|authorize|token|revoke` e `{API}/.well-known/oauth-*`.
- `{API}` é o `APP_URL` da API (no preview, `https://api-preview-franccino.valenteai.cloud`). O `APP_URL` precisa ser o
  endereço público com https: os metadados do OAuth e os tokens saem dele.

## Credenciais e segurança

- Chave do painel: `fcc_` + 48 hexadecimais; só o SHA-256 fica no banco; até 10 ativas; validade de 7 dias a 1 ano
  ou sem validade.
- Conector: tokens `fcca_` (1 hora) e `fccr_` (90 dias, trocado a cada uso), presos ao recurso `/mcp`. Código ou token
  de renovação reaproveitado derruba a conexão.
- Limites: 60 chamadas/min, 30 mudanças/min e 10.000/dia por credencial; 300/min no total.
- `api_logs` guarda a operação, o status e o tempo (sem valores) por 30 dias; `model:prune` limpa (diário).
- Fica de fora: usuários e permissões, registro de atividade, consentimentos (LGPD), apagar peças em definitivo
  (apagar peça manda para a lixeira) e as próprias chaves. A caixa de entrada (contatos, newsletter, listas,
  downloads) é só leitura.

## A regra para manter em dia

Toda mudança no painel que mexe em dados entra na API no mesmo PR:

- [ ] campo novo, regra nova ou coleção de foto nova: em `Resources.php` (o teste de cobertura reprova se faltar);
- [ ] o nome do campo nas mensagens de erro sai do começo da descrição ("Caminho antigo (começa com /)." vira
      "caminho antigo"); quando o começo não serve, ponha `'attribute' => 'nome'` no campo;
- [ ] tela nova do painel: um recurso em `Resources.php` ou o nome na lista do que fica de fora
      (`MANAGE_EXCLUDED_RESOURCES`, no teste de cobertura);
- [ ] área nova: em `Areas::LIST` (os escopos, o OAuth, o OpenAPI, a documentação e o painel saem dela);
- [ ] operação especial: em `Catalog::specials()` e `Specials.php`, com teste.

O teste `ManageCatalogCoverageTest` compara campo a campo os formulários do painel com o catálogo (nome, tamanho
máximo e obrigatório), confere que cada tela está na API ou na lista de fora, que todo campo de toda ferramenta tem
tipo e que cada recurso se cria pela API só com os obrigatórios.

## Conectar

No painel, **Sistema › API e conectores** mostra o endereço do conector e o passo a passo do Claude e do ChatGPT. O
pedido do aplicativo abre a janela de aprovar; só um administrador aprova e pode diminuir as permissões. Para entrar
nos diretórios oficiais do Claude e do ChatGPT (não é preciso para uso da própria Franccino), faltam política de
privacidade com a parte dos conectores, ícone 512 × 512, conta de teste e os textos de cada diretório.
