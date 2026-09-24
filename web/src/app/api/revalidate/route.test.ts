import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));

import { revalidateTag } from 'next/cache';
import { POST } from './route';

function makeRequest(body: unknown, secret?: string): Request {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (secret !== undefined) {
    headers.set('x-revalidate-secret', secret);
  }
  return new Request('http://localhost/api/revalidate', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.stubEnv('REVALIDATE_SECRET', 'shh');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('rejects a request without the secret header', async () => {
    const response = await POST(makeRequest({ tags: ['products'] }));
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('rejects a request with the wrong secret', async () => {
    const response = await POST(makeRequest({ tags: ['products'] }, 'nope'));
    expect(response.status).toBe(401);
  });

  it('rejects when REVALIDATE_SECRET is not configured', async () => {
    const original = process.env.REVALIDATE_SECRET;
    delete process.env.REVALIDATE_SECRET;

    try {
      const response = await POST(makeRequest({ tags: ['products'] }, 'anything'));
      expect(response.status).toBe(401);
    } finally {
      if (original !== undefined) {
        process.env.REVALIDATE_SECRET = original;
      }
    }
  });

  it('revalidates every tag with the right secret', async () => {
    const response = await POST(makeRequest({ tags: ['products', 'home'] }, 'shh'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ revalidated: true, tags: ['products', 'home'] });
    expect(revalidateTag).toHaveBeenCalledTimes(2);
    expect(revalidateTag).toHaveBeenNthCalledWith(1, 'products', 'max');
    expect(revalidateTag).toHaveBeenNthCalledWith(2, 'home', 'max');
  });

  it('rejects an unknown tag', async () => {
    const response = await POST(makeRequest({ tags: ['unknown'] }, 'shh'));
    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
