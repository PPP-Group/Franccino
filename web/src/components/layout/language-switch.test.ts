import { describe, expect, it } from 'vitest';
import { resolveAlternateHref } from './LanguageSwitcher';

const links = [
  { hreflang: 'pt-BR', href: 'https://x/pt/produtos/a' },
  { hreflang: 'en', href: 'https://x/en/products/b' },
];

describe('resolveAlternateHref', () => {
  it('returns the relative path of the alternate link for the target locale', () => {
    expect(resolveAlternateHref(links, 'en')).toBe('/en/products/b');
  });

  it('returns the relative path for pt (hreflang pt-BR)', () => {
    expect(resolveAlternateHref(links, 'pt')).toBe('/pt/produtos/a');
  });

  it('returns null when there is no alternate for the target locale', () => {
    expect(resolveAlternateHref([links[0]!], 'en')).toBeNull();
  });
});
