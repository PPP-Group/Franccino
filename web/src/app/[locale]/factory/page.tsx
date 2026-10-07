import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Blocks } from '@/components/content/Blocks';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { PageBanner } from '@/components/layout/PageBanner';
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
    <main>
      {/* Abre com a foto da fachada (capa da página no painel), como pedido nos ajustes de 06/10/2026. */}
      <PageBanner image={page?.cover ?? null} title={page?.title ?? t('title')} lead={page?.intro} />
      <div className="wrap">
        {page && page.content.length > 0 ? (
          <Blocks blocks={page.content} />
        ) : (
          <EmptyNotice text={common('nothingYet')} />
        )}
      </div>
    </main>
  );
}
