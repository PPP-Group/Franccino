import { describe, expect, it } from 'vitest';
import { EMPTY_SETTINGS } from '@/lib/settings';
import { renderWithIntl } from '@/test/intl';
import { ContactChannels } from './ContactChannels';

describe('ContactChannels', () => {
  it('shows only the channels the panel filled in', () => {
    const html = renderWithIntl(
      <ContactChannels
        settings={{ ...EMPTY_SETTINGS, contact_phone: '(37) 3381-4204', quotes_whatsapp: '5511942900080' }}
      />,
    );
    expect(html).toContain('href="tel:+553733814204"');
    expect(html).toContain('href="https://wa.me/5511942900080"');
    expect(html).not.toContain('mailto:');
  });

  it('renders nothing without any channel', () => {
    expect(renderWithIntl(<ContactChannels settings={EMPTY_SETTINGS} />)).toBe('');
  });
});
