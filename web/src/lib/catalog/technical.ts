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

/** Quantas fotos saem da linha da tabela no hover (capa e as primeiras da galeria), abertas lado a lado. */
export const PREVIEW_COUNT = 4;

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

/**
 * Linhas da tabela técnica com as peças que têm medida primeiro, mantendo a ordem do catálogo dentro de cada grupo
 * (retorno de 07/11/2026: a tabela não deve abrir com linhas vazias).
 */
export function withDimensionsFirst(rows: TechnicalRow[]): TechnicalRow[] {
  return [...rows.filter((row) => row.dimension !== null), ...rows.filter((row) => row.dimension === null)];
}
