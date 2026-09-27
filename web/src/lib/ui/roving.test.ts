import { describe, expect, it } from 'vitest';
import { nextRovingIndex } from './roving';

describe('nextRovingIndex', () => {
  it('moves with arrows, wraps around and jumps with Home/End', () => {
    expect(nextRovingIndex(3, 0, 'ArrowRight')).toBe(1);
    expect(nextRovingIndex(3, 2, 'ArrowRight')).toBe(0);
    expect(nextRovingIndex(3, 0, 'ArrowLeft')).toBe(2);
    expect(nextRovingIndex(3, 0, 'ArrowDown')).toBe(1);
    expect(nextRovingIndex(3, 1, 'ArrowUp')).toBe(0);
    expect(nextRovingIndex(3, 1, 'Home')).toBe(0);
    expect(nextRovingIndex(3, 1, 'End')).toBe(2);
  });

  it('ignores other keys and empty groups', () => {
    expect(nextRovingIndex(3, 1, 'a')).toBeNull();
    expect(nextRovingIndex(0, 0, 'ArrowRight')).toBeNull();
  });
});
