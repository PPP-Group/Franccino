import { afterEach, describe, expect, it, vi } from 'vitest';
import { summarizeReport } from '@/lib/security/csp-report';
import { POST } from './route';

describe('csp report', () => {
  afterEach(() => vi.restoreAllMocks());

  it('logs the directive, the blocked address and the page of a violation', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const body = {
      'csp-report': {
        'document-uri': 'https://preview.franccino.test/pt/produtos/aura',
        'violated-directive': 'connect-src',
        'blocked-uri': 'https://evil.example',
      },
    };

    const response = await POST(
      new Request('http://site.test/api/csp-report', { method: 'POST', body: JSON.stringify(body) }),
    );

    expect(response.status).toBe(204);
    expect(warn).toHaveBeenCalledWith(
      '[csp] connect-src | https://evil.example | https://preview.franccino.test/pt/produtos/aura',
    );
  });

  it('ignores bodies that are not reports', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      (await POST(new Request('http://site.test/api/csp-report', { method: 'POST', body: 'x'.repeat(9000) })))
        .status,
    ).toBe(204);
    expect(summarizeReport(null)).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });
});
