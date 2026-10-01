import { describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/intl';
import { ConsentBanner } from './ConsentBanner';

vi.mock('@/i18n/navigation', async () => (await import('@/test/navigation-mock')).navigationMock);

describe('ConsentBanner', () => {
  it('renders nothing on the server, so the first paint never flashes the notice', () => {
    vi.stubEnv('NEXT_PUBLIC_GTM_ID', 'GTM-ABC');
    expect(renderWithIntl(<ConsentBanner />)).toBe('');
    vi.unstubAllEnvs();
  });
});
