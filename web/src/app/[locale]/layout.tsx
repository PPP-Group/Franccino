import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { htmlLang, locales, type Locale } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import { getSettings } from '@/lib/api/content';
import { serverEnv } from '@/lib/env';
import { organizationJsonLd } from '@/lib/seo/jsonld';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(serverEnv().SITE_URL),
  title: {
    template: '%s | Franccino',
    default: 'Franccino',
  },
};

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

  const settings = await getSettings(locale as Locale);

  return (
    <html lang={htmlLang(locale as Locale)}>
      <body>
        <JsonLd data={organizationJsonLd(settings)} />
        <NextIntlClientProvider>
          <SiteHeader />
          {children}
          <SiteFooter settings={settings} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
