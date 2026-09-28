import { describe, expect, it } from 'vitest';
import {
  centerPlacement,
  countByProduct,
  findConflicts,
  floorUsage,
  footprint,
  keyboardDelta,
  nextUid,
  pieceBox,
  roomSizeFromMeters,
  rotateQuarter,
  rotationPivot,
  snap,
} from './geometry';

const sofa = { width: 240, depth: 100 };
const room = { w: 500, d: 400 };

describe('planner geometry', () => {
  it('swaps width and depth when turned a quarter', () => {
    expect(footprint(sofa, 0)).toEqual({ w: 240, d: 100 });
    expect(footprint(sofa, 90)).toEqual({ w: 100, d: 240 });
    expect(footprint(sofa, 180)).toEqual({ w: 240, d: 100 });
    expect(pieceBox({ uid: 1, productId: 9, x: 10, y: 20, r: 270 }, sofa)).toEqual({
      uid: 1,
      x: 10,
      y: 20,
      w: 100,
      d: 240,
    });
  });

  it('rotates around the pivot that keeps the turned box at the piece origin', () => {
    expect(rotationPivot(sofa, 0)).toEqual([120, 50]);
    expect(rotationPivot(sofa, 90)).toEqual([50, 50]);
    expect(rotationPivot(sofa, 180)).toEqual([120, 50]);
    expect(rotationPivot(sofa, 270)).toEqual([120, 120]);
  });

  it('flags overlapping pieces and pieces outside the room, not touching edges', () => {
    const conflicts = findConflicts(room, [
      { uid: 1, x: 0, y: 0, w: 100, d: 100 },
      { uid: 2, x: 50, y: 50, w: 100, d: 100 },
      { uid: 3, x: 450, y: 350, w: 100, d: 100 },
      { uid: 4, x: 200, y: 200, w: 50, d: 50 },
      { uid: 5, x: 250, y: 200, w: 50, d: 50 },
    ]);
    expect([...conflicts].sort()).toEqual([1, 2, 3]);
  });

  it('measures the used floor', () => {
    expect(
      floorUsage(room, [
        { uid: 1, x: 0, y: 0, w: 240, d: 100 },
        { uid: 2, x: 0, y: 0, w: 100, d: 100 },
      ]),
    ).toBe(17);
    expect(floorUsage(room, [])).toBe(0);
  });

  it('snaps positions and reads room sizes in metres with limits', () => {
    expect(snap(12)).toBe(10);
    expect(snap(13)).toBe(15);
    expect(roomSizeFromMeters('5,2', 500)).toBe(520);
    expect(roomSizeFromMeters('0.5', 500)).toBe(150);
    expect(roomSizeFromMeters('30', 500)).toBe(2000);
    expect(roomSizeFromMeters('abc', 500)).toBe(500);
    expect(roomSizeFromMeters('', 400)).toBe(400);
  });

  it('rotates, moves by keyboard and centres new pieces', () => {
    expect(rotateQuarter(270)).toBe(0);
    expect(rotateQuarter(90)).toBe(180);
    expect(keyboardDelta('ArrowLeft', false)).toEqual([-5, 0]);
    expect(keyboardDelta('ArrowDown', true)).toEqual([0, 1]);
    expect(keyboardDelta('x', false)).toBeNull();
    expect(centerPlacement(room, sofa)).toEqual({ x: 130, y: 150 });
    expect(centerPlacement({ w: 150, d: 150 }, sofa)).toEqual({ x: 0, y: 25 });
  });

  it('numbers pieces and counts them per product in order of appearance', () => {
    expect(nextUid([])).toBe(1);
    expect(nextUid([{ uid: 3 }, { uid: 7 }])).toBe(8);
    expect(countByProduct([{ productId: 5 }, { productId: 2 }, { productId: 5 }])).toEqual([
      { productId: 5, count: 2 },
      { productId: 2, count: 1 },
    ]);
  });
});
