import { describe, expect, it } from 'vitest';
import { emptyCells, gridFillClass } from './grid-fill';

describe('grid fill', () => {
  it('counts the empty cells of the last row', () => {
    expect(emptyCells(11, 3)).toBe(1);
    expect(emptyCells(10, 3)).toBe(2);
    expect(emptyCells(12, 3)).toBe(0);
    expect(emptyCells(1, 2)).toBe(1);
    expect(emptyCells(0, 3)).toBe(0);
  });

  it('describes the span on desktop and on compact widths', () => {
    expect(gridFillClass(7)).toBe('grid-fill--d2 grid-fill--m1');
    expect(gridFillClass(8)).toBe('grid-fill--d1 grid-fill--m0');
    expect(gridFillClass(9)).toBe('grid-fill--d0 grid-fill--m1');
    expect(gridFillClass(24)).toBeNull();
    expect(gridFillClass(0)).toBeNull();
  });
});
