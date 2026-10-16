import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { locales } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import { serverEnv } from '@/lib/env';
import { findRedirect, isLegacyCandidate } from '@/lib/redirects/match';
import { loadRedirectIndex } from '@/lib/redirects/store';
import { checkBasicAuth } from '@/lib/security/basic-auth';

const handleI18nRouting = createMiddleware(routing);

const ROBOTS_HEADER = 'X-Robots-Tag';
const ROBOTS_VALUE = 'noindex, nofollow';

/**
 * URLs of the old WordPress site (`/produto/x/`, `/?taxonomy=linhas&term=y`, `/wp-content/…`), from
 * `GET /redirects`. Runs before the locale routing, which would send them to `/pt/produto/x` (404).
 */
async function legacyRedirect(request: NextRequest): Promise<NextResponse | null> {
  const { pathname, search } = request.nextUrl;
  if (!isLegacyCandidate(pathname, search, locales)) {
    return null;
  }
  const rule = findRedirect(await loadRedirectIndex(), pathname, search);
  if (!rule) {
    // Old uploads without a rule have no page to fall back to: a plain 404, not `/pt/wp-content/…`.
    return pathname.startsWith('/wp-content/') ? new NextResponse(null, { status: 404 }) : null;
  }
  if (rule.status === 410 || rule.to === null) {
    return new NextResponse(null, { status: 410 });
  }
  return NextResponse.redirect(new URL(rule.to, request.url), rule.status === 302 ? 302 : 301);
}

export async function proxy(request: NextRequest) {
  const env = serverEnv();

  if (env.SITE_ENV === 'staging') {
    const { STAGING_BASIC_AUTH_USER: user, STAGING_BASIC_AUTH_PASSWORD: password } = env;
    const header = request.headers.get('authorization');
    const authorized = user !== undefined && password !== undefined && checkBasicAuth(header, user, password);

    if (!authorized) {
      return new NextResponse(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Franccino staging"',
          [ROBOTS_HEADER]: ROBOTS_VALUE,
        },
      });
    }
  }

  const legacy = await legacyRedirect(request);
  if (legacy) {
    if (env.SITE_ENV === 'staging') {
      legacy.headers.set(ROBOTS_HEADER, ROBOTS_VALUE);
    }
    return legacy;
  }

  const response = handleI18nRouting(request);

  if (env.SITE_ENV === 'staging') {
    response.headers.set(ROBOTS_HEADER, ROBOTS_VALUE);
  }

  return response;
}

export const config = {
  // Runs on every path except API routes, Next.js internals, Vercel
  // internals and requests for files with an extension (static assets).
  // Old WordPress uploads (`/wp-content/…/*.pdf`) have an extension but may have a redirect.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/wp-content/:path*'],
};
