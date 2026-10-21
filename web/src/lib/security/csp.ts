/**
 * Content-Security-Policy of the site (P5b T8), built from the environment in `next.config.ts`. No `@/` imports:
 * `next.config.ts` loads this file before the app's path aliases exist.
 *
 * - `script-src 'unsafe-inline'`: pages are static (P4 R24), so Next's inline bootstrap scripts cannot carry a
 *   per-request nonce. `'wasm-unsafe-eval'` is for the 3D viewer's decoders (WebAssembly), not `eval`.
 * - `style-src 'unsafe-inline'`: React `style` attributes (image placeholders, map tiles) and `next/font`.
 * - `https://www.gstatic.com`: Draco and Basis decoders that `@google/model-viewer` fetches for compressed GLB.
 */

export type CspOptions = {
  /** API origin: photos, GLB files and form posts from the browser. */
  apiUrl: string;
  /** Public media origin when it differs from the API (Cloudflare R2), or empty. */
  mediaUrl?: string;
  /** Origin of the temporary links to private files (R2 downloads bucket), fetched by the 3D viewer, or empty. */
  downloadsUrl?: string;
  /** Store map tiles template (`TILE_URL`). */
  tileUrl?: string;
  /** Google Tag Manager enabled (`NEXT_PUBLIC_GTM_ID`). */
  gtm?: boolean;
  /** Cloudflare Turnstile enabled (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`). */
  turnstile?: boolean;
  /** `next dev` needs `eval` and the hot-reload socket. */
  dev?: boolean;
  /** For the `-Report-Only` header, where browsers ignore `frame-ancestors` and warn about it. */
  reportOnly?: boolean;
};

const GTM = 'https://www.googletagmanager.com';
const ANALYTICS = ['https://*.google-analytics.com', 'https://*.analytics.google.com'];
const TURNSTILE = 'https://challenges.cloudflare.com';
const MODEL_DECODERS = 'https://www.gstatic.com';
const VIDEO_PLAYERS = ['https://www.youtube-nocookie.com', 'https://player.vimeo.com'];

/** Origin of an URL or template (`https://tile.example/{z}/{x}/{y}.png`), or null when empty or invalid. */
export function originOf(url: string | undefined): string | null {
  if (!url) {
    return null;
  }
  try {
    return new URL(url.replace(/\{[^}]*\}/g, '0')).origin;
  } catch {
    return null;
  }
}

export function buildCsp(options: CspOptions): string {
  const { gtm = false, turnstile = false, dev = false, reportOnly = false } = options;
  const media = unique([originOf(options.apiUrl), originOf(options.mediaUrl)]);
  const tiles = unique([originOf(options.tileUrl)]);

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'wasm-unsafe-eval'",
      ...(dev ? ["'unsafe-eval'"] : []),
      ...(gtm ? [GTM] : []),
      ...(turnstile ? [TURNSTILE] : []),
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', ...media, ...tiles, ...(gtm ? [GTM, ...ANALYTICS] : [])],
    'font-src': ["'self'"],
    'connect-src': [
      "'self'",
      'data:',
      'blob:',
      ...media,
      ...unique([originOf(options.downloadsUrl)]).filter((origin) => !media.includes(origin)),
      MODEL_DECODERS,
      ...(gtm ? [GTM, ...ANALYTICS] : []),
      ...(dev ? ['ws:'] : []),
    ],
    'media-src': ["'self'", ...media],
    'frame-src': [...VIDEO_PLAYERS, ...(turnstile ? [TURNSTILE] : [])],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    ...(reportOnly ? {} : { 'frame-ancestors': ["'none'"] }),
  };

  return Object.entries(directives)
    .map(([name, sources]) => `${name} ${sources.join(' ')}`)
    .join('; ');
}

function unique(values: (string | null)[]): string[] {
  return [...new Set(values.filter((value): value is string => value !== null))];
}
