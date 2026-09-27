import { describe, expect, it, vi } from 'vitest';
import { EMPTY_SETTINGS } from '@/lib/settings';
import { renderWithIntl } from '@/test/intl';
import { SiteFooter } from './SiteFooter';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);
vi.mock('@/components/forms/Turnstile', () => ({ Turnstile: () => null }));

describe('SiteFooter', () => {
  it('renders contacts and documents from settings only', () => {
    const html = renderWithIntl(
      <SiteFooter
        settings={{
          ...EMPTY_SETTINGS,
          contact_phone: '(37) 3381-4204',
          quotes_whatsapp: '5511942900080',
          footer_documents: [{ label: 'Relatório de transparência', url: 'https://cdn.test/relatorio.pdf' }],
        }}
      />,
    );
    expect(html).toContain('href="tel:+553733814204"');
    expect(html).toContain('href="https://wa.me/5511942900080"');
    expect(html).not.toContain('wa.me/"');
    expect(html).toContain('Relatório de transparência');
    expect(html).toContain('href="/privacy"');
  });

  it('omits whatsapp links when there is no number', () => {
    expect(renderWithIntl(<SiteFooter settings={EMPTY_SETTINGS} />)).not.toContain('wa.me');
  });

  it('labels each footer group as a section tied to its heading', () => {
    const html = renderWithIntl(<SiteFooter settings={EMPTY_SETTINGS} />);
    for (const id of ['footer-catalog-heading', 'footer-service-heading', 'footer-newsletter-heading']) {
      expect(html).toContain(`aria-labelledby="${id}"`);
      expect(html).toContain(`id="${id}"`);
    }
  });
});
