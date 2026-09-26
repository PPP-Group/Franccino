import { describe, expect, it } from 'vitest';
import { areaListingHref, productsListingHref } from './area-href';

describe('listing hrefs', () => {
  it('keeps /products and moves filters to the query', () => {
    const hrefFor = productsListingHref({ designer: 'la-mamba', page: 2 }, 'grid');
    expect(hrefFor({ page: 3 })).toEqual({
      pathname: '/products',
      query: { designer: 'la-mamba', page: '3' },
    });
    expect(hrefFor({ category: 'mesas' })).toEqual({
      pathname: '/products',
      query: { category: 'mesas', designer: 'la-mamba' },
    });
  });

  it('turns the category into the area category route', () => {
    const hrefFor = areaListingHref('outdoor', { category: 'poltronas', page: 3 }, 'table');
    expect(hrefFor({ page: 4 })).toEqual({
      pathname: '/outdoor/[category]',
      params: { category: 'poltronas' },
      query: { page: '4', view: 'table' },
    });
    expect(hrefFor({ category: 'sofas' })).toEqual({
      pathname: '/outdoor/[category]',
      params: { category: 'sofas' },
      query: { view: 'table' },
    });
    expect(hrefFor({ category: undefined })).toEqual({ pathname: '/outdoor', query: { view: 'table' } });
    expect(areaListingHref('indoor', {}, 'grid')({ view: 'table' })).toEqual({
      pathname: '/indoor',
      query: { view: 'table' },
    });
  });
});
