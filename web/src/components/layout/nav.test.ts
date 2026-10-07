import { describe, expect, it } from 'vitest';
import { activeNavKey, NAV_ITEMS } from './nav';

describe('main navigation', () => {
  it('keeps the approved order', () => {
    expect(NAV_ITEMS.map((item) => item.key)).toEqual([
      'indoor',
      'outdoor',
      'launches',
      'collections',
      'designers',
      'projects',
      'factory',
      'stores',
      'planner',
    ]);
  });

  it('marks the section of the current internal pathname', () => {
    expect(activeNavKey('/indoor')).toBe('indoor');
    expect(activeNavKey('/outdoor/[category]')).toBe('outdoor');
    expect(activeNavKey('/launches/[slug]')).toBe('launches');
    expect(activeNavKey('/room-planner')).toBe('planner');
    expect(activeNavKey('/products/[slug]')).toBeNull();
    expect(activeNavKey('/')).toBeNull();
  });
});
