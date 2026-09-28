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
