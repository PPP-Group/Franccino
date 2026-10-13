import { afterEach, describe, expect, it, vi } from 'vitest';

const getRedirects = vi.fn();
vi.mock('@/lib/api/content', () => ({ getRedirects: (...args: unknown[]) => getRedirects(...args) }));

const { loadRedirectIndex, resetRedirectCacheForTests } = await import('./store');

describe('loadRedirectIndex', () => {
  afterEach(() => {
    resetRedirectCacheForTests();
    getRedirects.mockReset();
  });

  it('caches the index for five minutes', async () => {
    getRedirects.mockResolvedValue([{ from: '/a', to: '/pt', status: 301 }]);
    await loadRedirectIndex(0);
    await loadRedirectIndex(60_000);
    expect(getRedirects).toHaveBeenCalledTimes(1);
    await loadRedirectIndex(6 * 60_000);
    expect(getRedirects).toHaveBeenCalledTimes(2);
  });

  it('keeps the last good index when the API fails', async () => {
    getRedirects.mockResolvedValueOnce([{ from: '/a', to: '/pt', status: 301 }]);
    await loadRedirectIndex(0);
    getRedirects.mockRejectedValueOnce(new Error('down'));
    const index = await loadRedirectIndex(10 * 60_000);
    expect(index.size).toBe(1);
  });
});
