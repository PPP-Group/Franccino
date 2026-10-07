# Modelo de dados

Status: proposta v1 (2026-09-23), baseada no roadmap e no inventário do WordPress atual
([content-inventory.md](content-inventory.md)). Revisão formal do tech lead na semana 1.

## Convenções

- Tabelas no plural, colunas e código em inglês (`snake_case`). Models no singular.
- **Campos traduzíveis** (marcados com `tr`) são colunas JSON no formato `{"pt": "...", "en": "..."}`,
  gerenciadas por `spatie/laravel-translatable`. `pt` é obrigatório; `en` é opcional e, quando vazio,
  a API devolve o valor em `pt` e marca `locale_fallback: true`.
- **Slugs traduzíveis** seguem a mesma regra. Unicidade por idioma é garantida na validação
  (Filament + Form Requests), não por índice de banco.
- **Publicação**: `is_published` (bool, default `false`) e `sort_order` (int, default `0`, menor
  aparece primeiro). Conteúdo não publicado nunca sai na API pública.
- **SEO**: `seo_title` (tr) e `seo_description` (tr), opcionais. Na ausência, o front usa nome e resumo.
- **Legado**: `legacy_wp_id` (bigint, único por tabela, nullable) e `legacy_url` (string, nullable)
  em toda entidade migrável. Permitem migração idempotente e geração automática do mapa de 301.
- Medidas sempre em **milímetros** (inteiros). O front formata (`L 60 × P 60 × A 75 cm`).
- Timestamps em todas as tabelas. `products` usa soft delete.

## Diagrama de relações

```
areas 1───* products *───1 categories
                │  *───1 lines *───0..1 designers
                │  *───0..1 designers
                ├──* product_files 1───* download_logs
                ├──*───* finishes *───1 finish_groups
                ├──*───* collections
                ├──*───* launches
                └──*───* projects
products · designers · launches 1───* media_links (polimórfica)

clients · stores · banners · pages · redirects · settings        (independentes)
contact_messages *───0..1 products
newsletter_subscribers · users 1───* activity_logs                    (painel)
media (spatie/laravel-medialibrary, polimórfica)
```

## Catálogo

### areas

Áreas fixas do catálogo. Semeadas, editáveis, não criáveis pelo painel.

| Coluna                     | Tipo          | Notas                                                   |
| -------------------------- | ------------- | ------------------------------------------------------- |
| key                        | string, único | `indoor` \| `outdoor`                                   |
| name                       | json tr       | "Interno" / "Indoor"                                    |
| brand_name                 | string        | "Franccino Casa" / "Franccino Giardini"                 |
| description                | json tr, null | texto da página da área; ausente até edição pelo painel |
| sort_order                 | int           |                                                         |
| seo_title, seo_description | json tr       |                                                         |

Mídia: `cover` (1).

### categories

Tipos de peça, compartilhados entre áreas (no WordPress existiam duplicados "Sofás Casa" / "Sofás Giardini").

| Coluna                     | Tipo          | Notas                                       |
| -------------------------- | ------------- | ------------------------------------------- |
| name                       | json tr       | plural: "Cadeiras"                          |
| singular_name              | json tr       | "Cadeira" (rótulo acima do nome do produto) |
| slug                       | json tr       |                                             |
| description                | json tr, null |                                             |
| is_published, sort_order   |               |                                             |
| seo_title, seo_description | json tr       |                                             |
| legacy_wp_id, legacy_url   |               |                                             |

Mídia: `cover` (1).

### lines

Famílias de produto (no WP, taxonomia `linhas`: agrupa variantes, ex. "Cadeira Marcela com/sem braço",
linha Pinot, linha Bloco). Sem página própria no site; usadas em "outras peças da linha" e filtros.

| Coluna                   | Tipo               | Notas                       |
| ------------------------ | ------------------ | --------------------------- |
| name                     | string             | nome próprio, não traduzido |
| slug                     | string, único      |                             |
| designer_id              | fk designers, null | autor da linha              |
| description              | json tr, null      |                             |
| sort_order               | int                |                             |
| legacy_wp_id, legacy_url |                    |                             |

### designers

| Coluna                     | Tipo          | Notas                           |
| -------------------------- | ------------- | ------------------------------- |
| name                       | string        |                                 |
| slug                       | string, único | igual nos dois idiomas          |
| short_bio                  | json tr       | uma ou duas frases (cards)      |
| bio                        | json tr       | HTML (rich text)                |
| location                   | string, null  | "Belo Horizonte, MG", "Espanha" |
| website_url, instagram_url | string, null  |                                 |
| is_published, sort_order   |               |                                 |
| seo_title, seo_description | json tr       |                                 |
| legacy_wp_id, legacy_url   |               |                                 |

Mídia: `portrait` (1).

### collections

| Coluna                                | Tipo           | Notas       |
| ------------------------------------- | -------------- | ----------- |
| name                                  | json tr        |             |
| slug                                  | json tr        |             |
| year                                  | smallint, null |             |
| summary                               | json tr        | texto curto |
| description                           | json tr        | HTML        |
| is_featured, is_published, sort_order |                |             |
| seo_title, seo_description            | json tr        |             |
| legacy_wp_id, legacy_url              |                |             |

Mídia: `cover` (1), `gallery` (n). Pivot `collection_product` (`collection_id`, `product_id`, `sort_order`).

### products

| Coluna                                | Tipo                 | Notas                                                             |
| ------------------------------------- | -------------------- | ----------------------------------------------------------------- |
| name                                  | json tr              | "Cadeira Aura"                                                    |
| slug                                  | json tr              |                                                                   |
| sku                                   | string, null         | código interno Franccino                                          |
| tagline                               | json tr, null        | frase curta sob o nome                                            |
| description                           | json tr              | HTML                                                              |
| area_id                               | fk areas             | obrigatório                                                       |
| category_id                           | fk categories        | obrigatório                                                       |
| line_id                               | fk lines, null       |                                                                   |
| designer_id                           | fk designers, null   |                                                                   |
| dimensions                            | json                 | lista de variantes, ver abaixo                                    |
| materials                             | json tr, null        | texto livre ("Tabela técnica > Material")                         |
| finishes_note                         | json tr, null        | texto livre ("Tabela técnica > Acabamento")                       |
| is_3d_enabled                         | bool, default `true` | chave do visualizador 3D                                          |
| is_featured, is_published, sort_order |                      |                                                                   |
| seo_title, seo_description            | json tr              |                                                                   |
| legacy_wp_id, legacy_url              |                      |                                                                   |
| search_text                           | text, null           | busca normalizada: nomes pt/en, sku, designer; mantido pelo model |
| deleted_at                            | timestamp, null      | soft delete                                                       |

`dimensions`:

```json
[
  {
    "label": { "pt": "2 lugares", "en": "2 seats" },
    "width": 1800,
    "depth": 950,
    "height": 780,
    "seat_height": 420,
    "diameter": null
  }
]
```

`label` é opcional (produto de medida única). Todos os valores em mm e opcionais individualmente.

Mídia: `cover` (1, imagem de listagem), `gallery` (n), `model_3d` (1, GLB, sem conversões).
Pivots: `finish_product` (`sort_order`), `collection_product`, `launch_product`, `product_project`.

### finish_groups / finishes

O WordPress não tem cartela estruturada (acabamento é texto livre). A cartela nasce aqui.

`finish_groups`: `name` (tr), `sort_order`. Ex.: Madeiras, Tecidos, Couros, Cordas, Metais, Pedras.

`finishes`:

| Coluna                   | Tipo          | Notas                        |
| ------------------------ | ------------- | ---------------------------- |
| finish_group_id          | fk            |                              |
| name                     | json tr       |                              |
| code                     | string, null  | código do fornecedor/fábrica |
| description              | json tr, null |                              |
| is_published, sort_order |               |                              |

Mídia: `swatch` (1).

### product_files

Arquivos para download (ficha técnica, blocos 2D/3D, catálogo, apresentação). Ficam em disco **privado**; só
saem por URL assinada temporária. Cada arquivo tem um único dono: uma peça, um designer ou um lançamento
(`designer_id` e `launch_id` acrescentados em 2026-10-01, PPP-109).

| Coluna                   | Tipo         | Notas                                                                                               |
| ------------------------ | ------------ | --------------------------------------------------------------------------------------------------- |
| product_id               | fk, null     | dono: peça                                                                                          |
| designer_id              | fk, null     | dono: designer                                                                                      |
| launch_id                | fk, null     | dono: lançamento                                                                                    |
| type                     | string enum  | `technical_sheet` \| `block_2d` \| `block_3d` \| `manual` \| `catalog` \| `presentation` \| `other` |
| title                    | json tr      | "Ficha técnica"                                                                                     |
| format                   | string       | "PDF", "DWG", "SKP", "3DS"... (derivado da extensão, editável)                                      |
| disk                     | string       | default `downloads`                                                                                 |
| path                     | string       | caminho no disco                                                                                    |
| original_name            | string       |                                                                                                     |
| mime_type                | string, null |                                                                                                     |
| size                     | bigint, null | bytes (lido do disco ao salvar)                                                                     |
| is_published, sort_order |              |                                                                                                     |
| legacy_wp_id             |              |                                                                                                     |

### media_links

Vídeos (YouTube/Vimeo) e links externos de produto, designer ou lançamento. Polimórfica
(`linkable_type` + `linkable_id`). O player só carrega quando o visitante clica.

| Coluna                     | Tipo        | Notas                                                         |
| -------------------------- | ----------- | ------------------------------------------------------------- |
| linkable_type, linkable_id | morphs      | `Product`, `Designer` ou `Launch`                             |
| kind                       | string enum | `video` \| `link`                                             |
| title                      | json tr     | "Making of", "Matéria na Casa Vogue"                          |
| url                        | string(512) | vídeo: URL do YouTube ou Vimeo; link: qualquer URL `https://` |
| sort_order                 | int         | ordem no painel (arrastar)                                    |

### download_logs

Um registro por link gerado. Sem dado pessoal em claro (LGPD).

| Coluna          | Tipo              | Notas                                                                            |
| --------------- | ----------------- | -------------------------------------------------------------------------------- |
| product_file_id | fk                |                                                                                  |
| product_id      | fk, null          | desnormalizado para relatório; null quando o arquivo é de designer ou lançamento |
| locale          | string(2)         |                                                                                  |
| ip_hash         | string(64)        | `sha256(ip + APP_KEY)`                                                           |
| user_agent      | string(512), null |                                                                                  |
| referer         | string(512), null |                                                                                  |
| created_at      | timestamp         | sem `updated_at`                                                                 |

## Conteúdo editorial

### launches

Edições de lançamento (ex.: "Lançamentos 2026").

| Coluna                     | Tipo     | Notas |
| -------------------------- | -------- | ----- |
| title                      | json tr  |       |
| slug                       | json tr  |       |
| year                       | smallint |       |
| summary                    | json tr  |       |
| description                | json tr  | HTML  |
| is_published, sort_order   |          |       |
| seo_title, seo_description | json tr  |       |

Mídia: `cover` (1), `gallery` (n). Pivot `launch_product` (`sort_order`).
Um produto é "novo" (`is_new` na API) quando pertence a um lançamento publicado do ano corrente ou anterior.

### projects

Projetos residenciais e cases corporativos (no WP eram `projetos` e `cases`).

| Coluna                                | Tipo           | Notas                        |
| ------------------------------------- | -------------- | ---------------------------- |
| type                                  | string enum    | `residential` \| `corporate` |
| title                                 | json tr        |                              |
| slug                                  | json tr        |                              |
| client_name                           | string, null   | "JHSF", "Clara Resorts"      |
| location                              | string, null   | "Inhotim, MG"                |
| architect                             | string, null   | escritório/autor             |
| year                                  | smallint, null |                              |
| summary                               | json tr        |                              |
| description                           | json tr        | HTML                         |
| is_featured, is_published, sort_order |                |                              |
| seo_title, seo_description            | json tr        |                              |
| legacy_wp_id, legacy_url              |                |                              |

Mídia: `cover` (1), `gallery` (n). Pivot `product_project`.

### clients

Logos da página corporativa.

`name`, `url` (null), `is_published`, `sort_order`, `legacy_wp_id`, `legacy_url`. Mídia: `logo` (1).

### stores

Lojas exclusivas e revendas (página "Lojas" com mapa e filtro por estado e tipo).

| Coluna                                             | Tipo                | Notas                     |
| -------------------------------------------------- | ------------------- | ------------------------- |
| name                                               | string              |                           |
| type                                               | string enum         | `exclusive` \| `reseller` |
| address                                            | string              | logradouro e número       |
| address_complement                                 | string, null        |                           |
| district                                           | string, null        | bairro                    |
| city                                               | string              |                           |
| state                                              | char(2)             | UF                        |
| postal_code                                        | string, null        |                           |
| country                                            | char(2)             | default `BR`              |
| latitude, longitude                                | decimal(10,7), null |                           |
| phone, whatsapp, email, website_url, instagram_url | string, null        |                           |
| opening_hours                                      | json tr, null       | texto livre               |
| description                                        | json tr, null       | texto curto (2026-10-01)  |
| is_published, sort_order                           |                     |                           |
| legacy_wp_id, legacy_url                           |                     |                           |

Mídia: `image` (1), foto da loja (acrescentada em 2026-10-01; Anexo I pede imagem e descrição).

### banners

| Coluna                   | Tipo            | Notas                    |
| ------------------------ | --------------- | ------------------------ |
| placement                | string enum     | `home_hero` (extensível) |
| title, subtitle          | json tr, null   |                          |
| cta_label                | json tr, null   |                          |
| cta_url                  | json tr, null   | link por idioma          |
| starts_at, ends_at       | timestamp, null | janela de exibição       |
| is_published, sort_order |                 |                          |

Mídia: `image` (1, desktop), `image_mobile` (1, opcional).

### pages

Conteúdo e SEO das páginas fixas do site. Cada página corresponde a uma rota do front, identificada por `key`.
Chaves semeadas: `home`, `indoor`, `outdoor`, `products`, `launches`, `collections`, `designers`,
`projects`, `corporate`, `factory`, `stores`, `finishes`, `downloads`, `contact`, `privacy`, `terms`,
`cookies` (política de cookies, acrescentada em 2026-10-01; o `PageSeeder` cria a página que faltar).

| Coluna                     | Tipo          | Notas                    |
| -------------------------- | ------------- | ------------------------ |
| key                        | string, único |                          |
| title                      | json tr       |                          |
| intro                      | json tr, null |                          |
| content                    | json          | lista de blocos (abaixo) |
| is_published               | bool          |                          |
| seo_title, seo_description | json tr       |                          |

Mídia: `cover` (1), `og_image` (1).

`content` é uma lista **não traduzível** de blocos; os textos dentro de cada bloco é que são `{pt, en}`.
Assim a estrutura e as imagens são únicas e os dois idiomas são editados lado a lado.

| Bloco        | Dados                                                                          |
| ------------ | ------------------------------------------------------------------------------ |
| `rich_text`  | `body` (tr, HTML)                                                              |
| `image`      | `image` (path), `caption` (tr)                                                 |
| `image_text` | `image`, `heading` (tr), `body` (tr, HTML), `image_position` (`left`\|`right`) |
| `timeline`   | `items[]`: `year`, `title` (tr), `text` (tr)                                   |
| `faq`        | `items[]`: `question` (tr), `answer` (tr)                                      |
| `stats`      | `items[]`: `value`, `label` (tr)                                               |
| `quote`      | `text` (tr), `author`                                                          |
| `cta`        | `heading` (tr), `body` (tr), `label` (tr), `url` (tr)                          |
| `gallery`    | `images[]` (paths), `caption` (tr)                                             |
| `video`      | `url` (YouTube ou Vimeo), `poster` (path, opcional), `title` (tr)              |

Imagens de blocos ficam no disco `media` (sem conversões automáticas).

### redirects

Mapa de redirecionamento do site antigo e regras manuais. O front consome via API.

| Coluna      | Tipo          | Notas                                                                    |
| ----------- | ------------- | ------------------------------------------------------------------------ |
| from_path   | string, único | caminho normalizado, pode incluir query (`/?taxonomy=linhas&term=pinot`) |
| to_path     | string, null  | null quando `status_code = 410`                                          |
| status_code | smallint      | 301 \| 302 \| 410                                                        |
| is_active   | bool          |                                                                          |
| notes       | string, null  |                                                                          |

### settings

Configurações globais via `spatie/laravel-settings` (grupo `general`), editadas numa página do painel:
nome da empresa, e-mail e telefone de contato, endereço da fábrica, WhatsApp de orçamentos, WhatsApp e
telefone de assistência técnica, redes sociais (Instagram, Facebook, Pinterest, LinkedIn, YouTube),
destinatários do formulário de contato (lista de e-mails, não exposta na API) e documentos do rodapé
(lista `label` tr + arquivo, ex. relatórios de transparência salarial, que são exigência legal).

## Relacionamento com o público

### contact_messages

| Coluna      | Tipo              | Notas                                                                                                              |
| ----------- | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| type        | string enum       | `quote` \| `assistance` \| `partnership` \| `press` \| `other`                                                     |
| name, email | string            |                                                                                                                    |
| phone       | string, null      |                                                                                                                    |
| company     | string, null      |                                                                                                                    |
| profession  | string enum, null | `architect` \| `interior_designer` \| `retailer` \| `end_customer` \| `other`                                      |
| city        | string, null      |                                                                                                                    |
| state       | char(2), null     |                                                                                                                    |
| message     | text              |                                                                                                                    |
| product_id  | fk products, null | quando enviado da página de produto                                                                                |
| items       | json, null        | itens da lista de orçamento/Sala para montar: `[{product_id, quantity, finish_ids, note}]` (decisão de 2026-09-23) |
| locale      | string(2)         |                                                                                                                    |
| source_url  | string, null      |                                                                                                                    |
| consent_at  | timestamp         | aceite da política de privacidade                                                                                  |
| ip_hash     | string(64)        |                                                                                                                    |
| user_agent  | string(512), null |                                                                                                                    |
| read_at     | timestamp, null   |                                                                                                                    |

### newsletter_subscribers

`email` (único), `name` (null), `locale`, `source` (`footer`, `contact`...), `consent_at`,
`unsubscribed_at` (null), `ip_hash`.

### consent_records

Registro do aceite de cookies (Anexo I, LGPD), gravado por `POST /consents`. Só inclusão; o painel lista e
filtra, sem editar.

| Coluna         | Tipo              | Notas                                 |
| -------------- | ----------------- | ------------------------------------- |
| visitor_id     | uuid, índice      | gerado no navegador, sem dado pessoal |
| choice         | string            | `granted` \| `denied`                 |
| policy_version | string(40), null  | versão da política vigente na escolha |
| locale         | string(2)         |                                       |
| ip_hash        | string(64)        | hash do IP, como em `download_logs`   |
| user_agent     | string(512), null |                                       |
| created_at     | timestamp, índice | sem `updated_at`                      |

## Acesso ao painel

### users

| Coluna                                                       | Tipo                      | Notas                               |
| ------------------------------------------------------------ | ------------------------- | ----------------------------------- |
| name, email, password                                        |                           |                                     |
| role                                                         | string enum               | `admin` \| `editor` \| `support`    |
| is_active                                                    | bool                      | usuário inativo não entra no painel |
| app_authentication_secret, app_authentication_recovery_codes | text, null, criptografado | 2FA do Filament                     |

| Permissão                                             | admin | editor | support (Atendimento) |
| ----------------------------------------------------- | ----- | ------ | --------------------- |
| Catálogo e conteúdo editorial (CRUD)                  | sim   | sim    | não                   |
| Páginas fixas (editar)                                | sim   | sim    | não                   |
| Mensagens de contato e newsletter (ver, exportar CSV) | sim   | sim    | sim                   |
| Excluir mensagens e inscritos                         | sim   | não    | não                   |
| Logs de download (ver)                                | sim   | sim    | sim                   |
| Redirects                                             | sim   | não    | não                   |
| Configurações                                         | sim   | não    | não                   |
| Usuários                                              | sim   | não    | não                   |
| Registro de atividades (ver)                          | sim   | não    | não                   |

`support` (acrescentado em 2026-10-01, PPP-54) é o perfil de atendimento: entra no painel só para ler e
responder mensagens, newsletter e downloads; não vê nem edita conteúdo.

### activity_logs

Registro de atividades do painel (PPP-54). Uma linha por ação de uma pessoa logada: criar, editar, excluir
e entrar no painel, além de salvar as configurações. Importações, seeders e a API pública não geram linha.
Guarda só o **nome** dos campos alterados, nunca os valores; mensagens e inscritos aparecem como `#id`
(sem dado pessoal do visitante).

| Coluna                   | Tipo           | Notas                                              |
| ------------------------ | -------------- | -------------------------------------------------- |
| user_id                  | fk users, null | quem fez (null se o usuário foi excluído depois)   |
| action                   | string(20)     | `created` \| `updated` \| `deleted` \| `login`     |
| subject_type, subject_id | morphs, null   | registro afetado; `settings` para as configurações |
| subject_label            | string, null   | nome ou título no momento da ação                  |
| changes                  | json, null     | lista de campos alterados (só em `updated`)        |
| created_at               | timestamp      | sem `updated_at`                                   |

## Mídia

`spatie/laravel-medialibrary`, tabela `media` polimórfica.

- Disco `media` (público): local em `storage/app/public/media`; produção no bucket público do R2 com
  domínio próprio e CDN.
- Disco `downloads` (privado): local em `storage/app/private/downloads` com URLs temporárias do Laravel;
  produção no bucket privado do R2 com URLs pré-assinadas.
- Conversões de imagem (fila): `w480`, `w960`, `w1440`, `w1920`, `w2560` em WebP, sem ampliar a
  original. Conversão `lqip` (24 px) vira `blur_data_url` (data URL) nas custom properties.
- Largura e altura da original ficam nas custom properties (`width`, `height`) para o front reservar espaço.
- GLB (`model_3d`) vai para o disco `media` sem conversões; o visualizador carrega direto do CDN.
- Texto alternativo: por enquanto derivado do nome do item dono da imagem; edição por imagem fica para depois.
