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
    case 'page':
      // Pages are identified by their stable `key`, not by the (possibly
      // per-locale) `slug` — see `SitemapEntry.key` in `lib/api/types.ts`.
      return entry.key !== undefined ? (PAGE_ROUTES[entry.key] ?? null) : null;
    default:
      return null;
  }
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
