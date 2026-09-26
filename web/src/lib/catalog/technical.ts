import type { Dimension, DownloadFile, ProductCard, ProductDetail } from '@/lib/api/types';
import { toProductCard } from './card';

export function primaryDimension(dimensions: Dimension[]): Dimension | null {
  return (
    dimensions.find((dimension) =>
      [dimension.width, dimension.depth, dimension.height, dimension.diameter].some(
        (value) => value !== null,
      ),
    ) ?? null
  );
}

export type TechnicalRow = { product: ProductCard; dimension: Dimension | null; files: DownloadFile[] };

export function toTechnicalRow(detail: ProductDetail): TechnicalRow {
  return {
    product: toProductCard(detail),
    dimension: primaryDimension(detail.dimensions),
    files: detail.files,
  };
}
