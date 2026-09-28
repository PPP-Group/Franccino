import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { productCard, productDetail } from '@/test/fixtures';
import {
  getAllProductSlugs,
  getArea,
  getCategories,
  getProduct,
  getProductDetails,
  getProducts,
} from './catalog';

const okJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Reads the `next.tags` array off the single `fetch` call the mock recorded. */
function tagsFromLastCall(fetchMock: ReturnType<typeof vi.spyOn>): unknown {
  const [, init] = fetchMock.mock.calls[0] as [unknown, RequestInit & { next?: { tags?: unknown } }];
  return init.next?.tags;
}

describe('catalog cache tags', () => {
  beforeEach(() => {
    vi.stubEnv('API_URL', 'http://api.test');
    vi.stubEnv('SITE_URL', 'http://site.test');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('getArea tags areas, categories and products (embeds categories with product_count)', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ data: null }));
    await getArea('pt', 'indoor');
    expect(tagsFromLastCall(fetchMock)).toEqual(['areas', 'categories', 'products']);
  });

  it('getCategories tags categories and products (each item has a product_count)', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ data: [] }));
    await getCategories('pt');
    expect(tagsFromLastCall(fetchMock)).toEqual(['categories', 'products']);
  });

  it('getProducts tags products, areas, categories and designers (each card embeds those refs)', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(okJson({ data: [], links: {}, meta: {} }));
    await getProducts('pt');
    expect(tagsFromLastCall(fetchMock)).toEqual(['products', 'areas', 'categories', 'designers']);
  });

  it('getProduct additionally tags lines and collections (its own embeds)', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ data: null }));
    await getProduct('pt', 'cadeira-aura');
    expect(tagsFromLastCall(fetchMock)).toEqual([
      'products',
      'areas',
      'categories',
      'designers',
      'lines',
      'collections',
    ]);
  });

  it('getProducts with a `q` filter bypasses the data cache (revalidate: 0)', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(okJson({ data: [], links: {}, meta: {} }));
    await getProducts('pt', { q: 'cadeira' });
    const [, init] = fetchMock.mock.calls[0] as [unknown, RequestInit & { next?: { revalidate?: unknown } }];
    expect(init.next?.revalidate).toBe(0);
  });

  it('getProducts without a `q` filter keeps the default revalidation window', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(okJson({ data: [], links: {}, meta: {} }));
    await getProducts('pt');
    const [, init] = fetchMock.mock.calls[0] as [unknown, RequestInit & { next?: { revalidate?: unknown } }];
    expect(init.next?.revalidate).toBe(3600);
  });

  it('encodes a slug with special characters into the request path', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ data: null }));
    await getProduct('pt', 'cadeira/aura?x');
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(String(url)).toContain('/products/cadeira%2Faura%3Fx');
  });
});

describe('getProductDetails', () => {
  beforeEach(() => {
    vi.stubEnv('API_URL', 'http://api.test');
    vi.stubEnv('SITE_URL', 'http://site.test');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('fetches each slug, keeps the order and drops the missing ones', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const slug = /\/products\/([^?]+)/.exec(String(input))?.[1] ?? '';
      return slug === 'sumida'
        ? okJson({ message: 'Not found.' }, 404)
        : okJson({ data: productDetail({ slug, name: slug }) });
    });
    const details = await getProductDetails('pt', ['b', 'sumida', 'a']);
    expect(details.map((detail) => detail.slug)).toEqual(['b', 'a']);
  });
});

describe('getAllProductSlugs', () => {
  beforeEach(() => {
    vi.stubEnv('API_URL', 'http://api.test');
    vi.stubEnv('SITE_URL', 'http://site.test');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('walks every page of the listing', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const page = Number(new URL(String(input)).searchParams.get('page') ?? '1');
      return okJson({
        data: [productCard({ slug: `p${page}` })],
        links: { first: null, last: null, prev: null, next: null },
        meta: { current_page: page, last_page: 3, per_page: 48, total: 3 },
      });
    });
    await expect(getAllProductSlugs('pt')).resolves.toEqual(['p1', 'p2', 'p3']);
  });
});
