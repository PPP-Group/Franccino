/**
 * Valores vazios reutilizados como `fallback` de `apiGet` (build sem API,
 * `ALLOW_BUILD_WITHOUT_API=true`) por `catalog.ts` e `content.ts`.
 */

import type { Home, Paginated } from './types';

export function emptyPage<T>(): Paginated<T> {
  return {
    data: [],
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: 1, last_page: 1, per_page: 24, total: 0 },
  };
}

export const EMPTY_HOME: Home = {
  banners: [],
  featured_products: [],
  featured_collections: [],
  current_launch: null,
  designers: [],
};
