import { z } from 'zod';

/**
 * `KEY=` in a `.env` file (an empty value, not a missing key) sets the
 * process env var to `''`, not `undefined`. Without this, an empty optional
 * key fails its own `.min(1)` check instead of falling through to
 * `.optional()`/`.default()` — every optional or defaulted field below runs
 * through this first so a blank value is treated the same as an absent one.
 */
function emptyToUndefined(value: unknown): unknown {
  return value === '' ? undefined : value;
}

/** `z.preprocess` helper for an optional, non-empty-when-present string env var. */
function optionalString() {
  return z.preprocess(emptyToUndefined, z.string().min(1).optional());
}

const bool = z
  .preprocess(emptyToUndefined, z.enum(['true', 'false', '1', '0']).optional())
  .transform((value) => value === 'true' || value === '1');

const localesSchema = z
  .preprocess(emptyToUndefined, z.string().default('pt,en'))
  .transform((value) =>
    value
      .split(',')
      .map((locale) => locale.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.enum(['pt', 'en'])).min(1));

const serverSchema = z.object({
  API_URL: z.url(),
  FRONTEND_API_KEY: optionalString(),
  SITE_URL: z.url(),
  SITE_ENV: z.preprocess(emptyToUndefined, z.enum(['local', 'staging', 'production']).default('local')),
  REVALIDATE_SECRET: optionalString(),
  STAGING_BASIC_AUTH_USER: optionalString(),
  STAGING_BASIC_AUTH_PASSWORD: optionalString(),
  ALLOW_BUILD_WITHOUT_API: bool,
});

const publicSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_SITE_LOCALES: localesSchema,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type PublicEnv = z.infer<typeof publicSchema>;
export type SiteLocale = PublicEnv['NEXT_PUBLIC_SITE_LOCALES'][number];

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  return serverSchema.parse(source);
}

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  return publicSchema.parse(source);
}

export function serverEnv(): ServerEnv {
  return parseServerEnv(process.env);
}

let cachedPublicEnv: PublicEnv | undefined;

// Next only inlines `process.env.NEXT_PUBLIC_*` in the browser bundle when the
// property is accessed by its literal name, so each variable is read out here
// individually instead of spreading `process.env` as a whole object.
export function getPublicEnv(): PublicEnv {
  if (!cachedPublicEnv) {
    cachedPublicEnv = parsePublicEnv({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_SITE_LOCALES: process.env.NEXT_PUBLIC_SITE_LOCALES,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    });
  }
  return cachedPublicEnv;
}

// Not memoized: used directly by the i18n routing config, and tests read it
// repeatedly against different stubbed values within the same module instance.
export function getSiteLocales(): SiteLocale[] {
  return localesSchema.parse(process.env.NEXT_PUBLIC_SITE_LOCALES);
}
