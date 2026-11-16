import { describe, expect, it } from 'vitest';
import { PeekPhotos } from '@/components/catalog/PeekPhotos';
import type { Image } from '@/lib/api/types';
import { renderWithIntl } from '@/test/intl';
import { ProductColors } from './ProductColors';

const image = (id: number): Image => ({
  id,
  alt: `Foto ${id}`,
  width: 800,
  height: 600,
  src: `/foto-${id}.webp`,
  srcset: [],
  blur_data_url: null,
});

describe('ProductColors', () => {
  it('lists every colour of the group in a fixed order, with this one marked and the others as links', () => {
    const html = renderWithIntl(
      <ProductColors
        product={{
          id: 20,
          slug: 'cadeira-pita-verde',
          name: 'Cadeira Pita',
          cover: image(200),
          color: 'Verde',
          colors: [
            {
              id: 30,
              slug: 'cadeira-pita-laranja',
              name: 'Cadeira Pita',
              color: 'Laranja',
              cover: image(300),
            },
            { id: 10, slug: 'cadeira-pita-cinza', name: 'Cadeira Pita', color: null, cover: image(100) },
          ],
        }}
      />,
    );
    expect(html).toContain('aria-current="true"');
    expect(html).toContain('Cor atual: Verde');
    expect(html).toContain('/produtos/cadeira-pita-laranja');
    // Sem nome de cor, a peça usa o nome dela.
    expect(html).toContain('Ver na cor Cadeira Pita');
    expect(html.indexOf('cadeira-pita-cinza')).toBeLessThan(html.indexOf('aria-current'));
    expect(html.indexOf('aria-current')).toBeLessThan(html.indexOf('cadeira-pita-laranja'));
  });

  it('disappears for a piece without other colours', () => {
    const html = renderWithIntl(
      <ProductColors product={{ id: 1, slug: 'sofa', name: 'Sofá', cover: null, color: null, colors: [] }} />,
    );
    expect(html).toBe('');
  });
});

describe('PeekPhotos', () => {
  it('shows four photos per row and stacks the last one when there are more', () => {
    const html = renderWithIntl(<PeekPhotos images={[1, 2, 3, 4, 5].map(image)} />);
    expect(html.match(/row-peek__photo"/g)?.length ?? 0).toBe(3);
    expect(html.match(/row-peek__photo--more/g)?.length).toBe(1);
    expect(html).not.toContain('foto-5');
  });

  it('puts the photos of the piece first and the other colours on a labelled row below', () => {
    const html = renderWithIntl(<PeekPhotos images={[image(1), image(2)]} colors={[image(9)]} />);
    expect(html.indexOf('foto-1')).toBeLessThan(html.indexOf('foto-9'));
    expect(html).toMatch(/--row:1[^"]*--cap:26px[^"]*"[^>]*>(?:(?!row-peek__photo).)*foto-9/);
    expect(html).toContain('Também em outras cores');
    expect(html).not.toContain('row-peek__photo--more');
  });
});
