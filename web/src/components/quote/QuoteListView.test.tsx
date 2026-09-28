import { describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { QuoteListView } from './QuoteListView';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);
vi.mock('@/components/forms/Turnstile', () => ({ Turnstile: () => null }));

describe('QuoteListView', () => {
  it('renders a busy placeholder on the server instead of flashing the empty state', () => {
    const html = renderWithIntl(<QuoteListView whatsapp="5511942900080" />);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('Sua lista de orçamento está vazia');
  });
});
