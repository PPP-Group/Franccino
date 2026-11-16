import { useSyncExternalStore } from 'react';
import type { Locale } from '@/i18n/config';
import type { Image, ProductCard } from '@/lib/api/types';
import { createLocalStore } from '@/lib/ui/local-store';

/**
 * Peças que a pessoa viu, guardadas no navegador, para dar continuidade à navegação no fim das páginas ("Peças que
 * você viu"). Guarda só o necessário para o card (foto e nome), as mais recentes primeiro.
 */

/**
 * `slug` e `name` são os do idioma em que a peça foi vista (`locale`). `slugs` e `names` guardam os de cada idioma: o
 * endereço da peça muda com o idioma, e o link salvo em português abria uma página de erro no `/en` (retorno de
 * 16/11/2026). Peças salvas antes disso não têm os três campos.
 */
export type RecentProduct = Pick<ProductCard, 'id' | 'slug' | 'name' | 'cover' | 'is_new'> & {
  locale?: Locale;
  slugs?: Partial<Record<Locale, string>>;
  names?: Partial<Record<Locale, string>>;
};

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

/** A peça como foi vista agora, somando os nomes já guardados dela em outros idiomas. */
export function seenProduct(
  product: Pick<ProductCard, 'id' | 'slug' | 'name' | 'cover' | 'is_new'>,
  locale: Locale,
  slugs: Partial<Record<Locale, string | null>>,
  previous?: RecentProduct,
): RecentProduct {
  const { id, slug, name, cover, is_new } = product;
  const known: Partial<Record<Locale, string>> = {};
  for (const [key, value] of Object.entries(slugs) as [Locale, string | null][]) {
    if (value) known[key] = value;
  }
  known[locale] = slug;
  return {
    id,
    slug,
    name,
    cover,
    is_new,
    locale,
    slugs: known,
    names: { ...previous?.names, [locale]: name },
  };
}

/**
 * As peças com o endereço e o nome do idioma da página. Sem o endereço desse idioma (peça salva antes de 16/11/2026, em
 * outro idioma), a peça fica de fora: o link levaria a uma página que não existe. As salvas sem idioma eram do português.
 */
export function localizeRecent(list: RecentProduct[], locale: Locale): RecentProduct[] {
  return list.flatMap((item) => {
    const slug = item.slugs?.[locale] ?? ((item.locale ?? 'pt') === locale ? item.slug : undefined);
    if (!slug) return [];
    const name = item.names?.[locale] ?? item.name;
    return [{ ...item, slug, name }];
  });
}

/**
 * Troca a capa guardada de cada peça pela atual do catálogo (`covers`, pelo id; retorno de 16/11/2026: a troca de capa
 * deixava "Peças que você viu" sem foto). Sem mudança, devolve a mesma lista.
 */
export function refreshRecentCovers(
  list: RecentProduct[],
  covers: Record<number, Image | null>,
): RecentProduct[] {
  let changed = false;
  const next = list.map((item) => {
    if (!(item.id in covers)) return item;
    const cover = covers[item.id];
    if ((cover?.src ?? null) === (item.cover?.src ?? null)) return item;
    changed = true;
    return { ...item, cover };
  });
  return changed ? next : list;
}

export function recordRecent(
  product: ProductCard,
  locale: Locale,
  slugs: Partial<Record<Locale, string | null>> = {},
): void {
  const list = recentStore.get();
  const previous = list.find((item) => item.id === product.id);
  recentStore.set(addRecent(list, seenProduct(product, locale, slugs, previous)));
}

export function useRecentProducts(): RecentProduct[] {
  return useSyncExternalStore(recentStore.subscribe, recentStore.get, () => EMPTY);
}
