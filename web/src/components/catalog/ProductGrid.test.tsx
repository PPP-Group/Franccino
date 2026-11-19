import { describe, expect, it, vi } from 'vitest';
import { productCard } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { ProductGrid } from './ProductGrid';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

const cards = (count: number) =>
  Array.from({ length: count }, (_, index) => productCard({ id: index + 1, slug: `peca-${index + 1}` }));

describe('ProductGrid', () => {
  it('leaves the last row as it is by default (the "orientação" cell left the site on 18/11/2026)', () => {
    expect(renderWithIntl(<ProductGrid products={cards(4)} />)).not.toContain('grid-fill');
  });

  it('fills the empty cells of the last row when asked', () => {
    const html = renderWithIntl(<ProductGrid products={cards(4)} fill />);
    expect(html).toContain('grid-fill--d2 grid-fill--m0');
  });

  it('adds nothing when the rows are already complete', () => {
    expect(renderWithIntl(<ProductGrid products={cards(6)} fill />)).not.toContain('grid-fill');
  });
});
