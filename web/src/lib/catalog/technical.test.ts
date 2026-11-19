import { describe, expect, it } from 'vitest';
import { productDetail } from '@/test/fixtures';
import { toProductCard } from './card';
import { primaryDimension, toTechnicalRow, withDimensionsFirst, withFilesFirst } from './technical';

describe('technical rows', () => {
  it('picks the first dimension that has a value', () => {
    const empty = {
      label: 'Base',
      width: null,
      depth: null,
      height: null,
      seat_height: null,
      diameter: null,
    };
    const round = { label: null, width: null, depth: null, height: 750, seat_height: null, diameter: 1300 };
    expect(primaryDimension([empty, round])).toBe(round);
    expect(primaryDimension([empty])).toBeNull();
  });

  it('keeps only card fields, the main dimension and the files', () => {
    const file = {
      id: 9,
      type: 'technical_sheet' as const,
      title: 'Ficha técnica',
      format: 'PDF',
      size: 1_200_000,
    };
    const detail = productDetail({ files: [file] });
    expect(toProductCard(detail)).toEqual({
      id: 12,
      slug: 'cadeira-aura',
      name: 'Cadeira Aura',
      area: detail.area,
      category: detail.category,
      designer: detail.designer,
      cover: detail.cover,
      is_new: true,
    });
    expect(toTechnicalRow(detail)).toEqual({
      product: toProductCard(detail),
      dimension: detail.dimensions[0],
      files: [file],
      preview: [detail.cover, ...detail.gallery].filter(Boolean).slice(0, 5),
      colors: [],
    });
  });

  it('previews three photos and keeps one more for the stack, cover first, without repeating it', () => {
    const detail = productDetail();
    const cover = detail.cover;
    if (!cover) {
      throw new Error('fixture sem capa');
    }
    const extra = (id: number) => ({ ...cover, id, src: `/foto-${id}.jpg` });
    const row = toTechnicalRow({
      ...detail,
      gallery: [cover, extra(2), extra(3), extra(4), extra(5), extra(6)],
    });
    expect(row.preview?.map((image) => image.id)).toEqual([cover.id, 2, 3, 4]);
  });

  it('puts the covers of the other colours in the preview, skipping colours without a cover', () => {
    const detail = productDetail();
    const cover = detail.cover;
    if (!cover) {
      throw new Error('fixture sem capa');
    }
    const color = (id: number, withCover = true) => ({
      id,
      slug: `cor-${id}`,
      name: `Cor ${id}`,
      color: null,
      cover: withCover ? { ...cover, id: id * 10 } : null,
    });
    const row = toTechnicalRow({ ...detail, colors: [color(1), color(2, false), color(3)] });
    expect(row.colors?.map((image) => image.id)).toEqual([10, 30]);
  });
});

describe('withDimensionsFirst', () => {
  it('puts the rows with a dimension first and keeps the catalogue order inside each group', () => {
    const base = toTechnicalRow(productDetail());
    const rows = [
      { ...base, dimension: null, product: { ...base.product, id: 1 } },
      { ...base, product: { ...base.product, id: 2 } },
      { ...base, dimension: null, product: { ...base.product, id: 3 } },
      { ...base, product: { ...base.product, id: 4 } },
    ];
    expect(withDimensionsFirst(rows).map((row) => row.product.id)).toEqual([2, 4, 1, 3]);
  });
});

describe('withFilesFirst', () => {
  it('puts the pieces with files first and keeps the order inside each group', () => {
    const row = (id: number, files: number) =>
      ({
        product: { id },
        dimension: null,
        files: Array.from({ length: files }, (_, index) => ({ id: index })),
      }) as never;
    const rows = [row(1, 0), row(2, 1), row(3, 0), row(4, 2)];
    expect(withFilesFirst(rows).map((item: { product: { id: number } }) => item.product.id)).toEqual([
      2, 4, 1, 3,
    ]);
  });
});
