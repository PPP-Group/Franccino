import type { Locale } from '@/i18n/config';
import { serverEnv } from '@/lib/env';
import type { CacheTag } from './types';

const DEFAULT_REVALIDATE = 3600;

export type ApiGetOptions<T> = {
  locale: Locale;
  query?: Record<string, string | number | undefined>;
  tags: CacheTag[];
  revalidate?: number | false;
  fallback?: T;
};

/** Thrown for any non-OK API response (4xx/5xx). */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message = `A API respondeu ${status}.`) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function buildUrl(
  apiUrl: string,
  path: string,
  locale: Locale,
  query: ApiGetOptions<unknown>['query'],
): string {
  const url = new URL(`${apiUrl}/api/v1${path}`);
  url.searchParams.set('locale', locale);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function readErrorBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Fetches `path` from the Laravel API (`${API_URL}/api/v1${path}`), tagging
 * the request for Next's data cache. Reads `serverEnv()` on every call
 * (rather than once at module load) so it always reflects the current
 * environment — this is also what lets tests use `vi.stubEnv`.
 */
export async function apiGet<T>(path: string, options: ApiGetOptions<T>): Promise<T> {
  const { locale, query, tags, revalidate = DEFAULT_REVALIDATE, fallback } = options;
  const env = serverEnv();
  const url = buildUrl(env.API_URL, path, locale, query);

  const headers = new Headers({ Accept: 'application/json' });
  if (env.FRONTEND_API_KEY) {
    headers.set('X-Frontend-Key', env.FRONTEND_API_KEY);
  }

  let response: Response;
  try {
    response = await fetch(url, { headers, next: { tags, revalidate } });
  } catch (error) {
    if (env.ALLOW_BUILD_WITHOUT_API && fallback !== undefined) {
      return fallback;
    }
    throw error;
  }

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(response.status, body, `A API respondeu ${response.status} para ${path}.`);
  }

  return (await response.json()) as T;
}

/** Same as `apiGet`, but resolves to `null` instead of throwing on a 404. */
export async function apiGetOrNull<T>(path: string, options: ApiGetOptions<T>): Promise<T | null> {
  try {
    return await apiGet<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
