'use server';

import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { search } from '@/lib/api/catalog';
import { normalizeSuggestQuery, type Suggestion, toSuggestions } from './suggest';

/** Sugestões da busca do cabeçalho. Entrada do navegador: idioma e texto são validados aqui. */
export async function suggestSearch(locale: string, query: string): Promise<Suggestion[]> {
  const q = normalizeSuggestQuery(query);
  if (!q) {
    return [];
  }
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  try {
    return toSuggestions(await search(safeLocale, q));
  } catch {
    return [];
  }
}
