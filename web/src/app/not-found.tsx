import { getLocale, getTranslations } from 'next-intl/server';
import { htmlLang, type Locale } from '@/i18n/config';

// Global not-found page, rendered outside of the `[locale]` segment. This is
// reached when a request bypasses the locale-prefixed routes entirely (e.g.
// the proxy's matcher excludes it) and `[locale]/layout.tsx` rejects the
// segment value via `notFound()`. Since no ancestor layout provides
// `<html>`/`<body>` in that case (see `app/layout.tsx`), this page supplies
// them itself.
export default async function GlobalNotFound() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('errors.notFound');

  return (
    <html lang={htmlLang(locale)}>
      <body>
        <main>
          <h1>{t('title')}</h1>
          <p>{t('description')}</p>
        </main>
      </body>
    </html>
  );
}
