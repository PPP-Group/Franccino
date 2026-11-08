import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductRail } from '@/components/products/ProductRail';
import { QuoteListView } from '@/components/quote/QuoteListView';
import { RecentlyViewed } from '@/components/recent/RecentlyViewed';
import type { Locale } from '@/i18n/config';
import { getProducts } from '@/lib/api/catalog';
import { getSettings } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'quote' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/quote-list' },
    title: t('title'),
    noindex: true,
  });
}

export default async function QuoteListPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [settings, recommended, t] = await Promise.all([
    getSettings(locale),
    getProducts(locale, { sort: 'featured', per_page: 12 }),
    getTranslations({ locale, namespace: 'quote' }),
  ]);
  return (
    <main>
      <QuoteListView whatsapp={settings.quotes_whatsapp} />
      {/*
        Logo abaixo da lista, numa faixa de outro fundo (retorno de 07/11/2026): as peças vistas por último (somem
        com menos de duas) e as recomendadas, as em destaque do catálogo.
      */}
      <div className="quote-more">
        <RecentlyViewed />
        {recommended.data.length > 0 ? (
          <section className="section" aria-labelledby="quote-recommended-title">
            <div className="wrap" data-reveal>
              <div className="section-head">
                <h2 id="quote-recommended-title">{t('recommendedTitle')}</h2>
              </div>
              <ProductRail label={t('recommendedTitle')} products={recommended.data} />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
