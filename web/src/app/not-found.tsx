import { getTranslations } from 'next-intl/server';
import { defaultLocale, htmlLang } from '@/i18n/config';

// Global not-found page, rendered outside of the `[locale]` segment. This is
// reached when a request bypasses the locale-prefixed routes entirely (e.g.
// the proxy's matcher excludes it) and `[locale]/layout.tsx` rejects the
// segment value via `notFound()`. Since no ancestor layout provides
// `<html>`/`<body>` in that case (see `app/layout.tsx`), this page supplies
// them itself.
//
// It uses the default locale explicitly: Next renders this boundary in the
// tree of every route, and `getLocale()` here would read `headers()` (no
// `setRequestLocale` above the root), turning every page dynamic.
export default async function GlobalNotFound() {
  const t = await getTranslations({ locale: defaultLocale, namespace: 'errors.notFound' });

  return (
    <html lang={htmlLang(defaultLocale)}>
      <body>
        <main className="error-page">
          <div className="empty">
            <h1>{t('title')}</h1>
            <p>{t('description')}</p>
          </div>
        </main>
      </body>
    </html>
  );
}
