import type { ProductCard, ProductDetail } from '@/lib/api/types';

/** Recorta o detalhe para o formato de card (props enxutas para Client Components). */
export function toProductCard(detail: ProductDetail): ProductCard {
  const { id, slug, name, area, category, designer, cover, is_new, color, colors } = detail;
  return { id, slug, name, area, category, designer, cover, is_new, color, colors };
}
