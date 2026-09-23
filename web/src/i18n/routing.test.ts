import { describe, expect, it } from 'vitest';
import { getPathname } from './navigation';

describe('localized pathnames', () => {
  it.each([
    [{ pathname: '/products' }, 'pt', '/pt/produtos'],
    [{ pathname: '/products' }, 'en', '/en/products'],
    [{ pathname: '/launches' }, 'en', '/en/novelties'],
    [{ pathname: '/corporate' }, 'en', '/en/contract'],
    [{ pathname: '/stores' }, 'pt', '/pt/lojas'],
    [{ pathname: '/products/[slug]', params: { slug: 'cadeira-aura' } }, 'pt', '/pt/produtos/cadeira-aura'],
    [{ pathname: '/indoor/[category]', params: { category: 'chairs' } }, 'en', '/en/indoor/chairs'],
  ] as const)('%o in %s is %s', (href, locale, expected) => {
    expect(getPathname({ href, locale })).toBe(expected);
  });
});
