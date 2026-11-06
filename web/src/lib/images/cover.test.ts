import { describe, expect, it } from 'vitest';
import { aspectRatio, coverSizes, HERO_HEIGHT, heroSizes, isWideArt } from './cover';

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

describe('coverSizes', () => {
  it('asks for the drawn width of a cropped image (height × ratio when wider than the box)', () => {
    expect(coverSizes(1.5, { width: '100vw', height: '600px' })).toBe('max(100vw, calc(600px * 1.5))');
    expect(coverSizes(null, { width: '50vw', height: '600px' })).toBe('50vw');
  });
});

describe('heroSizes', () => {
  it('fills the whole screen, so a 1920×500 strip asks for the width drawn at the screen height', () => {
    expect(HERO_HEIGHT).toBe('100vh');
    expect(heroSizes({ width: 1920, height: 500 })).toBe('max(100vw, calc(100vh * 3.84))');
  });

  it('counts the crop of a photo and falls back to the screen width without measures', () => {
    expect(heroSizes({ width: 1500, height: 1000 })).toBe('max(100vw, calc(100vh * 1.5))');
    expect(heroSizes({ width: null, height: null })).toBe('100vw');
  });
});
