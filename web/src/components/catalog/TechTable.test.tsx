import { describe, expect, it, vi } from 'vitest';
import { productCard } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { TechTable } from './TechTable';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('TechTable', () => {
  it('renders dimensions, files and the add button per row', () => {
    const html = renderWithIntl(
      <TechTable
        rows={[
          {
            product: productCard(),
            dimension: {
              label: null,
              width: 520,
              depth: 560,
              height: 800,
              seat_height: null,
              diameter: null,
            },
            files: [{ id: 9, type: 'block_2d', title: 'Bloco 2D', format: 'DWG', size: 880_640 }],
          },
          {
            product: productCard({ id: 13, slug: 'mesa-joey', name: 'Mesa Joey' }),
            dimension: null,
            files: [],
          },
        ]}
      />,
    );
    expect(html).toContain('<caption');
    expect(html).toContain('scope="col"');
    expect(html).toContain('L 52 × P 56 × A 80 cm');
    expect(html).toContain('DWG');
    expect(html).toContain('aria-label="Baixar Bloco 2D (DWG)"');
    expect(html).toContain('aria-label="Adicionar Mesa Joey à lista de orçamento"');
  });
});
