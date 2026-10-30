import { describe, expect, it, vi } from 'vitest';
import { image, productCard } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { SceneViewer } from './SceneViewer';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('SceneViewer', () => {
  it('places a labelled point on each piece, with the card closed until it is clicked', () => {
    const html = renderWithIntl(
      <SceneViewer
        scene={{
          id: 3,
          title: 'Varanda',
          image: image({ alt: 'Varanda com a coleção Tempo' }),
          hotspots: [{ x: 80, y: 70, product: productCard() }],
        }}
      />,
    );
    expect(html).toContain('aria-label="Peças em Varanda"');
    expect(html).toContain('left:80%;top:70%');
    expect(html).toContain('data-horizontal="end"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toMatch(/aria-label="Ver [^"]+"/);
    expect(html).toMatch(/class="scene__card" hidden=""/);
    expect(html).toContain('href="/products/');
  });
});
