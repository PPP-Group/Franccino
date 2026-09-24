/**
 * Catalog resources: areas, categories, products, finishes, downloads and
 * search. See `docs/api.md` ("Leitura") for the underlying routes.
 */

import type { Locale } from '@/i18n/config';
import { apiGet, apiGetOrNull } from './client';
import type {
  Area,
  Category,
  CategoryRef,
  DownloadFile,
  Facets,
  FinishGroup,
  Image,
  Item,
  Paginated,
  ProductCard,
  ProductDetail,
  SearchResult,
} from './types';

export type AreaDetail = Area & {
  categories: (CategoryRef & { product_count: number; cover: Image | null })[];
};

export type CategoryListItem = CategoryRef & { cover: Image | null; product_count: number };

export type ProductSort = 'featured' | 'name' | 'newest';

export type ProductListParams = {
  area?: string;
  category?: string;
  designer?: string;
  collection?: string;
  line?: string;
  finish?: number | string;
  launch?: string;
  q?: string;
  sort?: ProductSort;
  page?: number;
  per_page?: number;
};

export type ProductFacetsParams = {
  area?: string;
  category?: string;
  q?: string;
};

export type DownloadsParams = {
  area?: string;
  category?: string;
  q?: string;
  page?: number;
};

/** Empty `Paginated`, used as the `ALLOW_BUILD_WITHOUT_API` fallback for listing endpoints below. */
function emptyPaginated<T>(): Paginated<T> {
  return {
    data: [],
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: 1, last_page: 1, per_page: 24, total: 0 },
  };
}

export async function getAreas(locale: Locale): Promise<Area[]> {
  const { data } = await apiGet<Item<Area[]>>('/areas', { locale, tags: ['areas'], fallback: { data: [] } });
  return data;
}

export async function getArea(locale: Locale, key: string): Promise<AreaDetail | null> {
  const result = await apiGetOrNull<Item<AreaDetail | null>>(`/areas/${key}`, {
    locale,
    tags: ['areas'],
    fallback: { data: null },
  });
  return result?.data ?? null;
}

export async function getCategories(
  locale: Locale,
  params: { area?: string } = {},
): Promise<CategoryListItem[]> {
  const { data } = await apiGet<Item<CategoryListItem[]>>('/categories', {
    locale,
    query: { area: params.area },
    tags: ['categories'],
    fallback: { data: [] },
  });
  return data;
}

export async function getCategory(locale: Locale, slug: string): Promise<Category | null> {
  const result = await apiGetOrNull<Item<Category | null>>(`/categories/${slug}`, {
    locale,
    tags: ['categories'],
    fallback: { data: null },
  });
  return result?.data ?? null;
}

export async function getProducts(
  locale: Locale,
  params: ProductListParams = {},
): Promise<Paginated<ProductCard>> {
  return apiGet<Paginated<ProductCard>>('/products', {
    locale,
    query: { ...params },
    tags: ['products'],
    fallback: emptyPaginated<ProductCard>(),
  });
}

export async function getProductFacets(locale: Locale, params: ProductFacetsParams = {}): Promise<Facets> {
  const { data } = await apiGet<Item<Facets>>('/products/facets', {
    locale,
    query: { ...params },
    tags: ['products'],
    fallback: { data: { categories: [], designers: [], collections: [], lines: [], finish_groups: [] } },
  });
  return data;
}

export async function getProduct(locale: Locale, slug: string): Promise<ProductDetail | null> {
  const result = await apiGetOrNull<Item<ProductDetail | null>>(`/products/${slug}`, {
    locale,
    tags: ['products'],
    fallback: { data: null },
  });
  return result?.data ?? null;
}

export async function getFinishes(locale: Locale): Promise<FinishGroup[]> {
  const { data } = await apiGet<Item<FinishGroup[]>>('/finishes', {
    locale,
    tags: ['finishes'],
    fallback: { data: [] },
  });
  return data;
}

export async function getDownloads(
  locale: Locale,
  params: DownloadsParams = {},
): Promise<Paginated<ProductCard & { files: DownloadFile[] }>> {
  return apiGet<Paginated<ProductCard & { files: DownloadFile[] }>>('/downloads', {
    locale,
    query: { ...params },
    // No dedicated "downloads" cache tag in the contract; downloads are a
    // filtered view of products, so they revalidate with `products`.
    tags: ['products'],
    fallback: emptyPaginated<ProductCard & { files: DownloadFile[] }>(),
  });
}

export async function search(locale: Locale, q: string): Promise<SearchResult> {
  const { data } = await apiGet<Item<SearchResult>>('/search', {
    locale,
    query: { q },
    // No dedicated "search" cache tag; tag with everything a result can
    // contain (see `SearchResult`) so it revalidates with any of them.
    tags: ['products', 'designers', 'collections'],
    fallback: { data: { products: [], designers: [], collections: [] } },
  });
  return data;
}
