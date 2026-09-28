import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { serverEnv } from '@/lib/env';
import { checkBasicAuth } from '@/lib/security/basic-auth';

const handleI18nRouting = createMiddleware(routing);

const ROBOTS_HEADER = 'X-Robots-Tag';
const ROBOTS_VALUE = 'noindex, nofollow';

export function proxy(request: NextRequest) {
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

  const response = handleI18nRouting(request);

  if (env.SITE_ENV === 'staging') {
    response.headers.set(ROBOTS_HEADER, ROBOTS_VALUE);
  }

  return response;
}

export const config = {
  // Runs on every path except API routes, Next.js internals, Vercel
  // internals and requests for files with an extension (static assets).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
