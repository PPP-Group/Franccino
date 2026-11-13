import { describe, expect, it } from 'vitest';
import { coverPoint, placeHotspot } from './hotspot';

describe('placeHotspot', () => {
  it('turns the panel percentages into CSS positions', () => {
    expect(placeHotspot(42.5, 61)).toMatchObject({ left: '42.5%', top: '61%' });
  });

  it('keeps the point inside the photo', () => {
    expect(placeHotspot(140, -3)).toMatchObject({ left: '100%', top: '0%' });
    expect(placeHotspot(Number.NaN, 20)).toMatchObject({ left: '50%' });
  });

  it('opens the card towards the middle of the photo', () => {
    expect(placeHotspot(20, 20)).toMatchObject({ horizontal: 'start', vertical: 'below' });
    expect(placeHotspot(80, 80)).toMatchObject({ horizontal: 'end', vertical: 'above' });
  });
});

describe('coverPoint', () => {
  it('keeps the point when photo and frame have the same shape', () => {
    expect(coverPoint(38, 56, 1.5, 1.5)).toEqual({ x: 38, y: 56 });
  });

  it('moves the point when a 4:3 photo is cropped top and bottom into a 3:2 frame', () => {
    // 4:3 in 3:2: 8/9 of the height shows, 1/18 cut at the top.
    const point = coverPoint(50, 56, 4 / 3, 1.5);
    expect(point?.x).toBe(50);
    expect(point?.y).toBeCloseTo((56 - 100 / 18) * (9 / 8), 1);
  });

  it('drops a point that falls in the cropped part', () => {
    expect(coverPoint(50, 3, 4 / 3, 1.5)).toBeNull();
    expect(coverPoint(1, 50, 2, 1.5)).toBeNull();
  });
});
