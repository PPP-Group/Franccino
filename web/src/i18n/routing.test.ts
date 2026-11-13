import { describe, expect, it } from 'vitest';
import { getPathname } from './navigation';

describe('localized pathnames', () => {
  it.each([
    [{ pathname: '/products' }, 'pt', '/pt/produtos'],
    [{ pathname: '/products' }, 'en', '/en/products'],
    [{ pathname: '/launches' }, 'en', '/en/novelties'],
    [{ pathname: '/projects' }, 'pt', '/pt/corporativo'],
    [{ pathname: '/projects' }, 'en', '/en/corporate'],
    [{ pathname: '/projects/[slug]', params: { slug: 'clara-arte' } }, 'pt', '/pt/corporativo/clara-arte'],
    [{ pathname: '/stores' }, 'pt', '/pt/lojas'],
    [{ pathname: '/products/[slug]', params: { slug: 'cadeira-aura' } }, 'pt', '/pt/produtos/cadeira-aura'],
    [{ pathname: '/indoor/[category]', params: { category: 'chairs' } }, 'en', '/en/indoor/chairs'],
    [{ pathname: '/quote-list' }, 'pt', '/pt/lista-de-orcamento'],
    [{ pathname: '/quote-list' }, 'en', '/en/quote-list'],
    [{ pathname: '/room-planner' }, 'pt', '/pt/sala-para-montar'],
    [{ pathname: '/room-planner' }, 'en', '/en/room-planner'],
  ] as const)('%o in %s is %s', (href, locale, expected) => {
    expect(getPathname({ href, locale })).toBe(expected);
  });
});
