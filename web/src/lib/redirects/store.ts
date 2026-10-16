import { defaultLocale } from '@/i18n/config';
import { getRedirects } from '@/lib/api/content';
import { buildRedirectIndex, type RedirectIndex } from './match';

const TTL_MS = 5 * 60 * 1000;
let cache: { index: RedirectIndex; expires: number } | null = null;

/**
 * Redirect index kept in the proxy's process memory (Next's data cache does not apply in the proxy).
 * Reloads every 5 minutes; if the API fails, keeps the last good index.
 */
export async function loadRedirectIndex(now: number = Date.now()): Promise<RedirectIndex> {
  if (cache && cache.expires > now) {
    return cache.index;
  }
  try {
    const index = buildRedirectIndex(await getRedirects(defaultLocale));
    cache = { index, expires: now + TTL_MS };
    return index;
  } catch {
    const fallback = cache?.index ?? new Map();
    cache = { index: fallback, expires: now + TTL_MS };
    return fallback;
  }
}

export function resetRedirectCacheForTests(): void {
  cache = null;
}
