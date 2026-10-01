import { describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { PageHead } from './PageHead';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('PageHead', () => {
  it('renders the trail from home to the current page, the h1 and the lead', () => {
    const html = renderWithIntl(
      <PageHead title="Tempo" lead="Resumo" trail={[{ label: 'Coleções', href: '/collections' }]} />,
    );
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/collections"');
    expect(html).toContain('aria-current="page">Tempo</span>');
    expect(html).toContain('<h1>Tempo</h1>');
    expect(html).toContain('<p class="lead">Resumo</p>');
  });

  it('omits an empty lead', () => {
    expect(renderWithIntl(<PageHead title="Lojas" lead={null} />)).not.toContain('class="lead"');
  });
});
