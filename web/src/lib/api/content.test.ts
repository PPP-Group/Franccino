import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCollection, getDesigner, getHome, getLaunch, getProject } from './content';

const okJson = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

/** Reads the `next.tags` array off the single `fetch` call the mock recorded. */
function tagsFromLastCall(fetchMock: ReturnType<typeof vi.spyOn>): unknown {
  const [, init] = fetchMock.mock.calls[0] as [unknown, RequestInit & { next?: { tags?: unknown } }];
  return init.next?.tags;
}

describe('content cache tags', () => {
  beforeEach(() => {
    vi.stubEnv('API_URL', 'http://api.test');
    vi.stubEnv('SITE_URL', 'http://site.test');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('getHome tags every resource it embeds', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ data: {} }));
    await getHome('pt');
    expect(tagsFromLastCall(fetchMock)).toEqual([
      'home',
      'banners',
      'products',
      'collections',
      'launches',
      'designers',
    ]);
  });

  it('getCollection tags collections, products and designers', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ data: null }));
    await getCollection('pt', 'linha-aura');
    expect(tagsFromLastCall(fetchMock)).toEqual(['collections', 'products', 'designers']);
  });

  it('getDesigner tags designers, products and collections', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ data: null }));
    await getDesigner('pt', 'ana-silva');
    expect(tagsFromLastCall(fetchMock)).toEqual(['designers', 'products', 'collections']);
  });

  it('getLaunch tags launches and products', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ data: null }));
    await getLaunch('pt', 'lancamento-2026');
    expect(tagsFromLastCall(fetchMock)).toEqual(['launches', 'products']);
  });

  it('getProject tags projects and products', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ data: null }));
    await getProject('pt', 'residencia-x');
    expect(tagsFromLastCall(fetchMock)).toEqual(['projects', 'products']);
  });

  it('encodes a slug with special characters into the request path', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson({ data: null }));
    await getCollection('pt', 'linha/aura?x');
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(String(url)).toContain('/collections/linha%2Faura%3Fx');
  });
});
