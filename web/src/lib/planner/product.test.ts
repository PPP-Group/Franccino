import { describe, expect, it } from 'vitest';
import { productDetail } from '@/test/fixtures';
import { toPlannerProduct } from './product';

describe('toPlannerProduct', () => {
  it('uses the main dimension in centimetres', () => {
    expect(toPlannerProduct(productDetail(), 'pt')).toEqual({
      id: 12,
      slug: 'cadeira-aura',
      locale: 'pt',
      name: 'Cadeira Aura',
      category: 'Cadeiras',
      width: 52,
      depth: 56,
      shape: 'rect',
      image: { src: 'https://cdn.test/aura-480.webp', alt: 'Cadeira Aura em fundo branco' },
    });
  });

  it('draws round pieces from the diameter and skips pieces without a footprint', () => {
    const round = productDetail({
      dimensions: [{ label: null, width: null, depth: null, height: 750, seat_height: null, diameter: 1300 }],
    });
    expect(toPlannerProduct(round, 'en')).toMatchObject({ width: 130, depth: 130, shape: 'round' });
    const flat = productDetail({
      dimensions: [{ label: null, width: 600, depth: null, height: 750, seat_height: null, diameter: null }],
    });
    expect(toPlannerProduct(flat, 'pt')).toBeNull();
  });
});
