import { describe, expect, it } from 'vitest';
import type { AreaDetail } from '@/lib/api/catalog';
import type { CollectionCard } from '@/lib/api/types';
import { navMenus } from './area-menu';

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
