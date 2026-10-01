/**
 * Builds `MetadataRoute.Sitemap` entries from the API's `/sitemap` list (see
 * `docs/api.md`). One URL per entry, in the default locale, with
 * `alternates.languages` for the other enabled locales.
 */

import type { MetadataRoute } from 'next';
import type { Locale } from '@/i18n/config';
import { defaultLocale, htmlLang } from '@/i18n/config';
import { getPathname } from '@/i18n/navigation';
import type { SitemapEntry } from '@/lib/api/types';
import { absoluteUrl, type Href } from './metadata';

/** Fixed routes for `type: 'page'` entries, keyed by the page's own `key`. */
const PAGE_ROUTES: Record<string, Href> = {
  home: { pathname: '/' },
  indoor: { pathname: '/indoor' },
  outdoor: { pathname: '/outdoor' },
  products: { pathname: '/products' },
  launches: { pathname: '/launches' },
  collections: { pathname: '/collections' },
  designers: { pathname: '/designers' },
  projects: { pathname: '/projects' },
  corporate: { pathname: '/corporate' },
  factory: { pathname: '/factory' },
  stores: { pathname: '/stores' },
  finishes: { pathname: '/finishes' },
  downloads: { pathname: '/downloads' },
  contact: { pathname: '/contact' },
  privacy: { pathname: '/privacy' },
  terms: { pathname: '/terms' },
};

/** The `Href` for `entry` in a given locale's `slug`, or `null` when the type/slug can't be routed. */
function hrefForEntry(entry: SitemapEntry, slug: string | null): Href | null {
  // Pages are identified by their stable `key`, not by the (possibly
  // per-locale, possibly absent) `slug` — see `SitemapEntry.key` in
  // `lib/api/types.ts`. Checked before the null-slug guard below, so a page
  // with no slug in a given locale (e.g. `home`, which has no slug at all)
  // still gets its fixed route instead of being dropped.
  if (entry.type === 'page') {
    return entry.key !== undefined ? (PAGE_ROUTES[entry.key] ?? null) : null;
  }

  if (slug === null) {
    return null;
  }

  switch (entry.type) {
    case 'product':
      return { pathname: '/products/[slug]', params: { slug } };
    case 'category':
      if (entry.key === 'indoor') {
        return { pathname: '/indoor/[category]', params: { category: slug } };
      }
      if (entry.key === 'outdoor') {
        return { pathname: '/outdoor/[category]', params: { category: slug } };
      }
      // Missing or unrecognized area key: no default area to fall back to.
      return null;
    case 'collection':
      return { pathname: '/collections/[slug]', params: { slug } };
    case 'designer':
      return { pathname: '/designers/[slug]', params: { slug } };
    case 'launch':
      return { pathname: '/launches/[slug]', params: { slug } };
    case 'project':
      return { pathname: '/projects/[slug]', params: { slug } };
    default:
      return null;
  }
}

/** One entry for `href` in the default locale with `alternates.languages` for every enabled locale. */
function entryFor(href: Href, locales: Locale[], lastModified?: string): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[htmlLang(locale)] = absoluteUrl(getPathname({ href, locale }));
  }
  return {
    url: absoluteUrl(getPathname({ href, locale: defaultLocale })),
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages },
  };
}

/** Rotas que só existem no site (não vêm de `/sitemap` da API). A lista de orçamento fica fora (`noindex`). */
const WEB_ONLY_ROUTES: Href[] = [{ pathname: '/room-planner' }];

export function webOnlyEntries(locales: Locale[]): MetadataRoute.Sitemap {
  return WEB_ONLY_ROUTES.map((href) => entryFor(href, locales));
}

export function sitemapEntries(entries: SitemapEntry[], locales: Locale[]): MetadataRoute.Sitemap {
  return entries.flatMap((entry) => {
    const defaultHref = hrefForEntry(entry, entry.slugs[defaultLocale]);
    if (!defaultHref) {
      return [];
    }

    const languages: Record<string, string> = {};
    for (const locale of locales) {
      const href = hrefForEntry(entry, entry.slugs[locale]);
      if (href) {
        languages[htmlLang(locale)] = absoluteUrl(getPathname({ href, locale }));
      }
    }

    return [
      {
        url: absoluteUrl(getPathname({ href: defaultHref, locale: defaultLocale })),
        lastModified: entry.updated_at,
        alternates: { languages },
      },
    ];
  });
}
