import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { fontVariables } from '@/app/fonts';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { navMenus } from '@/components/layout/area-menu';
import { BootScript } from '@/components/layout/BootScript';
import { PageTransition } from '@/components/layout/PageTransition';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { JsonLd } from '@/components/seo/JsonLd';
import { ImageLoadWatcher } from '@/components/ui/ImageLoadWatcher';
import { RevealObserver } from '@/components/ui/RevealObserver';
import { ToastRegion } from '@/components/ui/ToastRegion';
import { ConsentBanner } from '@/components/consent/ConsentBanner';
import { htmlLang, locales } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import { getArea } from '@/lib/api/catalog';
import { getCollections, getSettings } from '@/lib/api/content';
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

  const [t, settings, indoor, outdoor, collections] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getSettings(locale),
    getArea(locale, 'indoor'),
    getArea(locale, 'outdoor'),
    getCollections(locale),
  ]);

  return (
    // data-scroll-behavior: o Next tira a rolagem suave durante a troca de página, para a nova página abrir no topo.
    // suppressHydrationWarning: o `BootScript` marca o <html> (rolagem e tela de abertura) antes do React hidratar.
    <html
      lang={htmlLang(locale)}
      className={fontVariables}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <BootScript />
        <NextIntlClientProvider>
          <SplashScreen />
          <a className="skip-link" href="#conteudo">
            {t('skipToContent')}
          </a>
          <JsonLd data={organizationJsonLd(settings)} />
          <SiteHeader menus={navMenus(indoor, outdoor, collections)} />
          <div id="conteudo" tabIndex={-1}>
            <PageTransition>{children}</PageTransition>
          </div>
          <SiteFooter settings={settings} />
          <ToastRegion />
          <ConsentBanner />
          <ImageLoadWatcher />
          <RevealObserver />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
