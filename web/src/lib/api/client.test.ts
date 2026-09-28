import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGet, apiGetOrNull, ApiError } from './client';

const okJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('apiGet', () => {
  beforeEach(() => {
    vi.stubEnv('API_URL', 'http://api.test');
    vi.stubEnv('SITE_URL', 'http://site.test');
    vi.stubEnv('FRONTEND_API_KEY', 'key-123');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('builds the url with locale and query and sends the frontend key', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ data: [] }));

    await apiGet('/products', {
      locale: 'en',
      query: { area: 'indoor', page: 2, q: undefined },
      tags: ['products'],
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe('http://api.test/api/v1/products?locale=en&area=indoor&page=2');
    expect((init as RequestInit & { next: unknown }).next).toEqual({ tags: ['products'], revalidate: 3600 });
    expect(new Headers((init as RequestInit).headers).get('X-Frontend-Key')).toBe('key-123');
  });

  it('returns null on 404 with apiGetOrNull', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ message: 'Not found.' }, 404));
    await expect(apiGetOrNull('/products/x', { locale: 'pt', tags: ['products'] })).resolves.toBeNull();
  });

  it('throws ApiError on server errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ message: 'boom' }, 500));
    await expect(apiGet('/home', { locale: 'pt', tags: ['home'] })).rejects.toBeInstanceOf(ApiError);
  });

  it('uses the fallback on network errors only when allowed', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fetch failed'));
    vi.stubEnv('ALLOW_BUILD_WITHOUT_API', '');

    await expect(
      apiGet('/home', { locale: 'pt', tags: ['home'], fallback: { data: null } }),
    ).rejects.toThrow();

    vi.stubEnv('ALLOW_BUILD_WITHOUT_API', 'true');
    await expect(
      apiGet('/home', { locale: 'pt', tags: ['home'], fallback: { data: null } }),
    ).resolves.toEqual({
      data: null,
    });
  });
});
