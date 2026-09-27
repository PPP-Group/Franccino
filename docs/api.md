# API pública v1

Status: contrato v1 (2026-09-23). Back-end e front implementam contra este documento. Mudança de contrato
exige atualizar este arquivo no mesmo PR.

- Base: `{API_URL}/api/v1` (local: `http://localhost:8000/api/v1`).
- Formato: JSON UTF-8. Datas em ISO 8601 (UTC).
- Idioma: parâmetro `locale=pt|en` em toda rota (default `pt`). Valor inválido: `422`.
  Campos traduzíveis sem valor em `en` voltam em `pt` e o recurso traz `locale_fallback: true`.
- Só conteúdo publicado (`is_published = true`) aparece. Item inexistente ou não publicado: `404`.
- Texto rico vem como HTML já sanitizado no back-end (allowlist: `p h2 h3 h4 strong em a ul ol li
blockquote br`; `a` só com `href` http(s)/mailto/tel).

## Envelopes

```jsonc
// item
{ "data": { /* recurso */ } }

// lista paginada
{
  "data": [ /* recursos */ ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "last_page": 9, "per_page": 24, "total": 205 }
}

// erro
{ "message": "The given data was invalid.", "errors": { "email": ["..."] } }
```

Paginação: `page` (default 1) e `per_page` (default 24, máximo 48). Listas curtas (áreas, categorias,
designers, lojas, acabamentos, clientes, banners) não são paginadas.

## Tipos comuns

```ts
type Locale = 'pt' | 'en';

type Image = {
  id: number;
  alt: string;
  width: number | null; // dimensões da original
  height: number | null;
  src: string; // maior conversão disponível
  srcset: { width: number; url: string }[]; // conversões em ordem crescente
  blur_data_url: string | null; // placeholder minúsculo em data URL
};

type Seo = { title: string | null; description: string | null; image: Image | null };

type AreaRef = { key: 'indoor' | 'outdoor'; name: string; brand_name: string };
type CategoryRef = { id: number; slug: string; name: string; singular_name: string };
type DesignerRef = { id: number; slug: string; name: string };
type LineRef = { id: number; slug: string; name: string };
type CollectionRef = { id: number; slug: string; name: string; year: number | null };

type Dimension = {
  label: string | null;
  width: number | null; // mm
  depth: number | null;
  height: number | null;
  seat_height: number | null;
  diameter: number | null;
};

type DownloadFile = {
  id: number;
  type: 'technical_sheet' | 'block_2d' | 'block_3d' | 'manual' | 'other';
  title: string;
  format: string; // "PDF", "DWG", "SKP"...
  size: number | null; // bytes
};

type ProductCard = {
  id: number;
  slug: string;
  name: string;
  area: AreaRef;
  category: CategoryRef;
  designer: DesignerRef | null;
  cover: Image | null;
  is_new: boolean;
};

type ProductDetail = ProductCard & {
  slugs: Record<Locale, string | null>; // para o seletor de idioma e hreflang
  sku: string | null;
  tagline: string | null;
  description: string | null; // HTML
  line: LineRef | null;
  collections: CollectionRef[];
  dimensions: Dimension[];
  materials: string | null;
  finishes_note: string | null;
  finishes: {
    group: string;
    items: { id: number; name: string; code: string | null; swatch: Image | null }[];
  }[];
  gallery: Image[];
  model_3d: { url: string; size: number | null } | null; // null se não houver GLB ou 3D desligado
  files: DownloadFile[];
  line_products: ProductCard[]; // outras peças da mesma linha (até 8)
  related: ProductCard[]; // mesma área e categoria (até 8)
  seo: Seo;
  locale_fallback: boolean;
};
```

## Leitura

| Método e rota             | Parâmetros                                                                                               | Resposta `data`                                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /home`               |                                                                                                          | `{ banners: Banner[], featured_products: ProductCard[], featured_collections: CollectionCard[], current_launch: LaunchCard \| null, designers: DesignerCard[] }` |
| `GET /areas`              |                                                                                                          | `Area[]` (`AreaRef` + `description`, `cover`, `product_count`, `seo`)                                                                                            |
| `GET /areas/{key}`        |                                                                                                          | `Area` + `categories: (CategoryRef & { product_count, cover })[]` (só categorias com produto na área)                                                            |
| `GET /categories`         | `area?`                                                                                                  | `(CategoryRef & { cover, product_count })[]`                                                                                                                     |
| `GET /categories/{slug}`  |                                                                                                          | `CategoryRef` + `description`, `cover`, `seo`, `slugs`                                                                                                           |
| `GET /products`           | `area?` `category?` `designer?` `collection?` `line?` `finish?` `launch?` `q?` `sort?` `page` `per_page` | paginado `ProductCard[]`                                                                                                                                         |
| `GET /products/facets`    | `area?` `category?` `q?`                                                                                 | `{ categories, designers, collections, lines, finish_groups }`, cada opção `{ slug \| id, name, count }`                                                         |
| `GET /products/{slug}`    |                                                                                                          | `ProductDetail`                                                                                                                                                  |
| `GET /collections`        |                                                                                                          | `CollectionCard[]` (`CollectionRef` + `summary`, `cover`, `product_count`)                                                                                       |
| `GET /collections/{slug}` |                                                                                                          | `CollectionCard` + `description`, `gallery`, `designers: DesignerRef[]`, `products: ProductCard[]`, `seo`, `slugs`                                               |
| `GET /designers`          |                                                                                                          | `DesignerCard[]` (`DesignerRef` + `short_bio`, `portrait`, `location`)                                                                                           |
| `GET /designers/{slug}`   |                                                                                                          | `DesignerCard` + `bio`, `website_url`, `instagram_url`, `products: ProductCard[]`, `collections: CollectionRef[]`, `seo`                                         |
| `GET /launches`           |                                                                                                          | `LaunchCard[]` (`id`, `slug`, `title`, `year`, `summary`, `cover`)                                                                                               |
| `GET /launches/{slug}`    |                                                                                                          | `LaunchCard` + `description`, `gallery`, `products: ProductCard[]`, `seo`, `slugs`                                                                               |
| `GET /projects`           | `type?`                                                                                                  | paginado `ProjectCard[]` (`id`, `slug`, `type`, `title`, `client_name`, `location`, `year`, `summary`, `cover`)                                                  |
| `GET /projects/{slug}`    |                                                                                                          | `ProjectCard` + `architect`, `description`, `gallery`, `products: ProductCard[]`, `seo`, `slugs`                                                                 |
| `GET /clients`            |                                                                                                          | `{ id, name, url, logo }[]`                                                                                                                                      |
| `GET /stores`             | `state?` `type?`                                                                                         | `Store[]` + `meta.states: string[]` (UFs com loja)                                                                                                               |
| `GET /finishes`           |                                                                                                          | `{ id, name, items: { id, name, code, description, swatch }[] }[]` (por grupo)                                                                                   |
| `GET /banners`            | `placement` (default `home_hero`)                                                                        | `Banner[]` (`title`, `subtitle`, `cta_label`, `cta_url`, `image`, `image_mobile`) dentro da janela de exibição                                                   |
| `GET /pages/{key}`        |                                                                                                          | `{ key, title, intro, content: Block[], cover, seo }` (blocos com textos já no idioma pedido, ver `Block` abaixo)                                                |
| `GET /settings`           |                                                                                                          | configurações públicas (ver shape completo abaixo)                                                                                                               |
| `GET /downloads`          | `area?` `category?` `q?` `page`                                                                          | paginado `ProductCard & { files: DownloadFile[] }` (só produtos com arquivo publicado)                                                                           |
| `GET /search`             | `q` (mín. 2 caracteres)                                                                                  | `{ products: ProductCard[], designers: DesignerCard[], collections: CollectionCard[] }` (até 12, 6, 6)                                                           |
| `GET /sitemap`            |                                                                                                          | `{ type, key?, slugs: Record<Locale, string \| null>, updated_at }[]` de tudo que é público (para `sitemap.xml`)                                                 |
| `GET /redirects`          |                                                                                                          | `{ from, to, status }[]` ativos                                                                                                                                  |

`sort` em `/products`: `featured` (default: destaque, `sort_order`, nome), `name`, `newest`.
Filtros por `category`, `collection` e `launch` usam o slug no idioma pedido; `designer` e `line` usam o slug
único; `finish` usa o id; `area` usa a key.

`Store`: `id`, `name`, `type`, `address`, `address_complement`, `district`, `city`, `state`, `postal_code`,
`country`, `latitude`, `longitude`, `phone`, `whatsapp`, `email`, `website_url`, `instagram_url`,
`opening_hours`.

`key` em `/sitemap` (opcional, presente só nestes dois tipos):

- `type: 'category'`: a `key` da área (`indoor` \| `outdoor`) — uma entrada por par (área, categoria) que
  tem produto publicado, não uma por categoria, já que o front roteia categoria sob a área
  (`/indoor/[categoria]` vs `/outdoor/[categoria]`).
- `type: 'page'`: a própria `key` da página (a mesma que `GET /pages/{key}` recebe, ex. `home`, `privacy`).
  Página não tem slug por idioma — é identificada só pela `key` — então `slugs.pt` e `slugs.en` vêm `null`.

Nos demais tipos (`product`, `collection`, `designer`, `launch`, `project`) `key` não aparece.
`designer` usa slug único (não traduzível): `slugs.pt` e `slugs.en` trazem o mesmo valor.

### `Block` (conteúdo de `GET /pages/{key}`)

Um bloco é `{ type, data }`; `data` já vem resolvido para o idioma pedido (nunca `{pt, en}`). Só
`rich_text.body` e `image_text.body` são HTML sanitizado — todo o resto, **incluindo o `intro` da
página**, é texto simples. Imagens (`image`, `images[]`) são paths do disco `media`, resolvidos para URL
absoluta.

```ts
type Block =
  | { type: 'rich_text'; data: { body: string } } // HTML
  | { type: 'image'; data: { image: string; caption: string | null } }
  | {
      type: 'image_text';
      data: {
        image: string;
        heading: string | null;
        body: string; // body: HTML
        image_position: 'left' | 'right';
      };
    }
  | { type: 'timeline'; data: { items: { year: string; title: string; text: string }[] } }
  | { type: 'faq'; data: { items: { question: string; answer: string }[] } }
  | { type: 'stats'; data: { items: { value: string; label: string }[] } }
  | { type: 'quote'; data: { text: string; author: string | null } }
  | { type: 'cta'; data: { heading: string | null; body: string | null; label: string; url: string } }
  | { type: 'gallery'; data: { images: string[]; caption: string | null } };
```

### `GET /settings`

Espelha `App\Settings\GeneralSettings` **sem** `contact_recipients` (nunca exposto na API pública).

```ts
type Settings = {
  company_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  factory_address: string | null;
  quotes_whatsapp: string | null; // só dígitos, com DDI
  assistance_whatsapp: string | null;
  assistance_phone: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  pinterest_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  footer_documents: { label: string; url: string }[]; // label no idioma pedido, url absoluta
};
```

## Escrita

Rotas chamadas direto do navegador (CORS liberado só para `FRONTEND_URL`), para que limite de taxa e
Turnstile vejam o IP real do visitante.

### `POST /contact`

```jsonc
{
  "type": "quote", // quote | assistance | partnership | press | other
  "name": "Ana",
  "email": "ana@exemplo.com",
  "phone": "+55 11 99999-0000",
  "company": null,
  "profession": "architect",
  "city": "São Paulo",
  "state": "SP",
  "message": "Gostaria de um orçamento...",
  "product_id": 12, // opcional
  "locale": "pt",
  "source_url": "https://franccino.com.br/pt/produtos/cadeira-aura",
  "consent": true, // obrigatório
  "turnstile_token": "...", // obrigatório quando TURNSTILE_SECRET_KEY estiver configurada
}
```

`201 { "data": { "received": true } }`. Envia e-mail para os destinatários das configurações (fila).
Limite: 5 por minuto por IP (`429`).

### `POST /newsletter`

`{ "email", "name"?, "locale", "source"?, "consent": true, "turnstile_token"? }`.
`201` na primeira inscrição e `200` se o e-mail já existir (resposta idêntica, sem revelar cadastro).
Limite: 5 por minuto por IP.

### `POST /downloads/{file}/link`

Sem corpo. Gera URL temporária (10 minutos) para o arquivo e grava `download_logs`.
`201 { "data": { "url": "...", "expires_at": "..." } }`. Arquivo inexistente ou não publicado: `404`.
Limite: 30 por minuto por IP.

## Limites e cabeçalhos

- Leitura: 300 requisições por minuto por IP. Requisições com `X-Frontend-Key` válido (servidor do Next)
  não têm limite.
- Toda resposta de leitura envia `Cache-Control: no-store`; o cache fica no Next (tags + revalidação).
- `OPTIONS` (preflight) liberado para as rotas de escrita.

## Revalidação do front

Ao salvar ou excluir conteúdo no painel, o back-end enfileira um POST para
`{FRONTEND_REVALIDATE_URL}` com cabeçalho `x-revalidate-secret` e corpo `{ "tags": ["products", "home"] }`.
Tags são por tipo de recurso: `home`, `areas`, `categories`, `products`, `lines`, `designers`,
`collections`, `launches`, `projects`, `clients`, `stores`, `finishes`, `banners`, `pages`, `settings`,
`redirects`. Sem URL configurada, nada é enviado.
