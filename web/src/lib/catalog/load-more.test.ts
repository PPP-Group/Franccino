import { describe, expect, it } from 'vitest';
import { loadMoreAction, MAX_LOADS, sanitizeListQuery } from './load-more';

describe('loadMoreAction', () => {
  it('offers the button until the limit, then the next page link, and nothing at the end', () => {
    expect(loadMoreAction({ page: 1, loads: 0 }, 9)).toBe('button');
    expect(loadMoreAction({ page: 4, loads: MAX_LOADS }, 9)).toBe('next-page');
    expect(loadMoreAction({ page: 9, loads: 2 }, 9)).toBe('none');
    expect(loadMoreAction({ page: 1, loads: 0 }, 1)).toBe('none');
  });
});

describe('sanitizeListQuery', () => {
  it('keeps only listing filters as short text', () => {
    expect(
      sanitizeListQuery({ area: 'indoor', category: 'cadeiras', page: 3, per_page: 999, evil: 'x' }),
    ).toEqual({
      area: 'indoor',
      category: 'cadeiras',
    });
    expect(sanitizeListQuery({ q: 'a'.repeat(200) })).toEqual({});
    expect(sanitizeListQuery(null)).toEqual({});
  });
});
