import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { getSiteLocales, parsePublicEnv, parseServerEnv } from './env';

/** Minimal `.env` parser (`KEY=value` lines, `#` comments) — enough for `.env.example`. */
function parseDotEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    result[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return result;
}

describe('env', () => {
  it('parses server env with defaults', () => {
    const env = parseServerEnv({ API_URL: 'http://localhost:8000', SITE_URL: 'http://localhost:3000' });
    expect(env.SITE_ENV).toBe('local');
    expect(env.ALLOW_BUILD_WITHOUT_API).toBe(false);
  });

  it('reads boolean flags', () => {
    const env = parseServerEnv({
      API_URL: 'http://localhost:8000',
      SITE_URL: 'http://localhost:3000',
      ALLOW_BUILD_WITHOUT_API: 'true',
    });
    expect(env.ALLOW_BUILD_WITHOUT_API).toBe(true);
  });

  it('rejects invalid urls', () => {
    expect(() => parseServerEnv({ API_URL: 'nope', SITE_URL: 'http://localhost:3000' })).toThrow();
  });

  it('parses the enabled locales', () => {
    expect(parsePublicEnv({ NEXT_PUBLIC_API_URL: 'http://localhost:8000' }).NEXT_PUBLIC_SITE_LOCALES).toEqual(
      ['pt', 'en'],
    );
    expect(
      parsePublicEnv({ NEXT_PUBLIC_API_URL: 'http://localhost:8000', NEXT_PUBLIC_SITE_LOCALES: 'pt' })
        .NEXT_PUBLIC_SITE_LOCALES,
    ).toEqual(['pt']);
  });
});

describe('getSiteLocales', () => {
  it('defaults to pt and en', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_LOCALES', undefined);
    expect(getSiteLocales()).toEqual(['pt', 'en']);
  });

  it('reads a single configured locale', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_LOCALES', 'pt');
    expect(getSiteLocales()).toEqual(['pt']);
  });
});

describe('empty optional values (`KEY=` in a .env file)', () => {
  it('treats an empty optional server string as absent instead of failing .min(1)', () => {
    const env = parseServerEnv({
      API_URL: 'http://localhost:8000',
      SITE_URL: 'http://localhost:3000',
      FRONTEND_API_KEY: '',
      REVALIDATE_SECRET: '',
      STAGING_BASIC_AUTH_USER: '',
      STAGING_BASIC_AUTH_PASSWORD: '',
    });
    expect(env.FRONTEND_API_KEY).toBeUndefined();
    expect(env.REVALIDATE_SECRET).toBeUndefined();
    expect(env.STAGING_BASIC_AUTH_USER).toBeUndefined();
    expect(env.STAGING_BASIC_AUTH_PASSWORD).toBeUndefined();
  });

  it('treats an empty SITE_ENV as absent and falls back to its default', () => {
    const env = parseServerEnv({
      API_URL: 'http://localhost:8000',
      SITE_URL: 'http://localhost:3000',
      SITE_ENV: '',
    });
    expect(env.SITE_ENV).toBe('local');
  });

  it('treats an empty ALLOW_BUILD_WITHOUT_API as absent and defaults to false', () => {
    const env = parseServerEnv({
      API_URL: 'http://localhost:8000',
      SITE_URL: 'http://localhost:3000',
      ALLOW_BUILD_WITHOUT_API: '',
    });
    expect(env.ALLOW_BUILD_WITHOUT_API).toBe(false);
  });

  it('treats an empty public optional string as absent instead of failing .min(1)', () => {
    const env = parsePublicEnv({
      NEXT_PUBLIC_API_URL: 'http://localhost:8000',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '',
    });
    expect(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY).toBeUndefined();
  });
});

describe('.env.example', () => {
  const source = parseDotEnv(
    readFileSync(fileURLToPath(new URL('../../.env.example', import.meta.url)), 'utf8'),
  );

  it('parses as a valid server env, with its blank optional keys treated as absent', () => {
    expect(() => parseServerEnv(source)).not.toThrow();
  });

  it('parses as a valid public env, with its blank optional keys treated as absent', () => {
    expect(() => parsePublicEnv(source)).not.toThrow();
  });
});
