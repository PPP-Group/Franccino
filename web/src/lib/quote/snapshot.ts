import type { Locale } from '@/i18n/config';
import type { Image, ProductCard } from '@/lib/api/types';
import { pickSource } from '@/lib/images/srcset';
import type { QuoteFinish, QuoteImage, QuoteItemInput } from './types';

/** Largura da conversão guardada para miniaturas da lista e da sala. */
export const SNAPSHOT_IMAGE_WIDTH = 480;

export function toQuoteSnapshot(
  product: Pick<ProductCard, 'id' | 'slug' | 'name' | 'cover'>,
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

/**
 * A miniatura guardada no navegador (lista e sala) no formato que `MorphImage` usa, para ela crescer até a página da
 * peça (ideia 10). Decorativa: o nome está sempre ao lado.
 */
export function snapshotAsImage(image: QuoteImage): Image {
  return { id: 0, alt: '', width: 480, height: 360, src: image.src, srcset: [], blur_data_url: null };
}
