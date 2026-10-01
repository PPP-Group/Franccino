import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { PageHead } from '@/components/layout/PageHead';
import { StoreFinder } from '@/components/stores/StoreFinder';
import type { Locale } from '@/i18n/config';
import { getPage, getStores } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'storesPage' }),
    getPage(locale as Locale, 'stores'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/stores' },
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro,
    image: page?.seo.image ?? page?.cover,
  });
}

export default async function StoresPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, page, list] = await Promise.all([
    getTranslations({ locale, namespace: 'storesPage' }),
    getTranslations({ locale, namespace: 'common' }),
    getPage(locale, 'stores'),
    getStores(locale),
  ]);
  return (
    <main className="wrap">
      <PageHead
        title={page?.title ?? t('title')}
        lead={page?.intro}
        meta={<p className="meta num">{t('count', { count: list.stores.length })}</p>}
      />
      {list.stores.length === 0 ? (
        <EmptyNotice text={common('nothingYet')} />
      ) : (
        <section className="section section--tight" aria-label={t('title')}>
          <StoreFinder stores={list.stores} states={list.states} allStates typeFilter detailed />
        </section>
      )}
    </main>
  );
}
