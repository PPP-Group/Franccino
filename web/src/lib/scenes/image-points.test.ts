import { describe, expect, it } from 'vitest';
import type { Image, ImagePoints } from '@/lib/api/types';
import { asScene, pickPoints } from './image-points';

const image = (id: number) =>
  ({ id, alt: '', width: 1600, height: 900, src: '', srcset: [] }) as unknown as Image;
const points = (mediaId: number, count = 1): ImagePoints => ({
  id: mediaId * 10,
  media_id: mediaId,
  title: `Foto ${mediaId}`,
  hotspots: Array.from({ length: count }, () => ({
    x: 50,
    y: 50,
    product: { slug: 'cadeira-aura' },
  })) as ImagePoints['hotspots'],
});

describe('pickPoints', () => {
  it('keeps only the photos shown on the page, with at least one point', () => {
    const index = pickPoints([points(1), points(2), points(3, 0)], [image(1), null, image(3)]);
    expect(Object.keys(index)).toEqual(['1']);
  });

  it('turns the points of a photo into a scene over that photo', () => {
    const scene = asScene(points(7), image(7));
    expect(scene.id).toBe(70);
    expect(scene.image.id).toBe(7);
    expect(scene.hotspots).toHaveLength(1);
  });
});
