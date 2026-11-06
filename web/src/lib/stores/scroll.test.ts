import { describe, expect, it } from 'vitest';
import { isFullyVisible } from './scroll';

describe('isFullyVisible', () => {
  it('is visible when the card sits between the header and the bottom of the window', () => {
    expect(isFullyVisible({ top: 120, bottom: 400 }, 900, 72)).toBe(true);
  });

  it('is not visible when the card hides under the header or below the window', () => {
    expect(isFullyVisible({ top: 40, bottom: 300 }, 900, 72)).toBe(false);
    expect(isFullyVisible({ top: 700, bottom: 960 }, 900, 72)).toBe(false);
  });
});
