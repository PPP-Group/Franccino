import { describe, expect, it } from 'vitest';
import { PEEK_BOX, peekPosition } from './row-peek';

describe('peekPosition', () => {
  it('sits to the right of the pointer, vertically centred', () => {
    expect(peekPosition(400, 500, 1440, 900)).toEqual({ x: 428, y: 500 - PEEK_BOX.height / 2 });
  });

  it('flips to the left near the right edge, never covering the pointer', () => {
    const { x } = peekPosition(1300, 500, 1440, 900);
    expect(x + PEEK_BOX.width).toBeLessThan(1300);
  });

  it('stays inside the viewport vertically', () => {
    expect(peekPosition(400, 10, 1440, 900).y).toBe(16);
    expect(peekPosition(400, 895, 1440, 900).y).toBe(900 - PEEK_BOX.height - 16);
  });
});
