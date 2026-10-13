import { describe, expect, it } from 'vitest';
import { buildRedirectIndex, findRedirect, isLegacyCandidate, normalizeLegacyPath } from './match';

const index = buildRedirectIndex([
  { from: '/produto/cadeira-aura', to: '/pt/produtos/cadeira-aura', status: 301 },
  { from: '/?taxonomy=linhas&term=pinot', to: '/pt/produtos?line=pinot', status: 301 },
  { from: '/jet-popup/*', to: null, status: 410 },
  { from: '/produto/*', to: '/pt/produtos', status: 301 },
  { from: '/categoria/*', to: null, status: 410 },
  { from: '/categoria/interna/*', to: '/pt/indoor', status: 301 },
]);

describe('normalizeLegacyPath', () => {
  it('drops the trailing slash and sorts the query', () => {
    expect(normalizeLegacyPath('/produto/x/', '')).toBe('/produto/x');
    expect(normalizeLegacyPath('/', '?term=pinot&taxonomy=linhas')).toBe('/?taxonomy=linhas&term=pinot');
    expect(normalizeLegacyPath('/', '')).toBe('/');
  });
});

describe('findRedirect', () => {
  it('matches with or without trailing slash and query order', () => {
    expect(findRedirect(index, '/produto/cadeira-aura/', '')?.to).toBe('/pt/produtos/cadeira-aura');
    expect(findRedirect(index, '/', '?term=pinot&taxonomy=linhas')?.to).toBe('/pt/produtos?line=pinot');
  });

  it('ignores extra tracking query when the path alone has a rule', () => {
    expect(findRedirect(index, '/produto/cadeira-aura/', '?utm_source=ig')?.to).toBe(
      '/pt/produtos/cadeira-aura',
    );
  });

  it('falls back to the longest prefix rule', () => {
    expect(findRedirect(index, '/produto/peca-que-saiu/', '')?.to).toBe('/pt/produtos');
    expect(findRedirect(index, '/categoria/interna/bar/', '')?.to).toBe('/pt/indoor');
    expect(findRedirect(index, '/categoria/tendencias/', '')?.status).toBe(410);
    expect(findRedirect(index, '/jet-popup/menu-mobile/', '')?.status).toBe(410);
  });

  it('returns null for unknown paths', () => {
    expect(findRedirect(index, '/nao-existe', '')).toBeNull();
    expect(findRedirect(index, '/', '?s=mesa')).toBeNull();
  });
});

describe('isLegacyCandidate', () => {
  it('skips locale-prefixed paths and the bare root', () => {
    expect(isLegacyCandidate('/pt/produtos', '', ['pt', 'en'])).toBe(false);
    expect(isLegacyCandidate('/en', '', ['pt', 'en'])).toBe(false);
    expect(isLegacyCandidate('/', '', ['pt', 'en'])).toBe(false);
    expect(isLegacyCandidate('/', '?taxonomy=linhas&term=x', ['pt', 'en'])).toBe(true);
    expect(isLegacyCandidate('/produto/x/', '', ['pt', 'en'])).toBe(true);
  });
});
