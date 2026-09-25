'use client';

/**
 * Locale switcher. For the target locale, the anchor's `href` is the `href`
 * of the `<link rel="alternate" hreflang=...>` tag `buildMetadata` put in
 * `<head>` for the current page — so it lands on the equivalent page in the
 * other locale, not just its home. Falls back to that locale's home when
 * there is no alternate (e.g. a page that doesn't exist in the target
 * locale).
 *
 * The anchor always carries a real, navigable `href` (never `preventDefault`
 * + `location.assign`), so middle-click, ctrl/cmd-click, "copy link
 * address", and crawlers/assistive tech that don't run the click handler all
 * get a correct destination. That `href` is kept in state, refreshed twice:
 * on mount and after every client-side navigation (an effect keyed on the
 * *real* current URL — `next/navigation`'s `usePathname()` + `useSearchParams()`,
 * not next-intl's `usePathname()`, which returns the route *template* like
 * `/products/[slug]` and doesn't change between two pages sharing one, e.g.
 * two different products), and again right before the user is about to
 * interact with a specific link (`onPointerEnter`/`onFocus`/`onPointerDown`/
 * `onContextMenu`), as a last-moment correctness check.
 *
 * `useSearchParams()` opts the component that calls it into client-only
 * rendering up to the nearest Suspense boundary, so the actual links live in
 * `LanguageLinks`, wrapped in a `<Suspense>` here — that keeps the bail-out
 * scoped to this small piece instead of the whole page (which would
 * otherwise lose static generation, since this component is rendered from
 * the shared `[locale]/layout.tsx`). The fallback renders the same markup
 * pointing at each locale's home, matching the pre-hydration/no-JS case.
 */

import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { htmlLang, locales, type Locale } from '@/i18n/config';

type AlternateLink = { hreflang: string; href: string };

/** Pure: picks the alternate link for `target` and returns its path (relative, not the full URL), or `null` if absent. */
export function resolveAlternateHref(links: AlternateLink[], target: Locale): string | null {
  const match = links.find((link) => link.hreflang === htmlLang(target));
  if (!match) {
    return null;
  }

  try {
    const url = new URL(match.href);
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

function readAlternateLinks(): AlternateLink[] {
  if (typeof document === 'undefined') {
    return [];
  }

  return Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map((element) => ({
    hreflang: element.getAttribute('hreflang') ?? '',
    href: element.getAttribute('href') ?? '',
  }));
}

/** The `href` to use for each of `otherLocales`, read from the DOM right now. */
function resolveHrefs(otherLocales: Locale[]): Record<Locale, string> {
  const links = readAlternateLinks();
  const result = {} as Record<Locale, string>;
  for (const locale of otherLocales) {
    result[locale] = resolveAlternateHref(links, locale) ?? `/${locale}`;
  }
  return result;
}

function StaticLanguageLinks({ otherLocales }: { otherLocales: Locale[] }) {
  const t = useTranslations('language');

  return (
    <ul>
      {otherLocales.map((locale) => (
        <li key={locale}>
          <a href={`/${locale}`} hrefLang={htmlLang(locale)}>
            <span lang={htmlLang(locale)}>{t(locale)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function LanguageLinks({ otherLocales }: { otherLocales: Locale[] }) {
  const t = useTranslations('language');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [hrefs, setHrefs] = useState<Record<Locale, string>>(() => resolveHrefs(otherLocales));

  useEffect(() => {
    // Syncing from `document.head`, an external system only readable after
    // mount/navigation; there is no way to derive it during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHrefs(resolveHrefs(otherLocales));
  }, [pathname, searchParams, otherLocales]);

  function refresh() {
    setHrefs(resolveHrefs(otherLocales));
  }

  return (
    <ul>
      {otherLocales.map((locale) => (
        <li key={locale}>
          <a
            href={hrefs[locale]}
            hrefLang={htmlLang(locale)}
            onPointerEnter={refresh}
            onFocus={refresh}
            onPointerDown={refresh}
            onContextMenu={refresh}
          >
            <span lang={htmlLang(locale)}>{t(locale)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function LanguageSwitcher() {
  const t = useTranslations('language');
  const currentLocale = useLocale() as Locale;
  const otherLocales = useMemo(() => locales.filter((locale) => locale !== currentLocale), [currentLocale]);

  return (
    <nav aria-label={t('label')}>
      <Suspense fallback={<StaticLanguageLinks otherLocales={otherLocales} />}>
        <LanguageLinks otherLocales={otherLocales} />
      </Suspense>
    </nav>
  );
}
