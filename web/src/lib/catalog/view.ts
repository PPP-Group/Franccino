/**
 * View mode (`grid` | `table`) and query-building shared by every product
 * listing (`/products`, `/indoor`, `/outdoor`, category routes and the
 * launch detail page). Kept pure so it's testable without Next or next-intl.
 */

import type { ProductListParams, ProductSort } from '@/lib/api/catalog';
import { firstValue } from '@/lib/api/listing-params';
import type { Facets } from '@/lib/api/types';

export type CatalogView = 'grid' | 'table';

/** Reads a repeated query key the same way `parseListingParams` does (first value wins). */
export function parseCatalogView(value: string | string[] | undefined): CatalogView {
  return firstValue(value) === 'table' ? 'table' : 'grid';
}

export type ListingPatch = {
  category?: string;
  designer?: string;
  q?: string;
  sort?: ProductSort;
  page?: number;
  view?: CatalogView;
};

const QUERY_KEYS = ['category', 'designer', 'collection', 'line', 'finish', 'q', 'sort'] as const;

/** Query da listagem (sem `area`, que está na rota). Trocar filtro volta para a página 1. */
export function listingQuery(
  params: ProductListParams,
  view: CatalogView,
  patch: ListingPatch = {},
): Record<string, string> {
  const merged: ProductListParams = { ...params };
  let filtersChanged = false;
  if ('category' in patch) {
    merged.category = patch.category;
    filtersChanged = true;
  }
  if ('designer' in patch) {
    merged.designer = patch.designer;
    filtersChanged = true;
  }
  if ('q' in patch) {
    merged.q = patch.q;
    filtersChanged = true;
  }
  if ('sort' in patch) {
    merged.sort = patch.sort;
    filtersChanged = true;
  }
  if ('page' in patch) {
    merged.page = patch.page;
  } else if (filtersChanged) {
    merged.page = undefined;
  }

  const query: Record<string, string> = {};
  for (const key of QUERY_KEYS) {
    const value = merged[key];
    if (value !== undefined && value !== '') {
      query[key] = String(value);
    }
  }
  if (merged.page !== undefined && merged.page > 1) {
    query.page = String(merged.page);
  }
  if ((patch.view ?? view) === 'table') {
    query.view = 'table';
  }
  return query;
}

export type FacetOption = Facets['categories'][number];
export type FilterOption = { value: string; label: string; count: number | null };

export function toFilterOption(option: FacetOption): FilterOption {
  return {
    value: 'slug' in option ? option.slug : String(option.id),
    label: option.name,
    count: option.count,
  };
}
