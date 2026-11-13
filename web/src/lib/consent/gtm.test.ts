import { describe, expect, it } from 'vitest';
import { denyConsentByDefault, gtmScriptSrc, loadGtm } from './gtm';

function fakeDocument() {
  const scripts: { src: string; async: boolean }[] = [];
  return {
    scripts,
    doc: {
      querySelector: (selector: string) => scripts.find((script) => selector.includes(script.src)) ?? null,
      createElement: () => ({ src: '', async: false }),
      head: { appendChild: (script: { src: string; async: boolean }) => scripts.push(script) },
    } as unknown as Document,
  };
}

describe('gtm', () => {
  it('builds the Tag Manager script URL', () => {
    expect(gtmScriptSrc('GTM-ABC')).toBe('https://www.googletagmanager.com/gtm.js?id=GTM-ABC');
  });

  it('injects the script only once and starts the dataLayer', () => {
    const { scripts, doc } = fakeDocument();
    const win = {} as Window & { dataLayer?: unknown[] };
    loadGtm('GTM-ABC', doc, win);
    loadGtm('GTM-ABC', doc, win);
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toMatchObject({ async: true, src: gtmScriptSrc('GTM-ABC') });
    expect(win.dataLayer).toHaveLength(1);
  });

  it('pushes the consent default as gtag arguments, before Tag Manager (AdOpt)', () => {
    const win = {} as Window & { dataLayer?: unknown[] };
    denyConsentByDefault(win);
    const entry = win.dataLayer?.[0] as ArrayLike<unknown>;
    expect(Array.isArray(entry)).toBe(false);
    expect(Array.from(entry).slice(0, 2)).toEqual(['consent', 'default']);
    expect(Array.from(entry)[2]).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied' });
  });
});
