'use server';

import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getProductDetails, search } from '@/lib/api/catalog';
import { normalizeSuggestQuery, suggestedProductSlugs, type Suggestion, toSuggestions } from './suggest';

/** Sugestões da busca do cabeçalho. Entrada do navegador: idioma e texto são validados aqui. */
export async function suggestSearch(locale: string, query: string): Promise<Suggestion[]> {
  const q = normalizeSuggestQuery(query);
  if (!q) {
    return [];
  }
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  try {
    const result = await search(safeLocale, q);
    // Sem o detalhe (API lenta ou fora), a sugestão sai só com foto e nome.
    const details = await getProductDetails(safeLocale, suggestedProductSlugs(result)).catch(() => []);
    return toSuggestions(result, details);
  } catch {
    return [];
  }
}
