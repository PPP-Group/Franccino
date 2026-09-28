import { describe, expect, it } from 'vitest';
import type { Image } from '@/lib/api/types';
import { buildSrcSet, pickSource } from './srcset';

const image: Image = {
  id: 1,
  alt: 'Poltrona Franccino',
  width: 1200,
  height: 1200,
  src: 'https://cdn.test/poltrona-960.jpg',
  srcset: [
    { width: 480, url: 'https://cdn.test/poltrona-480.jpg' },
    { width: 960, url: 'https://cdn.test/poltrona-960.jpg' },
  ],
  blur_data_url: null,
};

const imageWithoutSrcset: Image = { ...image, srcset: [] };

describe('buildSrcSet', () => {
  it('joins every conversion as "url Nw"', () => {
    expect(buildSrcSet(image)).toBe(
      'https://cdn.test/poltrona-480.jpg 480w, https://cdn.test/poltrona-960.jpg 960w',
    );
  });

  it('returns an empty string when there is no conversion', () => {
    expect(buildSrcSet(imageWithoutSrcset)).toBe('');
  });
});

describe('pickSource', () => {
  it('picks the smallest conversion that is at least as wide as requested', () => {
    expect(pickSource(image, 700)).toBe('https://cdn.test/poltrona-960.jpg');
  });

  it('falls back to the largest conversion when none is wide enough', () => {
    expect(pickSource(image, 5000)).toBe('https://cdn.test/poltrona-960.jpg');
  });

  it('uses src when there is no srcset', () => {
    expect(pickSource(imageWithoutSrcset, 700)).toBe(imageWithoutSrcset.src);
  });
});
