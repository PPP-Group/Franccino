'use client';

/**
 * Locale switcher. For the target locale, uses the `href` of the
 * `<link rel="alternate" hreflang=...>` tag `buildMetadata` put in `<head>`
 * for the current page — so it lands on the equivalent page in the other
 * locale, not just its home. Falls back to that locale's home when there is
 * no alternate (e.g. a page that doesn't exist in the target locale).
 */

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { htmlLang, locales, type Locale } from '@/i18n/config';
import { usePathname } from '@/i18n/navigation';

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

export function LanguageSwitcher() {
  const t = useTranslations('language');
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const [links, setLinks] = useState<AlternateLink[]>([]);

  // Read from `document.head` only after mount, so the server-rendered and
  // first client render stay in sync (both start from an empty list) and
  // the "real" alternates arrive right after hydration — then again on every
  // client-side navigation (`pathname` changes), since `buildMetadata`
  // rewrites those `<link>` tags per page but this component doesn't remount.
  useEffect(() => {
    // Syncing from `document.head`, an external system only readable after
    // mount; there is no way to derive it during render (no DOM during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLinks(readAlternateLinks());
  }, [pathname]);

  const otherLocales = locales.filter((locale) => locale !== currentLocale);

  return (
    <nav aria-label={t('label')}>
      <ul>
        {otherLocales.map((locale) => (
          <li key={locale}>
            <a href={resolveAlternateHref(links, locale) ?? `/${locale}`} hrefLang={htmlLang(locale)}>
              {t(locale)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
