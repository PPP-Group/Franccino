import type { Locale } from '@/i18n/config';
import type { ProductDetail } from '@/lib/api/types';
import { primaryDimension } from '@/lib/catalog/technical';
import { pickSource } from '@/lib/images/srcset';
import { SNAPSHOT_IMAGE_WIDTH } from '@/lib/quote/snapshot';
import type { PlannerProduct } from './types';

export function toPlannerProduct(detail: ProductDetail, locale: Locale): PlannerProduct | null {
  const dimension = primaryDimension(detail.dimensions);
  if (!dimension) {
    return null;
  }
  const round = dimension.diameter !== null && dimension.width === null;
  const widthMm = dimension.width ?? dimension.diameter;
  const depthMm = dimension.depth ?? dimension.diameter;
  if (widthMm === null || depthMm === null) {
    return null;
  }
  return {
    id: detail.id,
    slug: detail.slug,
    locale,
    name: detail.name,
    category: detail.category.name,
    width: widthMm / 10,
    depth: depthMm / 10,
    shape: round ? 'round' : 'rect',
    image: detail.cover
      ? { src: pickSource(detail.cover, SNAPSHOT_IMAGE_WIDTH), alt: detail.cover.alt }
      : null,
  };
}
