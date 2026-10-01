import { describe, expect, it, vi } from 'vitest';
import { productCard } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { DownloadsTable } from './DownloadsTable';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('DownloadsTable', () => {
  it('lists each piece with its files in a scrollable, labelled table', () => {
    const html = renderWithIntl(
      <DownloadsTable
        rows={[
          {
            ...productCard({ slug: 'aura', name: 'Cadeira Aura' }),
            files: [{ id: 7, type: 'block_3d', title: 'Bloco 3D', format: 'dwg', size: 1024 }],
          },
        ]}
      />,
    );
    expect(html).toContain('class="table-scroll"');
    expect(html).toContain('<caption class="visually-hidden">');
    expect(html).toContain('href="/products/aura"');
    expect(html).toContain('Bloco 3D');
  });
});
