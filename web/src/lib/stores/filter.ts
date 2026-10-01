import type { Store } from '@/lib/api/types';

/** Tipos de loja do `docs/data-model.md` (a API manda texto livre; o filtro só oferece estes). */
export const STORE_TYPES = ['exclusive', 'reseller'] as const;

type StoreFilter = { state: string | null; type: string | null };

/** `null` = sem filtro naquele campo. */
export function filterStores(stores: Store[], { state, type }: StoreFilter): Store[] {
  return stores.filter(
    (store) => (state === null || store.state === state) && (type === null || store.type === type),
  );
}
