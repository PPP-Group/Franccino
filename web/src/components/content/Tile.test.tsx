import { describe, expect, it, vi } from 'vitest';
import { image } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { Tile } from './Tile';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('Tile', () => {
  it('links the whole card and lists the metadata', () => {
    const html = renderWithIntl(
      <Tile
        href={{ pathname: '/collections/[slug]', params: { slug: 'tempo' } }}
        title="Tempo"
        image={image()}
        meta={['2025', '12 peças']}
        text="Resumo"
      />,
    );
    expect(html).toContain('href="/collections/tempo"');
    expect(html).toContain('<h2 class="tile__title">Tempo</h2>');
    expect(html).toContain('<li>2025</li><li>12 peças</li>');
    expect(html).toContain('<img');
  });

  it('keeps the media ground without inventing an image', () => {
    const html = renderWithIntl(<Tile href="/designers" title="Sem retrato" portrait headingLevel="h3" />);
    expect(html).toContain('tile tile--portrait');
    expect(html).not.toContain('<img');
    expect(html).toContain('<h3 class="tile__title">');
  });
});
