import { describe, expect, it } from 'vitest';
import { naturalPhoto, PEEK_PHOTO, peekBox, peekPosition } from './row-peek';

describe('peekBox', () => {
  it('grows with the photos laid side by side', () => {
    expect(peekBox(3).width - peekBox(2).width).toBe(PEEK_PHOTO.step);
    expect(peekBox(1).width).toBeGreaterThan(PEEK_PHOTO.width);
    expect(peekBox(0)).toEqual(peekBox(1));
  });
});

describe('peekPosition', () => {
  const box = peekBox(3);

  it('sits to the right of and below the pointer', () => {
    expect(peekPosition(400, 300, 1440, 900, box)).toEqual({ x: 428, y: 328 });
  });

  it('flips to the left near the right edge, never covering the pointer', () => {
    const { x } = peekPosition(1300, 300, 1440, 900, box);
    expect(x + box.width).toBeLessThan(1300);
  });

  it('flips above the pointer near the bottom and stays inside the viewport', () => {
    const { y } = peekPosition(400, 850, 1440, 900, box);
    expect(y + box.height).toBeLessThan(850);
    expect(peekPosition(400, 10, 1440, 120, box).y).toBe(16);
  });
});

describe('naturalPhoto', () => {
  it('keeps the photo in its own proportion with the same visual weight', () => {
    const wide = naturalPhoto(1920, 1080);
    const tall = naturalPhoto(640, 960);
    expect(wide.width).toBeGreaterThan(wide.height);
    expect(tall.height).toBeGreaterThan(tall.width);
    expect(Math.abs(wide.width * wide.height - tall.width * tall.height)).toBeLessThan(2500);
  });

  it('falls back to a portrait without the size and never grows past the limit', () => {
    expect(naturalPhoto(null, null).height).toBeGreaterThan(naturalPhoto(null, null).width);
    const panorama = naturalPhoto(4000, 500);
    expect(Math.max(panorama.width, panorama.height)).toBeLessThanOrEqual(220);
  });
});
