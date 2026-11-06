import { describe, expect, it, vi } from 'vitest';
import { image } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { CardRail, type RailCard } from './CardRail';
import { CoverTile } from './CoverTile';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

const card = (id: number): RailCard => ({
  id,
  href: { pathname: '/collections/[slug]', params: { slug: `c-${id}` } },
  title: `Coleção ${id}`,
  image: image({ id }),
  meta: ['Corporativo'],
});

describe('CardRail', () => {
  it('scrolls sideways with many cards', () => {
    const html = renderWithIntl(<CardRail label="Outras" items={[card(1), card(2), card(3)]} />);
    expect(html).toContain('scroll-rail card-rail card-rail--wide');
    expect(html).toContain('href="/collections/c-3"');
    expect(html).toContain('hover-zoom');
  });

  it('splits the row with one or two wide cards, without a short rail', () => {
    const html = renderWithIntl(<CardRail label="Outras" items={[card(1), card(2)]} />);
    expect(html).not.toContain('scroll-rail');
    expect(html).toContain('card-rail__split');
    expect(html).toContain('--split-cols:2');
  });

  it('renders nothing without items', () => {
    expect(renderWithIntl(<CardRail label="Outras" items={[]} />)).toBe('');
  });
});

describe('CoverTile', () => {
  it('keeps the name in view on the tile that completes the grid', () => {
    const html = renderWithIntl(
      <CoverTile
        href="/products"
        title="Todas as peças"
        cta="Ver as peças"
        image={null}
        sizes="50vw"
        labelled
      />,
    );
    expect(html).toContain('collection-tile collection-tile--labelled');
    expect(html).not.toContain('<img');
  });
});
