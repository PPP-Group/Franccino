import { describe, expect, it } from 'vitest';
import {
  clampIndex,
  counterNumber,
  coverflowPose,
  dragPosition,
  carouselPieces,
  fitsFeatureCarousel,
  initialIndex,
  keyTarget,
  nearestIndex,
  releaseIndex,
  wheelStep,
} from './feature-carousel';

describe('fitsFeatureCarousel', () => {
  it('accepts 2 or more pieces', () => {
    expect(fitsFeatureCarousel(1)).toBe(false);
    expect(fitsFeatureCarousel(2)).toBe(true);
    expect(fitsFeatureCarousel(15)).toBe(true);
    expect(fitsFeatureCarousel(40)).toBe(true);
  });

  it('limita as peças do carrossel', () => {
    const items = Array.from({ length: 30 }, (_, index) => index);
    expect(carouselPieces(items)).toHaveLength(24);
    expect(carouselPieces(items.slice(0, 15))).toHaveLength(15);
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
  it('opens with neighbours on both sides, at most two on the left', () => {
    expect(initialIndex(1)).toBe(0);
    expect(initialIndex(2)).toBe(0);
    expect(initialIndex(3)).toBe(1);
    expect(initialIndex(4)).toBe(1);
    expect(initialIndex(5)).toBe(2);
    expect(initialIndex(12)).toBe(2);
  });
});

describe('coverflowPose', () => {
  it('keeps the centre piece full size, sharp and in front', () => {
    expect(coverflowPose(0)).toEqual({ x: 0, scale: 1, fade: 0, opacity: 1, z: 100, hidden: false });
  });

  it('shrinks and fades the neighbours the further they are, on the right side of the offset', () => {
    const one = coverflowPose(1);
    const two = coverflowPose(2);
    const left = coverflowPose(-1);
    expect(one.x).toBeGreaterThan(0);
    expect(left.x).toBe(-one.x);
    expect(two.x).toBeGreaterThan(one.x);
    expect(two.scale).toBeLessThan(one.scale);
    expect(one.scale).toBeLessThan(1);
    expect(two.fade).toBeGreaterThan(one.fade);
    expect(two.z).toBeLessThan(one.z);
  });

  it('overlaps the neighbour with the centre piece (packed stack)', () => {
    const one = coverflowPose(1);
    // Borda esquerda da vizinha (em larguras da peça do centro) antes da borda direita da peça do centro (0,5).
    expect(one.x - one.scale / 2).toBeLessThan(0.5);
  });

  it('never makes a visible piece see-through: the veil covers it instead', () => {
    [1, 2, 3].forEach((step) => expect(coverflowPose(step).opacity).toBe(1));
    expect(coverflowPose(3).fade).toBeGreaterThan(coverflowPose(2).fade);
  });

  it('interpolates between steps while dragging', () => {
    const half = coverflowPose(0.5);
    expect(half.scale).toBeLessThan(1);
    expect(half.scale).toBeGreaterThan(coverflowPose(1).scale);
  });

  it('hides the pieces beyond the visible ones', () => {
    expect(coverflowPose(3).hidden).toBe(false);
    expect(coverflowPose(4).hidden).toBe(true);
    expect(coverflowPose(-7).hidden).toBe(true);
  });
});

describe('dragPosition', () => {
  it('moves one piece per step and goes back when dragging right', () => {
    expect(dragPosition(2, -100, 100, 6)).toBe(3);
    expect(dragPosition(2, 50, 100, 6)).toBe(1.5);
  });

  it('resists past the ends', () => {
    expect(dragPosition(0, 100, 100, 6)).toBeCloseTo(-0.3);
    expect(dragPosition(5, -100, 100, 6)).toBeCloseTo(5.3);
  });

  it('stays at zero without pieces or width', () => {
    expect(dragPosition(1, 10, 0, 4)).toBe(0);
    expect(dragPosition(1, 10, 100, 0)).toBe(0);
  });
});

describe('wheelStep', () => {
  it('moves one piece once the sideways scroll is long enough', () => {
    expect(wheelStep(30)).toEqual({ step: 0, rest: 30 });
    expect(wheelStep(80)).toEqual({ step: 1, rest: 0 });
    expect(wheelStep(-200)).toEqual({ step: -1, rest: 0 });
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
