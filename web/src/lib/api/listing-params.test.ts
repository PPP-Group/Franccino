import { describe, expect, it } from 'vitest';
import { firstValue, listingQueryString, parseListingParams } from '@/lib/api/listing-params';

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

describe('firstValue', () => {
  it('passes a plain string through unchanged', () => {
    expect(firstValue('cadeira')).toBe('cadeira');
  });

  it('takes the first value of a repeated query key', () => {
    expect(firstValue(['cadeira', 'sofa'])).toBe('cadeira');
  });

  it('passes undefined through unchanged', () => {
    expect(firstValue(undefined)).toBeUndefined();
  });
});
