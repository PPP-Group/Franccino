import { describe, expect, it } from 'vitest';
import { aspectRatio, coverSizes, frameAspect, HERO_HEIGHT, heroFrame, heroSizes, isWideArt } from './cover';

describe('aspectRatio', () => {
  it('divides width by height and needs both', () => {
    expect(aspectRatio({ width: 1600, height: 1200 })).toBeCloseTo(4 / 3);
    expect(aspectRatio({ width: 1600, height: null })).toBeNull();
    expect(aspectRatio({ width: null, height: 900 })).toBeNull();
    expect(aspectRatio(null)).toBeNull();
  });
});

describe('isWideArt', () => {
  it('treats the WordPress marketing strip (1920×500) as wide art, and a photo as not', () => {
    expect(isWideArt({ width: 1920, height: 500 })).toBe(true);
    expect(isWideArt({ width: 1921, height: 501 })).toBe(true);
    expect(isWideArt({ width: 2400, height: 1000 })).toBe(false);
    expect(isWideArt({ width: 1600, height: 900 })).toBe(false);
    expect(isWideArt({ width: null, height: null })).toBe(false);
  });
});

describe('heroFrame', () => {
  it('follows the art ratio for a wide strip and keeps the tall cover banner for photos', () => {
    const fit = heroFrame({ width: 1920, height: 500 });
    expect(fit).toEqual({ kind: 'fit', width: 1920, height: 500 });
    expect(frameAspect(fit)).toBe('1920 / 500');
    expect(heroFrame({ width: 1600, height: 1067 })).toEqual({ kind: 'cover' });
    expect(frameAspect(heroFrame(null))).toBeNull();
  });
});

describe('coverSizes', () => {
  it('asks for the drawn width of a cropped image (height × ratio when wider than the box)', () => {
    expect(coverSizes(1.5, { width: '100vw', height: '600px' })).toBe('max(100vw, calc(600px * 1.5))');
    expect(coverSizes(null, { width: '50vw', height: '600px' })).toBe('50vw');
  });
});

describe('heroSizes', () => {
  it('uses the viewport width when the art fills its own box without cropping', () => {
    const frame = heroFrame({ width: 1920, height: 500 });
    expect(heroSizes({ width: 1921, height: 501 }, frame)).toBe('100vw');
  });

  it('counts the crop of a photo in the tall banner', () => {
    expect(heroSizes({ width: 1500, height: 1000 }, { kind: 'cover' })).toBe(
      `max(100vw, calc(${HERO_HEIGHT} * 1.5))`,
    );
  });

  it('counts the crop of another slide with a different ratio inside a wide box', () => {
    const frame = heroFrame({ width: 1920, height: 480 });
    expect(heroSizes({ width: 1500, height: 1000 }, frame)).toBe('max(100vw, calc(calc(100vw / 4) * 1.5))');
  });
});
