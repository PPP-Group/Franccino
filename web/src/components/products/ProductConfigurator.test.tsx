import { describe, expect, it, vi } from 'vitest';
import { toProductCard } from '@/lib/catalog/card';
import { productDetail } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { ProductConfigurator } from './ProductConfigurator';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

const detail = productDetail();
const product = { ...toProductCard(detail), finishes: detail.finishes };

describe('ProductConfigurator', () => {
  it('renders accessible finish tabs and radios without a fake default', () => {
    const html = renderWithIntl(
      <ProductConfigurator product={product} whatsapp={null} finishesNote="Amostras nas lojas." />,
    );
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('role="radio"');
    expect(html).not.toContain('aria-checked="true"');
    expect(html).toContain('Amostras nas lojas.');
  });

  // Strengthens the "no fake default" guarantee (ruling C2 / preflight §5): the fixture above
  // only proves the tab shown by default (Madeira, index 0) isn't preselected — it says nothing
  // about a bug that would fake-select the first item of whichever tab happens to render first.
  // Here *every* group has more than one option, so there is no legitimate single-option group
  // left to preselect: any `aria-checked="true"` in the output can only be a fake default, no
  // matter which tab the component decides to show initially.
  it('never preselects a finish when every group has more than one option', () => {
    const noSingletonGroups = {
      ...product,
      finishes: [
        {
          group: 'Madeira',
          items: [
            { id: 101, name: 'Nogueira', code: 'MD-05', swatch: null },
            { id: 102, name: 'Freijó', code: 'MD-02', swatch: null },
          ],
        },
        {
          group: 'Tecido',
          items: [
            { id: 201, name: 'Linho cru', code: 'TC-110', swatch: null },
            { id: 202, name: 'Veludo verde', code: 'TC-200', swatch: null },
          ],
        },
      ],
    };
    const html = renderWithIntl(
      <ProductConfigurator product={noSingletonGroups} whatsapp={null} finishesNote={null} />,
    );
    expect(html).toContain('role="radio"');
    expect(html).not.toContain('aria-checked="true"');
  });

  it('prefills whatsapp with quantity, product and pending finish', () => {
    const html = renderWithIntl(
      <ProductConfigurator product={product} whatsapp="5511942900080" finishesNote={null} />,
    );
    expect(html).toContain('https://wa.me/5511942900080?text=');
    expect(html).toContain('Cadeira%20Aura');
    expect(html).toContain('href="/stores"');
  });

  it('hides whatsapp without a number and skips finishes when the product has none', () => {
    const html = renderWithIntl(
      <ProductConfigurator product={{ ...product, finishes: [] }} whatsapp={null} finishesNote={null} />,
    );
    expect(html).not.toContain('wa.me');
    expect(html).not.toContain('role="radiogroup"');
  });
});
