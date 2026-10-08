import type { Image, SearchResult } from '@/lib/api/types';

export type Suggestion = {
  kind: 'product' | 'designer' | 'collection';
  slug: string;
  name: string;
  /** Capa da peça ou da coleção, retrato do designer. */
  image: Image | null;
};

export const MIN_QUERY_LENGTH = 2;
export const MAX_QUERY_LENGTH = 80;

const LIMITS = { product: 6, designer: 2, collection: 2 } as const;

/** Texto digitado pronto para a API, ou null quando ainda é curto demais. */
export function normalizeSuggestQuery(raw: string): string | null {
  const query = raw.trim().replace(/\s+/g, ' ').slice(0, MAX_QUERY_LENGTH);
  return query.length >= MIN_QUERY_LENGTH ? query : null;
}

/** Junta o resultado da busca numa lista curta: peças primeiro, depois designers e coleções. */
export function toSuggestions(result: SearchResult): Suggestion[] {
  return [
    ...result.products
      .slice(0, LIMITS.product)
      .map((item) => ({ kind: 'product' as const, slug: item.slug, name: item.name, image: item.cover })),
    ...result.designers.slice(0, LIMITS.designer).map((item) => ({
      kind: 'designer' as const,
      slug: item.slug,
      name: item.name,
      image: item.portrait,
    })),
    ...result.collections.slice(0, LIMITS.collection).map((item) => ({
      kind: 'collection' as const,
      slug: item.slug,
      name: item.name,
      image: item.cover,
    })),
  ];
}
