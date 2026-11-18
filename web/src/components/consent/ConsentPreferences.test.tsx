import { describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { ConsentPreferences } from './ConsentPreferences';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);
// The preferences only render in the browser (the choice lives there).
vi.mock('@/lib/ui/use-is-client', () => ({ useIsClient: () => true }));

describe('ConsentPreferences', () => {
  it('uses the texts edited in the panel and keeps the standard one where the panel left it empty', () => {
    const html = renderWithIntl(
      <ConsentPreferences
        texts={{ analytics: 'Contam as visitas, sem identificar ninguém.', marketing: null }}
      />,
    );
    expect(html).toContain('Contam as visitas, sem identificar ninguém.');
    expect(html).toContain('Medem campanhas e anúncios.');
  });
});
