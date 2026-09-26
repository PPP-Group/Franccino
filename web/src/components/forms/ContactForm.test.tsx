import { describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { ContactForm } from './ContactForm';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);
vi.mock('@/components/forms/Turnstile', () => ({ Turnstile: () => null }));

describe('ContactForm', () => {
  it('shows the subject select only when selectable', () => {
    expect(renderWithIntl(<ContactForm typeSelectable />)).toContain('name="type"');
    expect(renderWithIntl(<ContactForm type="quote" />)).not.toContain('name="type"');
  });

  it('links the consent to the privacy page', () => {
    expect(renderWithIntl(<ContactForm />)).toContain('href="/privacy"');
  });

  it('does not require the message when the quote list composes it', () => {
    const html = renderWithIntl(
      <ContactForm type="quote" messageRequired={false} messageLabel="Observações" />,
    );
    const textarea = html.match(/<textarea[^>]*>/)?.[0] ?? '';
    expect(textarea).toContain('name="message"');
    expect(textarea).not.toContain('required');
    expect(html).toContain('Observações');
  });

  it('offers all Brazilian states and every profession of the contract', () => {
    const html = renderWithIntl(<ContactForm />);
    expect(html.match(/<option value="[A-Z]{2}">/g)).toHaveLength(27);
    for (const value of ['architect', 'interior_designer', 'retailer', 'end_customer', 'other']) {
      expect(html).toContain(`value="${value}"`);
    }
  });
});
