import { afterEach, describe, expect, it, vi } from 'vitest';
import { productCard, productDetail } from '@/test/fixtures';
import { loadPlannerProducts } from './data';

const json = (body: unknown) =>
  new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });

describe('loadPlannerProducts', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps only pieces with a footprint', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/products')) {
        return json({
          data: [productCard({ slug: 'aura' }), productCard({ id: 13, slug: 'painel' })],
          links: { first: null, last: null, prev: null, next: null },
          meta: { current_page: 1, last_page: 1, per_page: 24, total: 2 },
        });
      }
      const slug = url.pathname.split('/').pop();
      return slug === 'painel'
        ? json({
            data: productDetail({
              id: 13,
              slug: 'painel',
              dimensions: [
                { label: null, width: 1200, depth: null, height: 800, seat_height: null, diameter: null },
              ],
            }),
          })
        : json({ data: productDetail({ slug: 'aura' }) });
    });
    const products = await loadPlannerProducts('pt', { q: 'aura', per_page: 12 });
    expect(products.map((product) => product.slug)).toEqual(['aura']);
  });
});
