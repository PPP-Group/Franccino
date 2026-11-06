import { describe, expect, it } from 'vitest';
import {
  clampIndex,
  counterNumber,
  fitsFeatureCarousel,
  initialIndex,
  keyTarget,
  nearestIndex,
  releaseIndex,
} from './feature-carousel';

describe('fitsFeatureCarousel', () => {
  it('accepts 2 to 12 pieces', () => {
    expect(fitsFeatureCarousel(1)).toBe(false);
    expect(fitsFeatureCarousel(2)).toBe(true);
    expect(fitsFeatureCarousel(12)).toBe(true);
    expect(fitsFeatureCarousel(13)).toBe(false);
  });
});

describe('clampIndex', () => {
  it('keeps the index inside the list', () => {
    expect(clampIndex(-1, 4)).toBe(0);
    expect(clampIndex(9, 4)).toBe(3);
    expect(clampIndex(2, 4)).toBe(2);
    expect(clampIndex(3, 0)).toBe(0);
  });
});

describe('initialIndex', () => {
  it('opens on the second piece when there is one on each side', () => {
    expect(initialIndex(1)).toBe(0);
    expect(initialIndex(2)).toBe(0);
    expect(initialIndex(3)).toBe(1);
    expect(initialIndex(12)).toBe(1);
  });
});

describe('nearestIndex', () => {
  it('picks the center closest to the middle of the track', () => {
    expect(nearestIndex([100, 400, 700], 380)).toBe(1);
    expect(nearestIndex([100, 400, 700], 640)).toBe(2);
    expect(nearestIndex([100, 400, 700], 0)).toBe(0);
  });

  it('keeps the first one on a tie', () => {
    expect(nearestIndex([100, 300], 200)).toBe(0);
  });
});

describe('releaseIndex', () => {
  it('lands on the nearest piece after a slow drag', () => {
    expect(releaseIndex(3, 2, 0.1, 6)).toBe(3);
    expect(releaseIndex(2, 2, -0.1, 6)).toBe(2);
  });

  it('moves one piece on a quick flick that did not cross the middle', () => {
    expect(releaseIndex(2, 2, 0.8, 6)).toBe(3);
    expect(releaseIndex(2, 2, -0.8, 6)).toBe(1);
  });

  it('never leaves the list', () => {
    expect(releaseIndex(5, 5, 2, 6)).toBe(5);
    expect(releaseIndex(0, 0, -2, 6)).toBe(0);
  });
});

describe('keyTarget', () => {
  it('moves with the arrows and jumps with Home and End', () => {
    expect(keyTarget('ArrowRight', 1, 4)).toBe(2);
    expect(keyTarget('ArrowLeft', 1, 4)).toBe(0);
    expect(keyTarget('ArrowLeft', 0, 4)).toBe(0);
    expect(keyTarget('ArrowRight', 3, 4)).toBe(3);
    expect(keyTarget('Home', 3, 4)).toBe(0);
    expect(keyTarget('End', 0, 4)).toBe(3);
  });

  it('ignores other keys', () => {
    expect(keyTarget('Enter', 1, 4)).toBeNull();
  });
});

describe('counterNumber', () => {
  it('pads to two digits', () => {
    expect(counterNumber(3)).toBe('03');
    expect(counterNumber(12)).toBe('12');
  });
});
