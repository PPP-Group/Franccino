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

  it('routes a "page" entry to its fixed route by key, ignoring slugs', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    // `slugs` deliberately differ from `key` and from each other: the route
    // must come from `key` alone, never from these values.
    const entries: SitemapEntry[] = [
      {
        type: 'page',
        key: 'home',
        slugs: { pt: 'pagina-inicial', en: 'landing' },
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    const result = sitemapEntries(entries, ['pt', 'en']);

    expect(result[0]?.url).toBe('https://franccino.com.br/pt');

    vi.unstubAllEnvs();
  });

  it('routes a "page" entry to its localized path when the page has its own translated URL', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries: SitemapEntry[] = [
      {
        type: 'page',
        key: 'privacy',
        slugs: { pt: 'privacidade', en: 'privacy' },
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    const result = sitemapEntries(entries, ['pt', 'en']);

    expect(result[0]?.url).toBe('https://franccino.com.br/pt/privacidade');
    expect(result[0]?.alternates?.languages).toEqual({
      'pt-BR': 'https://franccino.com.br/pt/privacidade',
      en: 'https://franccino.com.br/en/privacy',
    });

    vi.unstubAllEnvs();
  });

  it('keeps a "page" entry with a null slug in every locale, routing by key alone (home)', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries: SitemapEntry[] = [
      { type: 'page', key: 'home', slugs: { pt: null, en: null }, updated_at: '2026-01-01T00:00:00Z' },
    ];

    const result = sitemapEntries(entries, ['pt', 'en']);

    expect(result).toHaveLength(1);
    expect(result[0]?.url).toBe('https://franccino.com.br/pt');
    expect(result[0]?.alternates?.languages).toEqual({
      'pt-BR': 'https://franccino.com.br/pt',
      en: 'https://franccino.com.br/en',
    });

    vi.unstubAllEnvs();
  });

  it('keeps a "page" entry with a null slug in every locale, routing by key alone (privacy)', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries: SitemapEntry[] = [
      { type: 'page', key: 'privacy', slugs: { pt: null, en: null }, updated_at: '2026-01-01T00:00:00Z' },
    ];

    const result = sitemapEntries(entries, ['pt', 'en']);

    expect(result).toHaveLength(1);
    expect(result[0]?.url).toBe('https://franccino.com.br/pt/privacidade');
    expect(result[0]?.alternates?.languages).toEqual({
      'pt-BR': 'https://franccino.com.br/pt/privacidade',
      en: 'https://franccino.com.br/en/privacy',
    });

    vi.unstubAllEnvs();
  });

  it('drops a "page" entry whose key has no fixed route', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries: SitemapEntry[] = [
      {
        type: 'page',
        key: 'not-a-real-page',
        slugs: { pt: 'x', en: 'x' },
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    expect(sitemapEntries(entries, ['pt', 'en'])).toEqual([]);

    vi.unstubAllEnvs();
  });

  it('drops a "page" entry with no key at all', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries: SitemapEntry[] = [
      { type: 'page', slugs: { pt: 'home', en: 'home' }, updated_at: '2026-01-01T00:00:00Z' },
    ];

    expect(sitemapEntries(entries, ['pt', 'en'])).toEqual([]);

    vi.unstubAllEnvs();
  });

  it('drops a category entry with no area key, instead of defaulting to indoor', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries: SitemapEntry[] = [
      { type: 'category', slugs: { pt: 'cadeiras', en: 'chairs' }, updated_at: '2026-01-01T00:00:00Z' },
    ];

    expect(sitemapEntries(entries, ['pt', 'en'])).toEqual([]);

    vi.unstubAllEnvs();
  });

  it('drops a category entry whose area key is not recognized, instead of defaulting to indoor', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    const entries: SitemapEntry[] = [
      {
        type: 'category',
        key: 'unknown-area',
        slugs: { pt: 'cadeiras', en: 'chairs' },
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    expect(sitemapEntries(entries, ['pt', 'en'])).toEqual([]);

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
