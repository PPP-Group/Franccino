import { describe, expect, it } from 'vitest';
import { computeDrawing } from './dimension-drawing';

const dim = (overrides = {}) => ({
  label: null,
  width: 520,
  depth: 560,
  height: 800,
  seat_height: 460,
  diameter: null,
  ...overrides,
});

describe('computeDrawing', () => {
  it('draws front and side views on the same scale', () => {
    const geometry = computeDrawing(dim())!;
    expect(geometry.round).toBe(false);
    expect(geometry.front.width).toBeCloseTo(83.2);
    expect(geometry.front.height).toBeCloseTo(128);
    expect(geometry.side!.x).toBeCloseTo(187.2);
    expect(geometry.side!.width).toBeCloseTo(89.6);
    expect(geometry.viewWidth).toBeCloseTo(320.8);
    expect(geometry.viewHeight).toBeCloseTo(226);
    expect(geometry.baseY).toBeCloseTo(172);
    expect(geometry.seatY).toBeCloseTo(98.4);
    expect(geometry).toMatchObject({ widthMm: 520, depthMm: 560, heightMm: 800, seatMm: 460 });
  });

  it('uses the diameter for round pieces, without a depth label', () => {
    const geometry = computeDrawing(
      dim({ width: null, depth: null, diameter: 1300, height: 750, seat_height: null }),
    )!;
    expect(geometry.round).toBe(true);
    expect(geometry.widthMm).toBe(1300);
    expect(geometry.depthMm).toBeNull();
    expect(geometry.side!.width).toBeCloseTo(208);
    expect(geometry.seatY).toBeNull();
  });

  it('drops the side view without depth and gives up without height or width', () => {
    expect(computeDrawing(dim({ depth: null }))!.side).toBeNull();
    expect(computeDrawing(dim({ height: null }))).toBeNull();
    expect(computeDrawing(dim({ width: null }))).toBeNull();
  });
});
