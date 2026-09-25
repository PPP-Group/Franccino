import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumbs } from './Breadcrumbs';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('Breadcrumbs', () => {
  it('links every item but the last, which is the current page', () => {
    const html = renderToStaticMarkup(
      <Breadcrumbs
        label="Você está em"
        items={[
          { label: 'Início', href: '/' },
          { label: 'Produtos', href: '/products' },
          { label: 'Cadeira Aura' },
        ]}
      />,
    );
    expect(html).toContain('aria-label="Você está em"');
    expect(html).toContain('<a href="/">Início</a>');
    expect(html).toContain('<a href="/products">Produtos</a>');
    expect(html).toContain('<span aria-current="page">Cadeira Aura</span>');
  });
});
