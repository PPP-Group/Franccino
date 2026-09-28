'use server';

import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { loadPlannerProducts } from './data';
import { parsePlannerQuery } from './query';
import type { PlannerProduct } from './types';

const SEARCH_LIMIT = 12;

/** Busca da biblioteca da sala. Entrada do navegador: idioma e texto são validados aqui. */
export async function searchPlannerPieces(locale: string, query: string): Promise<PlannerProduct[]> {
  const q = parsePlannerQuery(query);
  if (!q) {
    return [];
  }
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  return loadPlannerProducts(safeLocale, { q, per_page: SEARCH_LIMIT });
}
