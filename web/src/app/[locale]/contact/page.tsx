import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/forms/ContactForm';
import type { Locale } from '@/i18n/config';
import { getPage } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.contact' });
  const page = await getPage(locale as Locale, 'contact');

  return buildMetadata({
    locale: locale as Locale,
    href: '/contact',
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro,
    image: page?.seo.image ?? page?.cover,
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.contact');
  const page = await getPage(locale as Locale, 'contact');

  return (
    <main id="main-content">
      <h1>{page?.title ?? t('title')}</h1>
      {page?.intro && <p>{page.intro}</p>}
      <ContactForm typeSelectable />
    </main>
  );
}
