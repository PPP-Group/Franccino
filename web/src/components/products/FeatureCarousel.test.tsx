import { describe, expect, it, vi } from 'vitest';
import { image, productCard } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { FeatureCarousel } from './FeatureCarousel';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

const cutout = image({ id: 99, src: 'https://cdn.test/aura-sem-fundo.webp', srcset: [] });

function products() {
  return [
    productCard({ id: 1, slug: 'mesa-epoca', name: 'Mesa Época' }),
    productCard({ id: 2, slug: 'cadeira-aura', name: 'Cadeira Aura', cutout }),
    productCard({ id: 3, slug: 'cadeira-toe', name: 'Cadeira Toé' }),
  ];
}

describe('FeatureCarousel', () => {
  it('uses the cut-out photo when there is one, and the cover on the white background otherwise', () => {
    const html = renderWithIntl(<FeatureCarousel label="Lançamentos" products={products()} />);
    expect(html).toContain('aura-sem-fundo.webp');
    expect(html.match(/is-cutout/g)).toHaveLength(1);
    expect(html.match(/is-packshot/g)).toHaveLength(2);
    expect(html).toContain('feature-carousel--packshots');
  });

  it('opens with the middle piece in front, named below, and only it reachable by Tab', () => {
    const html = renderWithIntl(<FeatureCarousel label="Lançamentos" products={products()} />);
    expect(html).toMatch(/feature-carousel__item is-cutout is-active/);
    expect(html).toContain('feature-carousel__name">Cadeira Aura');
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(html).toContain('02 / 03');
  });

  it('keeps the agreed adjustments: no finishes, no "view piece" button and no 3D', () => {
    const html = renderWithIntl(<FeatureCarousel label="Lançamentos" products={products()} />);
    expect(html).not.toContain('swatch');
    expect(html).not.toContain('3D');
  });
});
