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

/**
 * Quantas fotos saem da linha da tabela no hover (capa e as primeiras da galeria), abertas lado a lado. Com mais
 * fotos, a última vira uma pilha (retorno de 16/11/2026), por isso a prévia guarda uma a mais.
 */
export const PREVIEW_COUNT = 3;

/** As fotos da prévia: as que aparecem e uma a mais, para saber se a última vira pilha. */
export function previewImages(images: Image[]): Image[] {
  return images.slice(0, PREVIEW_COUNT + 1);
}

/** As capas das outras cores da peça, para a linha de cima da prévia. */
export function colorCovers(product: Pick<ProductCard, 'colors'>): Image[] {
  return previewImages((product.colors ?? []).flatMap((color) => (color.cover ? [color.cover] : [])));
}

export type TechnicalRow = {
  product: ProductCard;
  dimension: Dimension | null;
  files: DownloadFile[];
  /** Fotos que flutuam perto do ponteiro no hover da linha (só desktop); sem elas, a linha não mostra prévia. */
  preview?: Image[];
  /** Capas das outras cores da peça (linha de cima da prévia). */
  colors?: Image[];
};

export function toTechnicalRow(detail: ProductDetail): TechnicalRow {
  return {
    product: toProductCard(detail),
    dimension: primaryDimension(detail.dimensions),
    files: detail.files,
    preview: previewImages(galleryImages(detail)),
    colors: colorCovers(detail),
  };
}

/** Downloads (reunião de 18/11/2026): as peças com arquivo primeiro, na ordem do catálogo dentro de cada grupo. */
export function withFilesFirst(rows: TechnicalRow[]): TechnicalRow[] {
  return [...rows.filter((row) => row.files.length > 0), ...rows.filter((row) => row.files.length === 0)];
}

/**
 * Linhas da tabela técnica com as peças que têm medida primeiro, mantendo a ordem do catálogo dentro de cada grupo
 * (retorno de 07/11/2026: a tabela não deve abrir com linhas vazias).
 */
export function withDimensionsFirst(rows: TechnicalRow[]): TechnicalRow[] {
  return [...rows.filter((row) => row.dimension !== null), ...rows.filter((row) => row.dimension === null)];
}
