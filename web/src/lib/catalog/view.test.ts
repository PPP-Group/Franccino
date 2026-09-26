import { describe, expect, it } from 'vitest';
import { listingQuery, parseCatalogView, toFilterOption } from './view';

describe('catalog view and query', () => {
  it('parses the view, reading a repeated key through firstValue', () => {
    expect(parseCatalogView('table')).toBe('table');
    expect(parseCatalogView(undefined)).toBe('grid');
    expect(parseCatalogView(['table'])).toBe('table');
    expect(parseCatalogView(['grid', 'table'])).toBe('grid');
  });

  it('keeps filters and page, and adds the table view', () => {
    const params = { category: 'cadeiras', designer: 'sergio-matos', page: 3 };
    expect(listingQuery(params, 'grid')).toEqual({
      category: 'cadeiras',
      designer: 'sergio-matos',
      page: '3',
    });
    expect(listingQuery(params, 'table', { page: 4 })).toEqual({
      category: 'cadeiras',
      designer: 'sergio-matos',
      page: '4',
      view: 'table',
    });
    expect(listingQuery(params, 'table', { view: 'grid' })).not.toHaveProperty('view');
  });

  it('goes back to the first page when a filter changes and drops empty values', () => {
    expect(listingQuery({ category: 'cadeiras', page: 3 }, 'grid', { designer: 'la-mamba' })).toEqual({
      category: 'cadeiras',
      designer: 'la-mamba',
    });
    expect(listingQuery({ category: 'cadeiras', q: '' }, 'grid', { category: undefined })).toEqual({});
  });

  it('normalizes facet options by slug or id', () => {
    expect(toFilterOption({ slug: 'cadeiras', name: 'Cadeiras', count: 12 })).toEqual({
      value: 'cadeiras',
      label: 'Cadeiras',
      count: 12,
    });
    expect(toFilterOption({ id: 4, name: 'Madeiras', count: 3 })).toEqual({
      value: '4',
      label: 'Madeiras',
      count: 3,
    });
  });
});
