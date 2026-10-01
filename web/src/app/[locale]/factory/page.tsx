import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Blocks } from '@/components/content/Blocks';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';

import { getPage } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'factory' }),
    getPage(locale as Locale, 'factory'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/factory' },
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro,
    image: page?.seo.image ?? page?.cover,
  });
}

export default async function FactoryPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, page] = await Promise.all([
    getTranslations({ locale, namespace: 'factory' }),
    getTranslations({ locale, namespace: 'common' }),
    getPage(locale, 'factory'),
  ]);
  return (
    <main className="wrap">
      <PageHead title={page?.title ?? t('title')} lead={page?.intro} />
      {page?.cover ? <ApiImage image={page.cover} sizes="100vw" priority className="page-cover" /> : null}
      {page && page.content.length > 0 ? (
        <Blocks blocks={page.content} />
      ) : (
        <EmptyNotice text={common('nothingYet')} />
      )}
    </main>
  );
}
