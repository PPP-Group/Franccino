import { describe, expect, it, vi } from 'vitest';
import { absoluteUrl, buildMetadata } from './metadata';

describe('absoluteUrl', () => {
  it('resolves a path against SITE_URL', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');

    expect(absoluteUrl('/pt')).toBe('https://franccino.com.br/pt');

    vi.unstubAllEnvs();
  });
});

describe('buildMetadata', () => {
  it('builds the canonical URL and hreflang alternates for a product with per-locale slugs', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');
    vi.stubEnv('SITE_ENV', 'production');

    const metadata = buildMetadata({
      locale: 'en',
      href: { pathname: '/products/[slug]', params: { slug: 'aura-chair' } },
      title: 'Aura Chair',
      alternates: {
        pt: { pathname: '/products/[slug]', params: { slug: 'cadeira-aura' } },
        en: { pathname: '/products/[slug]', params: { slug: 'aura-chair' } },
      },
    });

    expect(metadata.alternates?.canonical).toBe('https://franccino.com.br/en/products/aura-chair');
    expect(metadata.alternates?.languages).toEqual({
      'pt-BR': 'https://franccino.com.br/pt/produtos/cadeira-aura',
      en: 'https://franccino.com.br/en/products/aura-chair',
      'x-default': 'https://franccino.com.br/pt/produtos/cadeira-aura',
    });

    vi.unstubAllEnvs();
  });

  it('omits a language from the alternates when it is explicitly null', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');
    vi.stubEnv('SITE_ENV', 'production');

    const metadata = buildMetadata({
      locale: 'pt',
      href: { pathname: '/products/[slug]', params: { slug: 'cadeira-aura' } },
      title: 'Cadeira Aura',
      alternates: { en: null },
    });

    expect(metadata.alternates?.languages).not.toHaveProperty('en');
    expect(metadata.alternates?.languages).toMatchObject({
      'pt-BR': 'https://franccino.com.br/pt/produtos/cadeira-aura',
      'x-default': 'https://franccino.com.br/pt/produtos/cadeira-aura',
    });

    vi.unstubAllEnvs();
  });

  it('sets robots.index to false outside production', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');
    vi.stubEnv('SITE_ENV', 'staging');

    const metadata = buildMetadata({
      locale: 'pt',
      href: { pathname: '/products' },
      title: 'Produtos',
    });

    expect(metadata.robots).toEqual({ index: false });

    vi.unstubAllEnvs();
  });

  it('sets robots.index to false when noindex is requested even in production', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');
    vi.stubEnv('SITE_ENV', 'production');

    const metadata = buildMetadata({
      locale: 'pt',
      href: { pathname: '/search' },
      title: 'Busca',
      noindex: true,
    });

    expect(metadata.robots).toEqual({ index: false });

    vi.unstubAllEnvs();
  });

  it('does not set robots.index to false in production without noindex', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');
    vi.stubEnv('SITE_ENV', 'production');

    const metadata = buildMetadata({
      locale: 'pt',
      href: { pathname: '/products' },
      title: 'Produtos',
    });

    expect(metadata.robots).toBeUndefined();

    vi.unstubAllEnvs();
  });

  it('builds Open Graph and Twitter metadata from the given image', () => {
    vi.stubEnv('SITE_URL', 'https://franccino.com.br');
    vi.stubEnv('SITE_ENV', 'production');

    const metadata = buildMetadata({
      locale: 'pt',
      href: { pathname: '/products/[slug]', params: { slug: 'cadeira-aura' } },
      title: 'Cadeira Aura',
      description: 'Uma cadeira Franccino.',
      image: {
        id: 1,
        alt: 'Cadeira Aura',
        width: 1200,
        height: 800,
        src: 'https://cdn.test/aura.jpg',
        srcset: [],
        blur_data_url: null,
      },
    });

    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      siteName: 'Franccino',
      locale: 'pt_BR',
      url: 'https://franccino.com.br/pt/produtos/cadeira-aura',
      images: [{ url: 'https://cdn.test/aura.jpg', width: 1200, height: 800, alt: 'Cadeira Aura' }],
    });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });

    vi.unstubAllEnvs();
  });
});
