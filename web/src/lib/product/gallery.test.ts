import { describe, expect, it } from 'vitest';
import { image } from '@/test/fixtures';
import { galleryImages } from './gallery';

describe('galleryImages', () => {
  it('puts the cover first and removes repeated images', () => {
    const cover = image({ id: 1 });
    const ambient = image({ id: 2 });
    expect(galleryImages({ cover, gallery: [cover, ambient] }).map((item) => item.id)).toEqual([1, 2]);
    expect(galleryImages({ cover: null, gallery: [ambient] }).map((item) => item.id)).toEqual([2]);
  });
});
