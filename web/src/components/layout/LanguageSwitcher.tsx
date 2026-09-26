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
 * get a correct destination. That `href` is kept in state, initialized with
 * each locale's home (matching the pre-hydration/no-JS markup and avoiding a
 * synchronous DOM read during render) and resolved for real in an effect,
 * refreshed twice: on mount and after every client-side navigation (an
 * effect keyed on the *real* current URL — `next/navigation`'s
 * `usePathname()` + `useSearchParams()`, not next-intl's `usePathname()`,
 * which returns the route *template* like `/products/[slug]` and doesn't
 * change between two pages sharing one, e.g. two different products), and
 * again right before the user is about to interact with a specific link
 * (`onPointerEnter`/`onFocus`/`onPointerDown`/`onContextMenu`), as a
 * last-moment correctness check.
 *
 * `useSearchParams()` opts the component that calls it into client-only
 * rendering up to the nearest Suspense boundary, so the actual links live in
 * `LanguageLinks`, wrapped in a `<Suspense>` here — that keeps the bail-out
 * scoped to this small piece instead of the whole page (which would
 * otherwise lose static generation, since this component is rendered from
 * the shared `[locale]/layout.tsx`). The fallback renders the same markup
 * pointing at each locale's home, matching the pre-hydration/no-JS case.
 *
 * Visible text is the short code (`language.short.pt`/`.en`, e.g. "PT"), and
 * the full language name is a `visually-hidden` sibling span, never
 * `aria-label` — an `aria-label` would replace the accessible name outright
 * and drop the visible text from it (WCAG 2.5.3, "label in name"); a hidden
 * sibling keeps both.
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

/** Each of `otherLocales` pointing at its own home — the initial/pre-hydration state. */
function homeHrefs(otherLocales: Locale[]): Record<Locale, string> {
  const result = {} as Record<Locale, string>;
  for (const locale of otherLocales) {
    result[locale] = `/${locale}`;
  }
  return result;
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

function CurrentLocale({ locale }: { locale: Locale }) {
  const t = useTranslations('language');
  return (
    <strong aria-current="true" lang={htmlLang(locale)}>
      {t(`short.${locale}`)}
      <span className="visually-hidden">{t(locale)}</span>
    </strong>
  );
}

function StaticLanguageLinks({ current, otherLocales }: { current: Locale; otherLocales: Locale[] }) {
  const t = useTranslations('language');

  return (
    <>
      <CurrentLocale locale={current} />
      {otherLocales.map((locale) => (
        <a key={locale} href={`/${locale}`} hrefLang={htmlLang(locale)} lang={htmlLang(locale)}>
          {t(`short.${locale}`)}
          <span className="visually-hidden">{t(locale)}</span>
        </a>
      ))}
    </>
  );
}

function LanguageLinks({ current, otherLocales }: { current: Locale; otherLocales: Locale[] }) {
  const t = useTranslations('language');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [hrefs, setHrefs] = useState<Record<Locale, string>>(() => homeHrefs(otherLocales));

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
    <>
      <CurrentLocale locale={current} />
      {otherLocales.map((locale) => (
        <a
          key={locale}
          href={hrefs[locale]}
          hrefLang={htmlLang(locale)}
          lang={htmlLang(locale)}
          onPointerEnter={refresh}
          onFocus={refresh}
          onPointerDown={refresh}
          onContextMenu={refresh}
        >
          {t(`short.${locale}`)}
          <span className="visually-hidden">{t(locale)}</span>
        </a>
      ))}
    </>
  );
}

export function LanguageSwitcher() {
  const t = useTranslations('language');
  const currentLocale = useLocale() as Locale;
  const otherLocales = useMemo(() => locales.filter((locale) => locale !== currentLocale), [currentLocale]);

  if (locales.length < 2) {
    return null;
  }

  return (
    <nav className="lang" aria-label={t('label')}>
      <Suspense fallback={<StaticLanguageLinks current={currentLocale} otherLocales={otherLocales} />}>
        <LanguageLinks current={currentLocale} otherLocales={otherLocales} />
      </Suspense>
    </nav>
  );
}
