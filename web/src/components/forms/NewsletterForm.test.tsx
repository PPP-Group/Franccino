import { describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { NewsletterForm } from './NewsletterForm';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);
vi.mock('@/components/forms/Turnstile', () => ({ Turnstile: () => null }));

describe('NewsletterForm', () => {
  it('asks for consent, as the api requires it', () => {
    const html = renderWithIntl(<NewsletterForm />);
    expect(html).toContain('name="consent"');
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('type="email"');
  });
});
