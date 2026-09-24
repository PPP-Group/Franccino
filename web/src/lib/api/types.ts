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

export type Seo = { title: string | null; description: string | null; image: Image | null };

export type AreaRef = { key: 'indoor' | 'outdoor'; name: string; brand_name: string };
export type CategoryRef = { id: number; slug: string; name: string; singular_name: string };
export type DesignerRef = { id: number; slug: string; name: string };
export type LineRef = { id: number; slug: string; name: string };
export type CollectionRef = { id: number; slug: string; name: string; year: number | null };

export type Dimension = {
  label: string | null;
  width: number | null;
  depth: number | null;
  height: number | null;
  seat_height: number | null;
  diameter: number | null;
};

export type DownloadFile = {
  id: number;
  type: 'technical_sheet' | 'block_2d' | 'block_3d' | 'manual' | 'other';
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
  is_new: boolean;
};

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
  model_3d: { url: string; size: number | null } | null;
  files: DownloadFile[];
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
  designers: DesignerRef[];
  products: ProductCard[];
  seo: Seo;
  slugs: Record<Locale, string | null>;
};

export type DesignerCard = DesignerRef & {
  short_bio: string | null;
  portrait: Image | null;
  location: string | null;
};

export type DesignerDetail = DesignerCard & {
  bio: string | null;
  website_url: string | null;
  instagram_url: string | null;
  products: ProductCard[];
  collections: CollectionRef[];
  seo: Seo;
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
  seo: Seo;
  slugs: Record<Locale, string | null>;
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
};

export type ProjectDetail = ProjectCard & {
  architect: string | null;
  description: string | null;
  gallery: Image[];
  products: ProductCard[];
  seo: Seo;
  slugs: Record<Locale, string | null>;
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

export type Banner = {
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_url: string | null;
  image: Image;
  image_mobile: Image | null;
};

/**
 * A content block inside `PageContent.content`. The contract names the type
 * but never documents its internal shape (block kinds/fields), so it is kept
 * as a minimal, discriminated-by-`type` bag until the API defines it further.
 */
export type Block = {
  type: string;
  data: Record<string, unknown>;
};

export type PageContent = {
  key: string;
  title: string;
  intro: string | null;
  content: Block[];
  cover: Image | null;
  seo: Seo;
};

/**
 * Public settings. The contract only describes this in prose ("contatos,
 * WhatsApp, redes, documentos do rodapé com URL") without listing fields, so
 * this shape is a best-effort guess pending confirmation from the API team.
 */
export type Settings = {
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  social_links: { platform: string; url: string }[];
  footer_documents: { title: string; url: string }[];
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

export type RedirectRule = {
  from: string;
  to: string;
  status: number;
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
  | 'pages'
  | 'settings'
  | 'redirects';
