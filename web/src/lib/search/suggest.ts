import type { AreaRef, Dimension, Image, ProductDetail, SearchResult } from '@/lib/api/types';
import { primaryDimension, PREVIEW_COUNT } from '@/lib/catalog/technical';
import { galleryImages } from '@/lib/product/gallery';

/** O que a linha de uma peça mostra, como na tabela técnica (retorno de 09/11/2026). */
export type SuggestionFacts = {
  category: string;
  area: AreaRef['key'];
  line: string;
  designer: string | null;
  dimension: Dimension | null;
};

export type Suggestion = {
  kind: 'product' | 'designer' | 'collection';
  slug: string;
  name: string;
  /** Capa da peça ou da coleção, retrato do designer. */
  image: Image | null;
  /** Só peças: categoria, linha, designer e medida, e as fotos que se abrem no hover. */
  facts?: SuggestionFacts;
  preview?: Image[];
};

export const MIN_QUERY_LENGTH = 2;
export const MAX_QUERY_LENGTH = 80;

const LIMITS = { product: 6, designer: 2, collection: 2 } as const;

/** Texto digitado pronto para a API, ou null quando ainda é curto demais. */
export function normalizeSuggestQuery(raw: string): string | null {
  const query = raw.trim().replace(/\s+/g, ' ').slice(0, MAX_QUERY_LENGTH);
  return query.length >= MIN_QUERY_LENGTH ? query : null;
}

/** As peças das sugestões (as que ganham os dados da tabela técnica). */
export function suggestedProductSlugs(result: SearchResult): string[] {
  return result.products.slice(0, LIMITS.product).map((item) => item.slug);
}

/**
 * Junta o resultado da busca numa lista curta: peças primeiro, depois designers e coleções. Com o detalhe de cada
 * peça, a linha dela ganha categoria, linha, designer, medida e as fotos do hover, como na tabela técnica.
 */
export function toSuggestions(result: SearchResult, details: ProductDetail[] = []): Suggestion[] {
  const bySlug = new Map(details.map((detail) => [detail.slug, detail]));
  return [
    ...result.products.slice(0, LIMITS.product).map((item) => {
      const detail = bySlug.get(item.slug);
      return {
        kind: 'product' as const,
        slug: item.slug,
        name: item.name,
        image: item.cover,
        ...(detail
          ? {
              facts: {
                category: detail.category.name,
                area: detail.area.key,
                line: detail.area.brand_name,
                designer: detail.designer?.name ?? null,
                dimension: primaryDimension(detail.dimensions),
              },
              preview: galleryImages(detail).slice(0, PREVIEW_COUNT),
            }
          : {}),
      };
    }),
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
