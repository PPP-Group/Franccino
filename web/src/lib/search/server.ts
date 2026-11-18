import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getProductDetails, search } from '@/lib/api/catalog';
import type { ProductDetail } from '@/lib/api/types';
import { normalizeSuggestQuery, suggestedProductSlugs, type Suggestion, toSuggestions } from './suggest';

/** Prazo do detalhe das peças: passou dele, as sugestões saem só com foto, nome e tipo, sem esperar. */
export const DETAIL_TIMEOUT_MS = 1500;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

/**
 * Sugestões da busca do cabeçalho (rota `GET /api/suggest`). Entrada do navegador: idioma e texto são validados aqui.
 * Era uma server action; virou rota em 17/11/2026 porque a action dependia do id gerado em cada build (a aba aberta
 * antes do deploy pedia um id que não existia mais e as sugestões não apareciam) e as actions rodam uma por vez.
 */
export async function findSuggestions(locale: string, query: string): Promise<Suggestion[]> {
  const q = normalizeSuggestQuery(query);
  if (!q) {
    return [];
  }
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  try {
    const result = await search(safeLocale, q);
    // Sem o detalhe (API lenta ou fora), a sugestão sai só com foto e nome.
    const details = await withTimeout<ProductDetail[]>(
      getProductDetails(safeLocale, suggestedProductSlugs(result)),
      DETAIL_TIMEOUT_MS,
      [],
    );
    return toSuggestions(result, details);
  } catch {
    return [];
  }
}
