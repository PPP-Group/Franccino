import { describe, expect, it, vi } from 'vitest';
import { productCard } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { ProductPlate } from './ProductPlate';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('ProductPlate', () => {
  it('links to the product and shows designer, category and area identity', () => {
    const html = renderWithIntl(
      <ProductPlate
        product={productCard({ area: { key: 'outdoor', name: 'Outdoor', brand_name: 'Franccino Giardini' } })}
      />,
    );
    expect(html).toContain('href="/products/cadeira-aura"');
    expect(html).toContain('Cadeira Aura');
    expect(html).toContain('Daniela Ferro');
    expect(html).toContain('Cadeiras');
    expect(html).toContain('area-dot--giardini');
  });

  it('shows the new tag only when asked and the product is new', () => {
    expect(renderWithIntl(<ProductPlate product={productCard()} showNew />)).toContain('tag--new');
    expect(renderWithIntl(<ProductPlate product={productCard()} />)).not.toContain('tag--new');
    expect(renderWithIntl(<ProductPlate product={productCard({ is_new: false })} showNew />)).not.toContain(
      'tag--new',
    );
  });

  it('has a labelled quick add button and survives a missing cover', () => {
    const html = renderWithIntl(<ProductPlate product={productCard({ cover: null, designer: null })} />);
    expect(html).toContain('aria-label="Adicionar Cadeira Aura à lista de orçamento"');
    expect(html).toContain('plate__media--empty');
  });
});
