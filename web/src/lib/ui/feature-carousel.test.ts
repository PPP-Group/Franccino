import { describe, expect, it } from 'vitest';
import {
  clampIndex,
  counterNumber,
  coverflowPose,
  dragPosition,
  carouselPieces,
  carouselSlots,
  fitsFeatureCarousel,
  cutoutMorphBox,
  initialIndex,
  keyTarget,
  loopOffset,
  positionFor,
  wrapIndex,
  nearestIndex,
  pieceWidthFactor,
  releaseIndex,
  wheelStep,
} from './feature-carousel';

describe('carouselSlots', () => {
  it('repete a lista até encher os 7 lugares, para os dois lados ficarem iguais', () => {
    expect(carouselSlots([1, 2, 3, 4]).map((slot) => slot.item)).toEqual([1, 2, 3, 4, 1, 2, 3, 4]);
    expect(carouselSlots([1, 2, 3, 4]).map((slot) => slot.copy)).toEqual([0, 0, 0, 0, 1, 1, 1, 1]);
    expect(carouselSlots([1, 2, 3])).toHaveLength(9);
    expect(carouselSlots([1, 2, 3, 4, 5, 6, 7])).toHaveLength(7);
    expect(carouselSlots([1, 2])).toHaveLength(2);
  });
});

describe('fitsFeatureCarousel', () => {
  it('accepts 3 or more pieces', () => {
    expect(fitsFeatureCarousel(1)).toBe(false);
    expect(fitsFeatureCarousel(2)).toBe(false);
    expect(fitsFeatureCarousel(3)).toBe(true);
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
  it('opens on the first piece, in the exact centre (retorno de 12/11/2026)', () => {
    expect(initialIndex()).toBe(0);
  });
});

describe('loop', () => {
  it('wraps any position to a piece', () => {
    expect(wrapIndex(0, 6)).toBe(0);
    expect(wrapIndex(7, 6)).toBe(1);
    expect(wrapIndex(-1, 6)).toBe(5);
  });

  it('places the last pieces on the left of the first one', () => {
    expect(loopOffset(5, 0, 6)).toBe(-1);
    expect(loopOffset(4, 0, 6)).toBe(-2);
    expect(loopOffset(1, 0, 6)).toBe(1);
    expect(loopOffset(0, 7, 6)).toBe(-1);
  });

  it('keeps the plain distance with two pieces (no loop)', () => {
    expect(loopOffset(1, 0, 2)).toBe(1);
  });

  it('goes to a piece by the shortest way', () => {
    expect(positionFor(5, 0, 6)).toBe(-1);
    expect(positionFor(2, 12, 6)).toBe(14);
    expect(positionFor(1, 0, 2)).toBe(1);
  });
});

describe('cutoutMorphBox', () => {
  it('sizes the morph box as the cover, with the cut-out piece inside it', () => {
    expect(cutoutMorphBox({ width: 1080, height: 1350 }, { width: 540, height: 600 })).toEqual({
      scale: 2,
      coverRatio: 1.25,
      cutoutRatio: 600 / 540,
    });
  });

  it('gives up when the sizes do not fit', () => {
    expect(cutoutMorphBox({ width: 500, height: 500 }, { width: 600, height: 300 })).toBeNull();
    expect(cutoutMorphBox(null, { width: 600, height: 300 })).toBeNull();
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

  it('keeps the neighbour clear of the centre piece (revisão de 12/11/2026: sem peça embaralhada)', () => {
    const one = coverflowPose(1);
    // Borda esquerda da vizinha (em larguras da peça do centro) depois da borda direita da peça do centro (0,5).
    expect(one.x - one.scale / 2).toBeGreaterThan(0.5);
    expect(one.scale).toBeLessThan(0.6);
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

  it('resists past the ends only without the loop', () => {
    expect(dragPosition(0, 100, 100, 2)).toBeCloseTo(-0.3);
    expect(dragPosition(1, -100, 100, 2)).toBeCloseTo(1.3);
    expect(dragPosition(0, 100, 100, 6)).toBe(-1);
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

  it('never leaves the list without the loop, and goes on with it', () => {
    expect(releaseIndex(1, 1, 2, 2)).toBe(1);
    expect(releaseIndex(0, 0, -2, 2)).toBe(0);
    expect(releaseIndex(5, 5, 2, 6)).toBe(6);
  });
});

describe('keyTarget', () => {
  it('moves with the arrows and jumps with Home and End', () => {
    expect(keyTarget('ArrowRight', 1, 4)).toBe(2);
    expect(keyTarget('ArrowLeft', 1, 4)).toBe(0);
    // Dando a volta: da primeira, a seta da esquerda vai para a última.
    expect(keyTarget('ArrowLeft', 0, 4)).toBe(-1);
    expect(keyTarget('Home', 3, 4)).toBe(4);
    expect(keyTarget('End', 0, 4)).toBe(-1);
    expect(keyTarget('ArrowRight', 1, 2)).toBe(1);
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

describe('pieceWidthFactor', () => {
  it('gives wide pieces more width and tall pieces a little more height, with limits', () => {
    expect(pieceWidthFactor(1000, 1000)).toBe(1);
    expect(pieceWidthFactor(2000, 1000)).toBeCloseTo(Math.SQRT2);
    expect(pieceWidthFactor(5000, 1000)).toBe(1.55);
    // Alta (3:4): altura 1/√0.75 ≈ 1.155, limitada a 1.12; a largura segue a proporção.
    expect(pieceWidthFactor(750, 1000)).toBeCloseTo(0.75 * 1.12);
    expect(pieceWidthFactor(null, 1000)).toBe(1);
    expect(pieceWidthFactor(0, 0)).toBe(1);
  });

  it('keeps the visible area of wide and square pieces close', () => {
    const area = (w: number, h: number) => {
      const factor = pieceWidthFactor(w, h);
      return factor * ((factor * h) / w);
    };
    expect(area(2000, 1000)).toBeCloseTo(area(1000, 1000), 1);
  });
});
