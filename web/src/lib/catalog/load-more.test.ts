import { describe, expect, it } from 'vitest';
import { loadMoreAction, MAX_LOADS, previousStart, sanitizeListQuery, undoLoad } from './load-more';

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

describe('previousStart', () => {
  it('goes back one stretch of the grid (an opened page plus the loads), never before the first page', () => {
    expect(previousStart(1)).toBeNull();
    expect(previousStart(5)).toBe(1);
    expect(previousStart(9)).toBe(5);
    expect(previousStart(3)).toBe(1);
  });
});

describe('undoLoad', () => {
  it('removes the pieces the last "Ver mais" added', () => {
    const items = Array.from({ length: 60 }, (_, index) => index);
    expect(undoLoad({ page: 4, loads: 3, items }, 24)).toEqual({
      page: 3,
      loads: 2,
      items: items.slice(0, 48),
    });
    expect(undoLoad({ page: 2, loads: 1, items: items.slice(0, 24) }, 24)).toEqual({
      page: 1,
      loads: 0,
      items: [],
    });
  });

  it('keeps the list as it is without any load', () => {
    const state = { page: 5, loads: 0, items: [] };
    expect(undoLoad(state, 24)).toBe(state);
  });
});
