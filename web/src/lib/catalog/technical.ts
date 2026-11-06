import type { Dimension, DownloadFile, Image, ProductCard, ProductDetail } from '@/lib/api/types';
import { galleryImages } from '@/lib/product/gallery';
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

/** Quantas fotos saem da linha da tabela no hover (capa e as primeiras da galeria). */
export const PREVIEW_COUNT = 3;

export type TechnicalRow = {
  product: ProductCard;
  dimension: Dimension | null;
  files: DownloadFile[];
  /** Fotos que flutuam perto do ponteiro no hover da linha (só desktop); sem elas, a linha não mostra prévia. */
  preview?: Image[];
};

export function toTechnicalRow(detail: ProductDetail): TechnicalRow {
  return {
    product: toProductCard(detail),
    dimension: primaryDimension(detail.dimensions),
    files: detail.files,
    preview: galleryImages(detail).slice(0, PREVIEW_COUNT),
  };
}
