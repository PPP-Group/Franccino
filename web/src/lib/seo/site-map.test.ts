import { describe, expect, it } from 'vitest';
import en from '../../../messages/en.json';
import pt from '../../../messages/pt.json';
import { SITE_MAP_PAGES } from './site-map';

describe('SITE_MAP_PAGES', () => {
  it('lists every public page once and leaves the quote list out', () => {
    const hrefs = SITE_MAP_PAGES.map((page) => page.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toContain('/room-planner');
    expect(hrefs).not.toContain('/quote-list');
  });

  it('has a label for every page in both languages', () => {
    for (const messages of [pt, en] as Record<string, Record<string, unknown>>[]) {
      for (const page of SITE_MAP_PAGES) {
        expect(messages[page.namespace]?.[page.key], `${page.namespace}.${page.key}`).toBeTypeOf('string');
      }
    }
  });
});
