import type { Locale } from '@/i18n/config';
import type { Image, ProductCard } from '@/lib/api/types';
import { pickSource } from '@/lib/images/srcset';
import type { QuoteFinish, QuoteImage, QuoteItem, QuoteItemInput } from './types';

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

/**
 * Troca a miniatura guardada de cada peça pela capa atual do catálogo (`covers`, pelo id da peça; retorno de
 * 16/11/2026: depois de uma troca de capa, a lista ficava sem foto até a peça sair e voltar). Peça fora de `covers`
 * fica como está; sem mudança, devolve a mesma lista.
 */
export function refreshQuoteImages(items: QuoteItem[], covers: Record<number, Image | null>): QuoteItem[] {
  let changed = false;
  const next = items.map((item) => {
    if (!(item.productId in covers)) return item;
    const cover = covers[item.productId];
    const image = cover ? { src: pickSource(cover, SNAPSHOT_IMAGE_WIDTH), alt: cover.alt } : null;
    if (image?.src === item.image?.src) return item;
    changed = true;
    return { ...item, image };
  });
  return changed ? next : items;
}
