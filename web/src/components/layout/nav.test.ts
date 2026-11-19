import { describe, expect, it } from 'vitest';
import { activeNavKey, NAV_ITEMS } from './nav';

describe('main navigation', () => {
  it('keeps the approved order', () => {
    expect(NAV_ITEMS.map((item) => item.key)).toEqual([
      'products',
      'launches',
      'collections',
      'designers',
      'projects',
      'factory',
      'stores',
      'downloads',
      'contact',
    ]);
  });

  it('marks the section of the current internal pathname', () => {
    // Casa e Giardini ficam dentro de Produtos (revisão da Franccino, item 5).
    expect(activeNavKey('/indoor')).toBe('products');
    expect(activeNavKey('/outdoor/[category]')).toBe('products');
    expect(activeNavKey('/products')).toBe('products');
    expect(activeNavKey('/launches/[slug]')).toBe('launches');
    expect(activeNavKey('/downloads/blocks')).toBe('downloads');
    expect(activeNavKey('/room-planner')).toBeNull();
    expect(activeNavKey('/products/[slug]')).toBe('products');
    expect(activeNavKey('/')).toBeNull();
  });
});
