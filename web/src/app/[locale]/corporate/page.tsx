import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Blocks } from '@/components/content/Blocks';
import type { Locale } from '@/i18n/config';
import { getPage } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type CorporatePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: CorporatePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.corporate' });
  const page = await getPage(locale as Locale, 'corporate');

  return buildMetadata({
    locale: locale as Locale,
    href: '/corporate',
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro,
    image: page?.seo.image ?? page?.cover,
  });
}

export default async function CorporatePage({ params }: CorporatePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getPage(locale as Locale, 'corporate');
  if (!page) {
    notFound();
  }

  return (
    <main id="main-content">
      <h1>{page.title}</h1>
      {page.intro && <p>{page.intro}</p>}
      <Blocks blocks={page.content} />
    </main>
  );
}
