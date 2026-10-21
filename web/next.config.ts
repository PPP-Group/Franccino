import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { parseBuildEnv } from './src/lib/env';
import { buildCsp } from './src/lib/security/csp';
import { TILE_URL } from './src/lib/stores/map-view';

/**
 * Full policy (P5b T8). Report-only until `CSP_ENFORCE=true`, so staging can show violations in the console
 * before it blocks anything; `frame-ancestors` is ignored in report-only, so it stays enforced on its own.
 */
const BUILD_ENV = parseBuildEnv(process.env);
const CSP_SOURCES = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  mediaUrl: BUILD_ENV.NEXT_PUBLIC_MEDIA_URL,
  downloadsUrl: BUILD_ENV.NEXT_PUBLIC_DOWNLOADS_URL,
  tileUrl: TILE_URL,
  gtm: Boolean(process.env.NEXT_PUBLIC_GTM_ID),
  turnstile: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  dev: process.env.NODE_ENV === 'development',
};
const CSP_HEADERS = BUILD_ENV.CSP_ENFORCE
  ? [{ key: 'Content-Security-Policy', value: buildCsp(CSP_SOURCES) }]
  : [
      { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
      { key: 'Content-Security-Policy-Report-Only', value: buildCsp({ ...CSP_SOURCES, reportOnly: true }) },
    ];

/** Applied to every route — see the task 5 brief for why each one is here. */
const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  ...CSP_HEADERS,
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), xr-spatial-tracking=(self)',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
