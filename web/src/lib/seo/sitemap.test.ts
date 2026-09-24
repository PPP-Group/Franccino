import { describe, expect, it, vi } from 'vitest';
import type { SitemapEntry } from '@/lib/api/types';
import { sitemapEntries } from './sitemap';

describe('sitemapEntries', () => {
  it('builds one URL per entry in the default locale, with hreflang alternates', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries: SitemapEntry[] = [
      {
        type: 'product',
        slugs: { pt: 'cadeira-aura', en: 'aura-chair' },
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    const result = sitemapEntries(entries, ['pt', 'en']);

    expect(result).toHaveLength(1);
    expect(result[0]?.url).toBe('https://franccino.com.br/pt/produtos/cadeira-aura');
    expect(result[0]?.alternates?.languages).toEqual({
      'pt-BR': 'https://franccino.com.br/pt/produtos/cadeira-aura',
      en: 'https://franccino.com.br/en/products/aura-chair',
    });

    vi.unstubAllEnvs();
  });

  it('routes a category entry keyed "outdoor" to /outdoor/[category]', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries: SitemapEntry[] = [
      {
        type: 'category',
        key: 'outdoor',
        slugs: { pt: 'cadeiras', en: 'chairs' },
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    const result = sitemapEntries(entries, ['pt', 'en']);

    expect(result[0]?.url).toBe('https://franccino.com.br/pt/outdoor/cadeiras');

    vi.unstubAllEnvs();
  });

  it('routes a category entry keyed "indoor" to /indoor/[category]', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries: SitemapEntry[] = [
      {
        type: 'category',
        key: 'indoor',
        slugs: { pt: 'sofas', en: 'sofas' },
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    const result = sitemapEntries(entries, ['pt', 'en']);

    expect(result[0]?.url).toBe('https://franccino.com.br/pt/indoor/sofas');

    vi.unstubAllEnvs();
  });

  it('routes a "page" entry to its fixed route by key', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries: SitemapEntry[] = [
      { type: 'page', slugs: { pt: 'home', en: 'home' }, updated_at: '2026-01-01T00:00:00Z' },
    ];

    const result = sitemapEntries(entries, ['pt', 'en']);

    expect(result[0]?.url).toBe('https://franccino.com.br/pt');

    vi.unstubAllEnvs();
  });

  it('skips entries whose type is not recognized', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries = [
      { type: 'unknown', slugs: { pt: 'x', en: 'x' }, updated_at: '2026-01-01T00:00:00Z' },
    ] as SitemapEntry[];

    expect(sitemapEntries(entries, ['pt', 'en'])).toEqual([]);

    vi.unstubAllEnvs();
  });

  it('skips a locale whose slug is null instead of building a broken alternate', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries: SitemapEntry[] = [
      { type: 'product', slugs: { pt: 'cadeira-aura', en: null }, updated_at: '2026-01-01T00:00:00Z' },
    ];

    const result = sitemapEntries(entries, ['pt', 'en']);

    expect(result[0]?.alternates?.languages).toEqual({
      'pt-BR': 'https://franccino.com.br/pt/produtos/cadeira-aura',
    });

    vi.unstubAllEnvs();
  });
});
