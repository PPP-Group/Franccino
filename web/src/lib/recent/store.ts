import { useSyncExternalStore } from 'react';
import type { ProductCard } from '@/lib/api/types';
import { createLocalStore } from '@/lib/ui/local-store';

/**
 * Peças que a pessoa viu, guardadas no navegador, para dar continuidade à navegação no fim das páginas ("Peças que
 * você viu"). Guarda só o necessário para o card (foto e nome), as mais recentes primeiro.
 */

export type RecentProduct = Pick<ProductCard, 'id' | 'slug' | 'name' | 'cover' | 'is_new'>;

export const RECENT_LIMIT = 12;

function isRecent(value: unknown): value is RecentProduct {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'number' && typeof item.slug === 'string' && typeof item.name === 'string';
}

export function parseRecent(raw: string | null): RecentProduct[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter(isRecent).slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
}

/** A peça vista vai para o começo da lista, sem repetir, e a lista não passa do limite. */
export function addRecent(list: RecentProduct[], product: RecentProduct): RecentProduct[] {
  return [product, ...list.filter((item) => item.id !== product.id)].slice(0, RECENT_LIMIT);
}

const EMPTY: RecentProduct[] = [];

export const recentStore = createLocalStore<RecentProduct[]>({
  key: 'franccino:recent-products',
  parse: parseRecent,
  empty: EMPTY,
});

export function recordRecent(product: ProductCard): void {
  const { id, slug, name, cover, is_new } = product;
  recentStore.set(addRecent(recentStore.get(), { id, slug, name, cover, is_new }));
}

export function useRecentProducts(): RecentProduct[] {
  return useSyncExternalStore(recentStore.subscribe, recentStore.get, () => EMPTY);
}
