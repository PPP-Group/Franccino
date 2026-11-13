/**
 * Types mirroring `docs/api.md` (API pública v1). Field names and shapes are
 * kept identical to the contract so the client stays a thin, typed layer over
 * the Laravel API.
 *
 * A few endpoints in the contract are described in prose rather than as a
 * TypeScript shape (`Settings`, `Block`). Those are typed as narrowly as the
 * contract allows; see the task report for the specific assumptions made.
 */

import type { Locale } from '@/i18n/config';

// ---------------------------------------------------------------------------
// Common types
// ---------------------------------------------------------------------------

export type Image = {
  id: number;
  alt: string;
  width: number | null;
  height: number | null;
  src: string;
  srcset: { width: number; url: string }[];
  blur_data_url: string | null;
};

/** Vídeo da página de projeto ou coleção (MP4 do próprio site, tocado só no clique); a capa dá o formato do quadro. */
export type PageVideo = { url: string; poster: Image | null };

export type Seo = { title: string | null; description: string | null; image: Image | null };

export type AreaRef = { key: 'indoor' | 'outdoor'; name: string; brand_name: string };
export type CategoryRef = { id: number; slug: string; name: string; singular_name: string };
export type DesignerRef = { id: number; slug: string; name: string };
export type LineRef = { id: number; slug: string; name: string };
export type CollectionRef = { id: number; slug: string; name: string; year: number | null };

export type Dimension = {
  label: string | null;
  width: number | null;
  /** Medida flexível (revisão de 12/11/2026): de `width` a `width_max`. Ausente na API antiga. */
  width_max?: number | null;
  depth: number | null;
  depth_max?: number | null;
  height: number | null;
  height_max?: number | null;
  seat_height: number | null;
  diameter: number | null;
};

export type MediaLink = {
  id: number;
  kind: 'video' | 'link';
  title: string;
  url: string;
  /** Player address (YouTube no-cookie or Vimeo); null for links and for videos from other hosts. */
  embed_url: string | null;
};

export type DownloadFile = {
  id: number;
  type: 'technical_sheet' | 'block_2d' | 'block_3d' | 'manual' | 'catalog' | 'presentation' | 'other';
  title: string;
  format: string;
  size: number | null;
};

export type ProductCard = {
  id: number;
  slug: string;
  name: string;
  area: AreaRef;
  category: CategoryRef;
  designer: DesignerRef | null;
  cover: Image | null;
  /**
   * Foto sem fundo (PNG/WebP transparente) do carrossel com a peça em destaque. Opcional no tipo enquanto a API
   * publicada não manda o campo; sem ela, o carrossel usa a capa.
   */
  cutout?: Image | null;
  is_new: boolean;
};

export type ProductVariant = { id: number; slug: string; name: string; image: Image | null };

export type ProductDetail = ProductCard & {
  slugs: Record<Locale, string | null>;
  sku: string | null;
  tagline: string | null;
  description: string | null;
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
  /** O GLB fica em disco privado: o visualizador pede o link na hora (`requestModelLink`). */
  /** Vista de cima (planta) para a sala para montar; sem ela, a sala usa a capa (item 29). */
  top_view?: Image | null;
  /** Ambientes da peça (item 8). */
  rooms?: string[];
  /** Outras versões publicadas da peça (item 13). */
  variants?: ProductVariant[];
  model_3d: { size: number | null } | null;
  files: DownloadFile[];
  media_links: MediaLink[];
  line_products: ProductCard[];
  related: ProductCard[];
  seo: Seo;
  locale_fallback: boolean;
};

// ---------------------------------------------------------------------------
// Reading resources
// ---------------------------------------------------------------------------

export type Area = AreaRef & {
  description: string | null;
  cover: Image | null;
  product_count: number;
  seo: Seo;
};

export type Category = CategoryRef & {
  description: string | null;
  cover: Image | null;
  seo: Seo;
  slugs: Record<Locale, string | null>;
};

export type CollectionCard = CollectionRef & {
  summary: string | null;
  cover: Image | null;
  product_count: number;
};

export type CollectionDetail = CollectionCard & {
  description: string | null;
  gallery: Image[];
  video?: PageVideo | null;
  designers: DesignerRef[];
  products: ProductCard[];
  seo: Seo;
  slugs: Record<Locale, string | null>;
  /** Algum texto veio em português por falta da versão no idioma pedido (`docs/api.md`). */
  locale_fallback: boolean;
};

export type DesignerCard = DesignerRef & {
  short_bio: string | null;
  portrait: Image | null;
  location: string | null;
};

export type DesignerDetail = DesignerCard & {
  bio: string | null;
  /** Assinatura (logo) do designer, enviada no painel; `null` sem ela. */
  signature?: Image | null;
  website_url: string | null;
  instagram_url: string | null;
  products: ProductCard[];
  collections: CollectionRef[];
  media_links: MediaLink[];
  files: DownloadFile[];
  seo: Seo;
  /** Algum texto veio em português por falta da versão no idioma pedido (`docs/api.md`). */
  locale_fallback: boolean;
};

export type LaunchCard = {
  id: number;
  slug: string;
  title: string;
  year: number | null;
  summary: string | null;
  cover: Image | null;
};

export type LaunchDetail = LaunchCard & {
  description: string | null;
  gallery: Image[];
  products: ProductCard[];
  media_links: MediaLink[];
  files: DownloadFile[];
  seo: Seo;
  slugs: Record<Locale, string | null>;
  /** Algum texto veio em português por falta da versão no idioma pedido (`docs/api.md`). */
  locale_fallback: boolean;
};

export type ProjectCard = {
  id: number;
  slug: string;
  /** Project type. Not enumerated in the contract, kept as a free-form string. */
  type: string;
  title: string;
  client_name: string | null;
  location: string | null;
  year: number | null;
  summary: string | null;
  cover: Image | null;
  /** Foto com pontos clicáveis ligada ao projeto no painel (Corporativo e página do projeto); `null` sem ela. */
  scene?: Scene | null;
};

export type ProjectDetail = ProjectCard & {
  architect: string | null;
  description: string | null;
  /** Peça escolhida no painel para o lado do texto (retorno de 12/11/2026); só se publicada. */
  featured_product?: ProductCard | null;
  gallery: Image[];
  video?: PageVideo | null;
  products: ProductCard[];
  seo: Seo;
  slugs: Record<Locale, string | null>;
  /** Algum texto veio em português por falta da versão no idioma pedido (`docs/api.md`). */
  locale_fallback: boolean;
};

export type Client = { id: number; name: string; url: string | null; logo: Image | null };

export type Store = {
  id: number;
  name: string;
  /** Store type. Not enumerated in the contract, kept as a free-form string. */
  type: string;
  address: string;
  address_complement: string | null;
  district: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website_url: string | null;
  instagram_url: string | null;
  /** Not structured in the contract; treated as pre-formatted display text. */
  opening_hours: string | null;
  /** Texto curto da loja (Anexo I). */
  description: string | null;
  image: Image | null;
};

export type FinishGroup = {
  id: number;
  name: string;
  items: {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    swatch: Image | null;
  }[];
};

/**
 * Ambiente com pontos clicáveis (banco de ideias, ideia 7). `x` e `y` em % da foto (0–100), a partir da esquerda e do
 * topo; só vêm pontos de peças publicadas.
 */
export type Scene = {
  id: number;
  title: string;
  image: Image;
  hotspots: { x: number; y: number; product: ProductCard }[];
};

/** Todos os campos são opcionais no painel; a API não preenche banner incompleto (docs/api.md). */
export type Banner = {
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_url: string | null;
  image: Image | null;
  image_mobile: Image | null;
  /** MP4 curto, sem som, tocado em loop no lugar da foto (banco de ideias, ideia 14); a foto vira o pôster. */
  video: string | null;
};

/**
 * A content block inside `PageContent.content`. Shapes mirror
 * `docs/data-model.md` ("pages" → "content é uma lista ... de blocos"):
 * translatable fields arrive already resolved to the requested locale (plain
 * strings, not `{pt, en}`), and only `rich_text.body` / `image_text.body` are
 * HTML — every other text field is plain text.
 */
export type RichTextBlockData = { body: string };

export type ImageBlockData = { image: string; caption: string | null };

export type ImageTextBlockData = {
  image: string;
  heading: string | null;
  body: string;
  image_position: 'left' | 'right';
};

export type TimelineBlockData = { items: { year: string; title: string; text: string }[] };

export type FaqBlockData = { items: { question: string; answer: string }[] };

export type StatsBlockData = { items: { value: string; label: string }[] };

export type QuoteBlockData = { text: string; author: string | null };

export type CtaBlockData = { heading: string | null; body: string | null; label: string; url: string };

export type GalleryBlockData = { images: string[]; caption: string | null };

/** `embed_url` só para YouTube ou Vimeo; outro endereço vira link simples. */
export type VideoBlockData = {
  url: string | null;
  embed_url: string | null;
  /** Arquivo de vídeo enviado no painel (MP4), tocado no próprio site; tem prioridade sobre `url`. */
  file: string | null;
  poster: string | null;
  title: string | null;
};

export type Block =
  | { type: 'rich_text'; data: RichTextBlockData }
  | { type: 'image'; data: ImageBlockData }
  | { type: 'image_text'; data: ImageTextBlockData }
  | { type: 'timeline'; data: TimelineBlockData }
  | { type: 'faq'; data: FaqBlockData }
  | { type: 'stats'; data: StatsBlockData }
  | { type: 'quote'; data: QuoteBlockData }
  | { type: 'cta'; data: CtaBlockData }
  | { type: 'gallery'; data: GalleryBlockData }
  | { type: 'video'; data: VideoBlockData };

export type PageContent = {
  key: string;
  title: string;
  intro: string | null;
  content: Block[];
  cover: Image | null;
  /** Peça em destaque ao lado do título, escolhida no painel (só publicada). Ausente na API antiga. */
  featured_product?: ProductCard | null;
  seo: Seo;
  /** Algum texto veio em português por falta da versão no idioma pedido (`docs/api.md`). */
  locale_fallback: boolean;
};

/**
 * Configurações públicas (`GET /settings`): espelha `GeneralSettings` do P2
 * sem `contact_recipients`. Documentado em `docs/api.md` pelo lado da API
 * (P2 T11, ver ruling R4/R10 do pre-flight do P4 — evita conflito de merge
 * em `docs/api.md` entre as branches `web` e `api`).
 */
export type Settings = {
  company_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  factory_address: string | null;
  /** Só dígitos, com DDI (ex.: "5511942900080"). */
  quotes_whatsapp: string | null;
  assistance_whatsapp: string | null;
  assistance_phone: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  pinterest_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  /** Rótulo no idioma pedido e URL absoluta. */
  footer_documents: { label: string; url: string }[];
};

export type Home = {
  banners: Banner[];
  featured_products: ProductCard[];
  featured_collections: CollectionCard[];
  current_launch: LaunchCard | null;
  designers: DesignerCard[];
};

type FacetOption =
  { slug: string; name: string; count: number } | { id: number; name: string; count: number };

export type Facets = {
  categories: FacetOption[];
  designers: FacetOption[];
  collections: FacetOption[];
  lines: FacetOption[];
  finish_groups: FacetOption[];
  /** Ambientes com peça (item 8), na ordem da API; o site traduz a chave. Ausente em respostas antigas. */
  rooms?: { key: string; count: number }[];
};

export type SearchResult = {
  products: ProductCard[];
  designers: DesignerCard[];
  collections: CollectionCard[];
};

export type SitemapEntry = {
  type: string;
  /**
   * For `type: 'category'`, the area key (`'indoor' | 'outdoor'`, mirrors
   * `AreaRef.key`) the category belongs to — needed to route to
   * `/indoor/[category]` vs `/outdoor/[category]`. For `type: 'page'`, the
   * page's own key (the same identifier `GET /pages/{key}` takes, e.g.
   * `'home'`, `'privacy'`) — pages are identified by this stable key, not by
   * a per-locale slug. Confirmed with the API team (P2 T11 `SitemapTest`);
   * pending the `docs/api.md` update on their side.
   */
  key?: string;
  slugs: Record<Locale, string | null>;
  updated_at: string;
};

/** `to` is `null` for `410`; `from` ending in `/*` matches everything under the prefix (docs/api.md). */
export type RedirectRule = {
  from: string;
  to: string | null;
  status: 301 | 302 | 410;
};

// ---------------------------------------------------------------------------
// Envelopes
// ---------------------------------------------------------------------------

export type Paginated<T> = {
  data: T[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

export type Item<T> = { data: T };

// ---------------------------------------------------------------------------
// Cache tags
// ---------------------------------------------------------------------------

/** Revalidation tags, mirroring the list in `docs/api.md` ("Revalidação do front"). */
export type CacheTag =
  | 'home'
  | 'areas'
  | 'categories'
  | 'products'
  | 'lines'
  | 'designers'
  | 'collections'
  | 'launches'
  | 'projects'
  | 'clients'
  | 'stores'
  | 'finishes'
  | 'banners'
  | 'scenes'
  | 'pages'
  | 'settings'
  | 'redirects';

/** `GET /quote-lists/{code}`: lista de desejos compartilhada por link (retorno de 12/11/2026). */
export type SharedList = {
  code: string;
  created_at: string | null;
  expires_at: string;
  items: {
    product: ProductCard;
    quantity: number;
    finishes: { id: number; name: string; code: string | null; swatch: Image | null }[];
    note: string | null;
  }[];
};
