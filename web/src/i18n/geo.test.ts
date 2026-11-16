import { describe, expect, it } from 'vitest';
import { countryFromHeaders, localeForCountry } from './geo';

describe('idioma pelo país do IP', () => {
  it('lê o país do cabeçalho da Cloudflare ou de outro proxy', () => {
    expect(countryFromHeaders(new Headers({ 'cf-ipcountry': 'us' }))).toBe('US');
    expect(countryFromHeaders(new Headers({ 'x-vercel-ip-country': 'BR' }))).toBe('BR');
    expect(countryFromHeaders(new Headers({ 'cf-ipcountry': 'XX' }))).toBeNull();
    expect(countryFromHeaders(new Headers())).toBeNull();
  });

  it('abre em português nos países de língua portuguesa e em inglês nos outros', () => {
    expect(localeForCountry('BR', ['pt', 'en'])).toBe('pt');
    expect(localeForCountry('PT', ['pt', 'en'])).toBe('pt');
    expect(localeForCountry('US', ['pt', 'en'])).toBe('en');
    expect(localeForCountry('US', ['pt'])).toBeNull();
    expect(localeForCountry(null, ['pt', 'en'])).toBeNull();
  });
});
