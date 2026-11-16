import { describe, expect, it } from 'vitest';
import { productCard } from '@/test/fixtures';
import type { Image } from '@/lib/api/types';
import { refreshQuoteImages, toQuoteSnapshot } from './snapshot';
import type { QuoteItem } from './types';

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

describe('refreshQuoteImages', () => {
  const item = (productId: number, src: string | null): QuoteItem => ({
    productId,
    slug: `peca-${productId}`,
    locale: 'pt',
    name: `Peça ${productId}`,
    image: src ? { src, alt: '' } : null,
    finishes: [],
    quantity: 1,
    note: '',
  });
  const cover = (src: string): Image => ({
    id: 9,
    alt: 'Capa',
    width: 480,
    height: 360,
    src,
    srcset: [],
    blur_data_url: null,
  });

  it('swaps the stored thumbnail for the current cover and keeps the rest', () => {
    const items = [item(1, 'https://api/old.webp'), item(2, 'https://api/same.webp'), item(3, null)];
    const next = refreshQuoteImages(items, {
      1: cover('https://api/new.webp'),
      2: cover('https://api/same.webp'),
    });
    expect(next[0].image).toEqual({ src: 'https://api/new.webp', alt: 'Capa' });
    expect(next[1]).toBe(items[1]);
    expect(next[2]).toBe(items[2]);
  });

  it('returns the same list when nothing changed', () => {
    const items = [item(1, 'https://api/same.webp')];
    expect(refreshQuoteImages(items, { 1: cover('https://api/same.webp') })).toBe(items);
  });
});
