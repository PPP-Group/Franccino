import { describe, expect, it } from 'vitest';
import { shouldAutoplay, wrapIndex } from './carousel';

describe('wrapIndex', () => {
  it('keeps indexes inside the range', () => {
    expect(wrapIndex(0, 3)).toBe(0);
    expect(wrapIndex(2, 3)).toBe(2);
  });

  it('wraps past the last and before the first slide', () => {
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(7, 3)).toBe(1);
  });

  it('returns 0 when there are no slides', () => {
    expect(wrapIndex(5, 0)).toBe(0);
  });
});

describe('shouldAutoplay', () => {
  it('rotates only with more than one slide, not paused and without reduced motion', () => {
    expect(shouldAutoplay(3, false, false)).toBe(true);
    expect(shouldAutoplay(1, false, false)).toBe(false);
    expect(shouldAutoplay(3, true, false)).toBe(false);
    expect(shouldAutoplay(3, false, true)).toBe(false);
  });
});
