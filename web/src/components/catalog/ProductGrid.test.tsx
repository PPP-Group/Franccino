import { describe, expect, it, vi } from 'vitest';
import { productCard } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { ProductGrid } from './ProductGrid';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

const cards = (count: number) =>
  Array.from({ length: count }, (_, index) => productCard({ id: index + 1, slug: `peca-${index + 1}` }));

describe('ProductGrid', () => {
  it('fills the empty cells of the last row', () => {
    const html = renderWithIntl(<ProductGrid products={cards(4)} />);
    expect(html).toContain('grid-fill--d2 grid-fill--m0');
  });

  it('adds nothing when the rows are already complete', () => {
    expect(renderWithIntl(<ProductGrid products={cards(6)} />)).not.toContain('grid-fill');
    expect(renderWithIntl(<ProductGrid products={cards(4)} fill={false} />)).not.toContain('grid-fill');
  });
});
