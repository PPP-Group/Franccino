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
    getTranslations({ locale, namespace: 'faqPage' }),
    getPage(locale as Locale, 'faq'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/faq' },
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro ?? t('description'),
    image: page?.seo.image ?? page?.cover,
  });
}

/**
 * "Tire suas dúvidas" (revisão da Franccino, 12/11/2026, opcional): perguntas e respostas sobre as peças e a assistência
 * técnica, escritas no painel (Páginas → Tire suas dúvidas, blocos "Perguntas frequentes"). Sem conteúdo, o aviso.
 */
export default async function FaqPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'faqPage' }),
    getPage(locale, 'faq'),
  ]);
  return (
    <main className="wrap page-end">
      <PageHead title={page?.title ?? t('title')} lead={page?.intro ?? t('description')} />
      {page && page.content.length > 0 ? (
        <Blocks blocks={page.content} />
      ) : (
        <EmptyNotice text={t('pending')} />
      )}
    </main>
  );
}
