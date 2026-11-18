import { describe, expect, it } from 'vitest';
import type { AreaDetail } from '@/lib/api/catalog';
import type { CollectionCard } from '@/lib/api/types';
import { navMenus, navTabImages } from './area-menu';

const area = (categories: { slug: string; name: string; product_count: number }[]) =>
  ({ categories }) as unknown as AreaDetail;
const collection = (slug: string, name: string, product_count: number) =>
  ({ slug, name, product_count }) as unknown as CollectionCard;

describe('navMenus', () => {
  it('keeps only categories and collections with pieces, in alphabetical order', () => {
    const menus = navMenus(
      area([
        { slug: 'sofas', name: 'Sofás', product_count: 3 },
        { slug: 'vazia', name: 'Vazia', product_count: 0 },
        { slug: 'cadeiras', name: 'Cadeiras', product_count: 2 },
      ]),
      null,
      [collection('tempo', 'Tempo', 4), collection('sem-pecas', 'Sem peças', 0), collection('bou', 'Bou', 1)],
    );
    expect(menus.indoor).toEqual([
      { slug: 'cadeiras', name: 'Cadeiras' },
      { slug: 'sofas', name: 'Sofás' },
    ]);
    expect(menus.outdoor).toEqual([]);
    expect(menus.collections).toEqual([
      { slug: 'bou', name: 'Bou' },
      { slug: 'tempo', name: 'Tempo' },
    ]);
  });
});

describe('menu photos', () => {
  const image = (id: number) => ({
    id,
    alt: '',
    width: 800,
    height: 600,
    src: `https://api/${id}.webp`,
    srcset: [],
    blur_data_url: null,
  });

  it('keeps the first cover a category has in either line, and the collection covers', () => {
    const menus = navMenus(
      {
        categories: [{ slug: 'cadeiras', name: 'Cadeiras', product_count: 2, cover: null }],
      } as unknown as AreaDetail,
      {
        categories: [{ slug: 'cadeiras', name: 'Cadeiras', product_count: 1, cover: image(2) }],
      } as unknown as AreaDetail,
      [{ slug: 'tempo', name: 'Tempo', product_count: 3, cover: image(5) } as unknown as CollectionCard],
    );
    expect(menus.products[0].image?.id).toBe(2);
    expect(menus.collections[0].image?.id).toBe(5);
  });

  it('uses each area cover and, for finishes, the page cover or the first swatch', () => {
    const indoor = { cover: image(1) } as unknown as AreaDetail;
    expect(navTabImages(indoor, null, null, [null, image(9)])).toEqual({
      indoor: image(1),
      outdoor: null,
      finishes: image(9),
    });
    expect(navTabImages(null, null, { cover: image(7) }, [image(9)]).finishes?.id).toBe(7);
  });
});
