'use server';

import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getProducts } from '@/lib/api/catalog';
import type { Paginated, ProductCard } from '@/lib/api/types';
import { sanitizeListQuery } from './load-more';

/** Tamanho da página das listagens (o mesmo de `CatalogListing`). */
const PER_PAGE = 24;

/**
 * Peças da página seguinte para o "Ver mais" das listagens (revisão da Franccino, 12/11/2026, item 11). Entrada do
 * navegador: idioma, filtros e página são validados aqui.
 */
export async function loadMorePieces(
  locale: string,
  query: unknown,
  page: number,
): Promise<Paginated<ProductCard> | null> {
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const safePage = Number.isInteger(page) && page > 1 && page < 1000 ? page : 2;
  try {
    return await getProducts(safeLocale, { ...sanitizeListQuery(query), page: safePage, per_page: PER_PAGE });
  } catch {
    return null;
  }
}
