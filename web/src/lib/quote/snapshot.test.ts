import { describe, expect, it } from 'vitest';
import { productCard } from '@/test/fixtures';
import { toQuoteSnapshot } from './snapshot';

describe('toQuoteSnapshot', () => {
  it('keeps what the list needs to render without the api', () => {
    const finish = { id: 101, group: 'Madeira', name: 'Nogueira', code: 'MD-05' };
    expect(toQuoteSnapshot(productCard(), 'en', [finish])).toEqual({
      productId: 12,
      slug: 'cadeira-aura',
      locale: 'en',
      name: 'Cadeira Aura',
      image: { src: 'https://cdn.test/aura-480.webp', alt: 'Cadeira Aura em fundo branco' },
      finishes: [finish],
    });
  });

  it('handles products without a cover', () => {
    expect(toQuoteSnapshot(productCard({ cover: null }), 'pt').image).toBeNull();
  });
});
