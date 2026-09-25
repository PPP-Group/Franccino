import type { Locale } from '@/i18n/config';
import type { ProductCard } from '@/lib/api/types';
import { pickSource } from '@/lib/images/srcset';
import type { QuoteFinish, QuoteItemInput } from './types';

/** Largura da conversão guardada para miniaturas da lista e da sala. */
export const SNAPSHOT_IMAGE_WIDTH = 480;

export function toQuoteSnapshot(
  product: ProductCard,
  locale: Locale,
  finishes: QuoteFinish[] = [],
): QuoteItemInput {
  return {
    productId: product.id,
    slug: product.slug,
    locale,
    name: product.name,
    image: product.cover
      ? { src: pickSource(product.cover, SNAPSHOT_IMAGE_WIDTH), alt: product.cover.alt }
      : null,
    finishes,
  };
}
