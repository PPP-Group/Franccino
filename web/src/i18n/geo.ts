import type { Locale } from '@/i18n/config';

/**
 * País de quem visita, pelo IP, lido do cabeçalho que a CDN ou a hospedagem acrescenta: `cf-ipcountry` (Cloudflare,
 * "IP Geolocation", ligado por padrão), `x-vercel-ip-country` e `x-country-code` (outros proxies). Sem nenhum deles
 * (o preview no VPS, sem Cloudflare na frente), devolve `null` e vale o idioma do navegador.
 */
const COUNTRY_HEADERS = ['cf-ipcountry', 'x-vercel-ip-country', 'x-country-code'];

/** Países de língua portuguesa: abrem em português; os outros, em inglês. */
const PORTUGUESE = new Set(['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL']);

export function countryFromHeaders(headers: Headers): string | null {
  for (const name of COUNTRY_HEADERS) {
    const value = headers.get(name)?.trim().toUpperCase();
    // "XX" e "T1" são o "desconhecido" e a rede Tor da Cloudflare.
    if (value && /^[A-Z]{2}$/.test(value) && value !== 'XX') return value;
  }
  return null;
}

/**
 * Idioma pelo país (retorno de 16/11/2026: "se estiver nos Estados Unidos, já pega direto em inglês; se estiver no
 * Brasil, português"). Sem o inglês ligado no site, nada muda.
 */
export function localeForCountry(country: string | null, enabled: readonly Locale[]): Locale | null {
  if (!country) return null;
  const locale: Locale = PORTUGUESE.has(country) ? 'pt' : 'en';
  return enabled.includes(locale) ? locale : null;
}
