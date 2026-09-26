import { getSiteLocales, type SiteLocale } from '@/lib/env';

/** Locales enabled for the site, as pt/en literals ('pt' | 'en'). */
export type Locale = SiteLocale;

/**
 * Enabled locales, read exclusively from `NEXT_PUBLIC_SITE_LOCALES` via
 * `getSiteLocales()` so this stays independent from the rest of the public
 * env (see `getPublicEnv`), which the i18n routing config must not depend on.
 */
export const locales: Locale[] = getSiteLocales();

export const defaultLocale: Locale = 'pt';

const HTML_LANG: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en',
};

const OG_LOCALE: Record<Locale, string> = {
  pt: 'pt_BR',
  en: 'en_US',
};

export function htmlLang(locale: Locale): string {
  return HTML_LANG[locale];
}

export function ogLocale(locale: Locale): string {
  return OG_LOCALE[locale];
}
