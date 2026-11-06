import { describe, expect, it } from 'vitest';
import { coverScale, fixedBoxCoverSizes, PAGE_BANNER_HEIGHT, pageBannerSizes } from './cover-sizes';

const strip = { width: 1920, height: 500 };
const photo = { width: 1500, height: 1000 };

describe('coverScale', () => {
  it('measures how much wider than the box a cropped image is drawn', () => {
    expect(coverScale(3.84, 16 / 9)).toBe(2.16);
    expect(coverScale(1.5, 16 / 9)).toBe(1);
    expect(coverScale(null, 16 / 9)).toBe(1);
  });
});

describe('fixedBoxCoverSizes', () => {
  const slots = [{ media: '(max-width: 48rem)', width: '100vw' }, { width: '50vw' }];

  it('scales every slot for a WordPress strip in a 16:9 tile', () => {
    expect(fixedBoxCoverSizes(strip, 16 / 9, slots)).toBe(
      '(max-width: 48rem) calc(100vw * 2.16), calc(50vw * 2.16)',
    );
  });

  it('uses the ratio a slot declares (a tile that spans the whole row)', () => {
    expect(
      fixedBoxCoverSizes(strip, 16 / 9, [
        { media: '(max-width: 48rem)', width: '100vw' },
        { width: '100vw', boxRatio: 32 / 9 },
      ]),
    ).toBe('(max-width: 48rem) calc(100vw * 2.16), calc(100vw * 1.08)');
  });

  it('keeps the tile width for an image narrower than the tile', () => {
    expect(fixedBoxCoverSizes(photo, 16 / 9, slots)).toBe('(max-width: 48rem) 100vw, 50vw');
    expect(fixedBoxCoverSizes(null, 16 / 9, slots)).toBe('(max-width: 48rem) 100vw, 50vw');
  });
});

describe('pageBannerSizes', () => {
  it('counts the crop of a photo in the fixed-height page banner', () => {
    expect(pageBannerSizes(photo)).toBe(`max(100vw, calc(${PAGE_BANNER_HEIGHT} * 1.5))`);
    expect(pageBannerSizes({ width: null, height: null })).toBe('100vw');
  });
});
