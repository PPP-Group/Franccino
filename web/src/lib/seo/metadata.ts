/**
 * `Metadata` builder shared by every route's `generateMetadata`. Centralizes
 * the canonical URL, hreflang alternates, Open Graph, Twitter card and the
 * non-production `noindex` rule, so no route assembles `Metadata` by hand
 * (see `web/CLAUDE.md`).
 */

import type { Metadata } from 'next';
import { htmlLang, locales, ogLocale, type Locale } from '@/i18n/config';
import { getPathname } from '@/i18n/navigation';
import type { Image } from '@/lib/api/types';
import { serverEnv } from '@/lib/env';

/** The `href` shape accepted by `getPathname` (`{ pathname, params? }` or a plain string). */
export type Href = Parameters<typeof getPathname>[0]['href'];

const SITE_NAME = 'Franccino';

/** The locale whose page stands in for `x-default` in hreflang alternates. */
const X_DEFAULT_LOCALE: Locale = 'pt';

/** Resolves `path` (as returned by `getPathname`) against `SITE_URL`. */
export function absoluteUrl(path: string): string {
  const { SITE_URL } = serverEnv();
  return new URL(path, SITE_URL).toString();
}

export type BuildMetadataInput = {
  locale: Locale;
  href: Href;
  title: string;
  description?: string | null;
  image?: Image | null;
  /**
   * Per-locale override of `href`, for routes whose slug differs by locale
   * (e.g. product pages). A locale absent from this map falls back to
   * `href` itself (used as-is, localized via `getPathname`); an explicit
   * `null` means the page doesn't exist in that locale and it is omitted
   * from `alternates.languages`.
   */
  alternates?: Partial<Record<Locale, Href | null>>;
  noindex?: boolean;
};

/** The `Href` to use for `locale`, honoring an explicit `alternates` override. */
function resolveHref(locale: Locale, input: BuildMetadataInput): Href | null {
  if (input.alternates && locale in input.alternates) {
    return input.alternates[locale] ?? null;
  }
  return input.href;
}

function localizedUrl(href: Href, locale: Locale): string {
  return absoluteUrl(getPathname({ href, locale }));
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const canonicalHref = resolveHref(input.locale, input) ?? input.href;
  const canonical = localizedUrl(canonicalHref, input.locale);

  const languages: Record<string, string> = {};
  for (const locale of locales) {
    const href = resolveHref(locale, input);
    if (href) {
      languages[htmlLang(locale)] = localizedUrl(href, locale);
    }
  }

  const defaultHref = resolveHref(X_DEFAULT_LOCALE, input);
  if (defaultHref) {
    languages['x-default'] = localizedUrl(defaultHref, X_DEFAULT_LOCALE);
  }

  const { SITE_ENV } = serverEnv();
  const noindex = input.noindex === true || SITE_ENV !== 'production';

  return {
    title: input.title,
    description: input.description ?? undefined,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: ogLocale(input.locale),
      url: canonical,
      title: input.title,
      description: input.description ?? undefined,
      images: input.image
        ? [
            {
              url: input.image.src,
              width: input.image.width ?? undefined,
              height: input.image.height ?? undefined,
              alt: input.image.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description ?? undefined,
      images: input.image ? [input.image.src] : undefined,
    },
    ...(noindex ? { robots: { index: false } } : {}),
  };
}
