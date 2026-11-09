import type { Image, ProductDetail } from '@/lib/api/types';

/** Capa primeiro, seguida da galeria, sem repetir uma imagem já usada como capa. */
export function galleryImages(product: Pick<ProductDetail, 'cover' | 'gallery'>): Image[] {
  const list = product.cover ? [product.cover, ...product.gallery] : [...product.gallery];
  const seen = new Set<number>();
  return list.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

/** Largura real da foto grande da página da peça (palco da galeria); também serve ao carrossel, que a baixa antes. */
export const STAGE_SIZES = '(max-width: 61.25rem) 92vw, (min-width: 97.5rem) 810px, 52vw';
