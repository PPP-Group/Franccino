import { describe, expect, it } from 'vitest';
import { productCard, productDetail } from '@/test/fixtures';
import { toProductCard } from './card';

describe('toProductCard', () => {
  it('leva ao card só os campos do card', () => {
    expect(toProductCard(productDetail({ name: 'Poltrona Maria' }))).toEqual(
      productCard({ name: 'Poltrona Maria' }),
    );
  });
});
