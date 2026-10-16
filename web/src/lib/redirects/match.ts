import type { RedirectRule } from '@/lib/api/types';

export type RedirectIndex = Map<string, RedirectRule>;

const PREFIX = '/*';

/** Same rule as the API's `LegacyPath::normalize`: no trailing slash (except the root), query keys sorted. */
export function normalizeLegacyPath(pathname: string, search: string): string {
  const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.replace(/\/+$/, '') || '/' : pathname;
  const params = new URLSearchParams(search);
  params.sort();
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function buildRedirectIndex(rules: RedirectRule[]): RedirectIndex {
  const index: RedirectIndex = new Map();
  for (const rule of rules) {
    const url = new URL(rule.from, 'https://legado.invalid');
    // `URL` keeps `*` as is, so prefix rules keep their `/*` key.
    index.set(normalizeLegacyPath(url.pathname, url.search), rule);
  }
  return index;
}

/**
 * Exact path and query first; then the path alone (ignores `utm_*` and the like); then the longest
 * `/*` prefix rule.
 */
export function findRedirect(index: RedirectIndex, pathname: string, search: string): RedirectRule | null {
  const exact =
    index.get(normalizeLegacyPath(pathname, search)) ?? index.get(normalizeLegacyPath(pathname, ''));
  if (exact) {
    return exact;
  }
  const segments = normalizeLegacyPath(pathname, '').split('/').filter(Boolean);
  for (let length = segments.length; length > 0; length--) {
    const rule = index.get(`/${segments.slice(0, length).join('/')}${PREFIX}`);
    if (rule) {
      return rule;
    }
  }
  return null;
}

/** Only paths without a locale prefix (or the root with a query) can come from the old site. */
export function isLegacyCandidate(pathname: string, search: string, locales: readonly string[]): boolean {
  const first = pathname.split('/')[1] ?? '';
  if (locales.includes(first)) {
    return false;
  }
  return pathname !== '/' || search.length > 1;
}
