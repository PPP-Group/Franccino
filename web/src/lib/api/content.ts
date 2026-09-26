/**
 * Content resources: home, collections, designers, launches, projects,
 * clients, stores, banners, pages, settings, sitemap and redirects. See
 * `docs/api.md` ("Leitura") for the underlying routes.
 */

import type { Locale } from '@/i18n/config';
import { EMPTY_SETTINGS } from '@/lib/settings';
import { apiGet, apiGetOrNull } from './client';
import { emptyPage, EMPTY_HOME } from './empty';
import type {
  Banner,
  CacheTag,
  Client,
  CollectionCard,
  CollectionDetail,
  DesignerCard,
  DesignerDetail,
  Home,
  Item,
  LaunchCard,
  LaunchDetail,
  PageContent,
  Paginated,
  ProjectCard,
  ProjectDetail,
  RedirectRule,
  Settings,
  SitemapEntry,
  Store,
} from './types';

/** Every cache tag in the contract — used for resources that aggregate all content (the sitemap). */
const ALL_CACHE_TAGS: CacheTag[] = [
  'home',
  'areas',
  'categories',
  'products',
  'lines',
  'designers',
  'collections',
  'launches',
  'projects',
  'clients',
  'stores',
  'finishes',
  'banners',
  'pages',
  'settings',
  'redirects',
];

export type ProjectListParams = {
  type?: string;
  page?: number;
  per_page?: number;
};

export type StoreListParams = {
  state?: string;
  type?: string;
};

export type StoreList = {
  stores: Store[];
  /** UFs (Brazilian states) with at least one store. */
  states: string[];
};

export async function getHome(locale: Locale): Promise<Home> {
  // Embeds banners, featured products, featured collections, the current
  // launch and designers — revalidates with all of those resources' tags.
  const { data } = await apiGet<Item<Home>>('/home', {
    locale,
    tags: ['home', 'banners', 'products', 'collections', 'launches', 'designers'],
    fallback: { data: EMPTY_HOME },
  });
  return data;
}

export async function getCollections(locale: Locale): Promise<CollectionCard[]> {
  // Each card carries a `product_count`, so this also revalidates with `products`.
  const { data } = await apiGet<Item<CollectionCard[]>>('/collections', {
    locale,
    tags: ['collections', 'products'],
    fallback: { data: [] },
  });
  return data;
}

export async function getCollection(locale: Locale, slug: string): Promise<CollectionDetail | null> {
  const result = await apiGetOrNull<Item<CollectionDetail | null>>(
    `/collections/${encodeURIComponent(slug)}`,
    {
      locale,
      tags: ['collections', 'products', 'designers'],
      fallback: { data: null },
    },
  );
  return result?.data ?? null;
}

export async function getDesigners(locale: Locale): Promise<DesignerCard[]> {
  const { data } = await apiGet<Item<DesignerCard[]>>('/designers', {
    locale,
    tags: ['designers'],
    fallback: { data: [] },
  });
  return data;
}

export async function getDesigner(locale: Locale, slug: string): Promise<DesignerDetail | null> {
  const result = await apiGetOrNull<Item<DesignerDetail | null>>(`/designers/${encodeURIComponent(slug)}`, {
    locale,
    tags: ['designers', 'products', 'collections'],
    fallback: { data: null },
  });
  return result?.data ?? null;
}

export async function getLaunches(locale: Locale): Promise<LaunchCard[]> {
  const { data } = await apiGet<Item<LaunchCard[]>>('/launches', {
    locale,
    tags: ['launches'],
    fallback: { data: [] },
  });
  return data;
}

export async function getLaunch(locale: Locale, slug: string): Promise<LaunchDetail | null> {
  const result = await apiGetOrNull<Item<LaunchDetail | null>>(`/launches/${encodeURIComponent(slug)}`, {
    locale,
    tags: ['launches', 'products'],
    fallback: { data: null },
  });
  return result?.data ?? null;
}

export async function getProjects(
  locale: Locale,
  params: ProjectListParams = {},
): Promise<Paginated<ProjectCard>> {
  return apiGet<Paginated<ProjectCard>>('/projects', {
    locale,
    query: { ...params },
    tags: ['projects'],
    fallback: emptyPage<ProjectCard>(),
  });
}

export async function getProject(locale: Locale, slug: string): Promise<ProjectDetail | null> {
  const result = await apiGetOrNull<Item<ProjectDetail | null>>(`/projects/${encodeURIComponent(slug)}`, {
    locale,
    tags: ['projects', 'products'],
    fallback: { data: null },
  });
  return result?.data ?? null;
}

export async function getClients(locale: Locale): Promise<Client[]> {
  const { data } = await apiGet<Item<Client[]>>('/clients', {
    locale,
    tags: ['clients'],
    fallback: { data: [] },
  });
  return data;
}

export async function getStores(locale: Locale, params: StoreListParams = {}): Promise<StoreList> {
  const result = await apiGet<Item<Store[]> & { meta: { states: string[] } }>('/stores', {
    locale,
    query: { ...params },
    tags: ['stores'],
    fallback: { data: [], meta: { states: [] } },
  });
  return { stores: result.data, states: result.meta.states };
}

export async function getBanners(locale: Locale, placement = 'home_hero'): Promise<Banner[]> {
  const { data } = await apiGet<Item<Banner[]>>('/banners', {
    locale,
    query: { placement },
    tags: ['banners'],
    fallback: { data: [] },
  });
  return data;
}

export async function getPage(locale: Locale, key: string): Promise<PageContent | null> {
  const result = await apiGetOrNull<Item<PageContent | null>>(`/pages/${encodeURIComponent(key)}`, {
    locale,
    tags: ['pages'],
    fallback: { data: null },
  });
  return result?.data ?? null;
}

export async function getSettings(locale: Locale): Promise<Settings> {
  // Read by every page (via the root layout's Organization JSON-LD), so a
  // fallback keeps `ALLOW_BUILD_WITHOUT_API` builds working end to end.
  const { data } = await apiGet<Item<Settings>>('/settings', {
    locale,
    tags: ['settings'],
    fallback: { data: EMPTY_SETTINGS },
  });
  // Normalizes a real response: a crash guard against a `/settings` payload
  // that omits a field (e.g. `footer_documents`) lives here, once, instead
  // of at every place that reads `Settings`.
  return { ...EMPTY_SETTINGS, ...data, footer_documents: data.footer_documents ?? [] };
}

export async function getSitemap(locale: Locale): Promise<SitemapEntry[]> {
  // `app/sitemap.ts` runs at build time; a fallback keeps
  // `ALLOW_BUILD_WITHOUT_API` builds working without the Laravel API up.
  const { data } = await apiGet<Item<SitemapEntry[]>>('/sitemap', {
    locale,
    tags: ALL_CACHE_TAGS,
    fallback: { data: [] },
  });
  return data;
}

export async function getRedirects(locale: Locale): Promise<RedirectRule[]> {
  const { data } = await apiGet<Item<RedirectRule[]>>('/redirects', { locale, tags: ['redirects'] });
  return data;
}
