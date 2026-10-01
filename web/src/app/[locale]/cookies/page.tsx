import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Blocks } from '@/components/content/Blocks';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { PageHead } from '@/components/layout/PageHead';
import type { Locale } from '@/i18n/config';
import { getPage } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'legal' }),
    getPage(locale as Locale, 'cookies'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/cookies' },
    title: page?.seo.title ?? page?.title ?? t('cookies'),
    description: page?.seo.description ?? page?.intro,
    image: page?.seo.image ?? page?.cover,
  });
}

export default async function CookiesPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'legal' }),
    getPage(locale, 'cookies'),
  ]);
  return (
    <main className="wrap">
      <PageHead title={page?.title ?? t('cookies')} lead={page?.intro} />
      {page && page.content.length > 0 ? (
        <Blocks blocks={page.content} />
      ) : (
        <EmptyNotice text={t('pending')} />
      )}
    </main>
  );
}
