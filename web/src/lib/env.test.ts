import { describe, expect, it, vi } from 'vitest';
import { getSiteLocales, parsePublicEnv, parseServerEnv } from './env';

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
