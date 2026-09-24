import { describe, expect, it } from 'vitest';
import { listingQueryString, parseListingParams } from '@/lib/api/listing-params';

describe('listing params', () => {
  it('parses known filters and ignores the rest', () => {
    expect(parseListingParams({ category: 'cadeiras', page: '2', sort: 'name', foo: 'bar' })).toEqual({
      category: 'cadeiras',
      page: 2,
      sort: 'name',
    });
  });

  it('drops invalid values', () => {
    expect(parseListingParams({ page: '-1', sort: 'random', finish: 'abc' })).toEqual({});
  });

  it('serializes back without empty values', () => {
    expect(listingQueryString({ category: 'cadeiras', page: 1, q: '' })).toBe('?category=cadeiras');
  });
});
