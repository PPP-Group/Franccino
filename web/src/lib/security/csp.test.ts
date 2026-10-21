import { describe, expect, it } from 'vitest';
import { buildCsp, originOf } from './csp';

function directive(csp: string, name: string): string[] {
  const found = csp.split('; ').find((part) => part.startsWith(`${name} `));
  return found ? found.split(' ').slice(1) : [];
}

const base = {
  apiUrl: 'https://api.franccino.com.br',
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
};

describe('originOf', () => {
  it('reads the origin of URLs and tile templates', () => {
    expect(originOf('https://tile.openstreetmap.org/{z}/{x}/{y}.png')).toBe('https://tile.openstreetmap.org');
    expect(originOf('http://localhost:8000/storage')).toBe('http://localhost:8000');
    expect(originOf('')).toBeNull();
    expect(originOf('not a url')).toBeNull();
  });
});

describe('buildCsp', () => {
  it('locks the page down to its own origin, the API and the map tiles', () => {
    const csp = buildCsp(base);

    expect(directive(csp, 'default-src')).toEqual(["'self'"]);
    expect(directive(csp, 'img-src')).toEqual(
      expect.arrayContaining(['https://api.franccino.com.br', 'https://tile.openstreetmap.org']),
    );
    expect(directive(csp, 'connect-src')).toContain('https://api.franccino.com.br');
    expect(directive(csp, 'frame-ancestors')).toEqual(["'none'"]);
    expect(directive(csp, 'object-src')).toEqual(["'none'"]);
    expect(directive(csp, 'worker-src')).toEqual(["'self'", 'blob:']);
    expect(directive(csp, 'script-src')).not.toContain("'unsafe-eval'");
    expect(directive(csp, 'script-src')).not.toContain('https://www.googletagmanager.com');
    expect(directive(csp, 'frame-src')).not.toContain('https://challenges.cloudflare.com');
  });

  it('adds the public media origin when it differs from the API', () => {
    const csp = buildCsp({ ...base, mediaUrl: 'https://media.franccino.com.br/' });

    expect(directive(csp, 'img-src')).toContain('https://media.franccino.com.br');
    expect(directive(csp, 'connect-src')).toContain('https://media.franccino.com.br');
  });

  it('lets the 3d viewer fetch the temporary link of the private downloads bucket', () => {
    const csp = buildCsp({
      ...base,
      downloadsUrl: 'https://conta.r2.cloudflarestorage.com/franccino-downloads',
    });

    expect(directive(csp, 'connect-src')).toContain('https://conta.r2.cloudflarestorage.com');
    expect(directive(csp, 'img-src')).not.toContain('r2.cloudflarestorage.com');
  });

  it('opens Tag Manager and Analytics only when GTM is on', () => {
    const csp = buildCsp({ ...base, gtm: true });

    expect(directive(csp, 'script-src')).toContain('https://www.googletagmanager.com');
    expect(directive(csp, 'connect-src')).toContain('https://*.google-analytics.com');
  });

  it('opens Turnstile script and frame only when Turnstile is on', () => {
    const csp = buildCsp({ ...base, turnstile: true });

    expect(directive(csp, 'script-src')).toContain('https://challenges.cloudflare.com');
    expect(directive(csp, 'frame-src')).toContain('https://challenges.cloudflare.com');
  });

  it('allows eval and the hot-reload socket only in development', () => {
    const csp = buildCsp({ ...base, dev: true });

    expect(directive(csp, 'script-src')).toContain("'unsafe-eval'");
    expect(directive(csp, 'connect-src')).toContain('ws:');
  });

  it('sends violations to the site log', () => {
    expect(directive(buildCsp(base), 'report-uri')).toEqual(['/api/csp-report']);
  });

  it('leaves frame-ancestors out of the report-only policy', () => {
    expect(directive(buildCsp({ ...base, reportOnly: true }), 'frame-ancestors')).toEqual([]);
  });
});
