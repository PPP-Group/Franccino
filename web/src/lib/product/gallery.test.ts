import { describe, expect, it } from 'vitest';
import { image } from '@/test/fixtures';
import { galleryImages, stepIndex } from './gallery';

describe('galleryImages', () => {
  it('puts the cover first and removes repeated images', () => {
    const cover = image({ id: 1 });
    const ambient = image({ id: 2 });
    expect(galleryImages({ cover, gallery: [cover, ambient] }).map((item) => item.id)).toEqual([1, 2]);
    expect(galleryImages({ cover: null, gallery: [ambient] }).map((item) => item.id)).toEqual([2]);
  });
});

describe('stepIndex', () => {
  it('passa para a próxima e para a anterior, dando a volta nas pontas', () => {
    expect(stepIndex(0, 1, 3)).toBe(1);
    expect(stepIndex(2, 1, 3)).toBe(0);
    expect(stepIndex(0, -1, 3)).toBe(2);
    expect(stepIndex(0, 1, 0)).toBe(0);
  });
});
