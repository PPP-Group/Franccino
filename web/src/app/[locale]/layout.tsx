import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { archivo } from '@/app/fonts';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { ToastRegion } from '@/components/ui/ToastRegion';
import { ConsentBanner } from '@/components/consent/ConsentBanner';
import { htmlLang, locales } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import { getSettings } from '@/lib/api/content';
import { serverEnv } from '@/lib/env';
import { organizationJsonLd } from '@/lib/seo/jsonld';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(serverEnv().SITE_URL),
    title: { template: '%s | Franccino', default: 'Franccino' },
  };
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getSettings(locale),
  ]);

  return (
    <html lang={htmlLang(locale)} className={archivo.variable}>
      <body>
        <NextIntlClientProvider>
          <a className="skip-link" href="#conteudo">
            {t('skipToContent')}
          </a>
          <JsonLd data={organizationJsonLd(settings)} />
          <SiteHeader />
          <div id="conteudo" tabIndex={-1}>
            {children}
          </div>
          <SiteFooter settings={settings} />
          <ToastRegion />
          <ConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
