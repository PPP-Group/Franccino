import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { QuoteListView } from '@/components/quote/QuoteListView';
import type { Locale } from '@/i18n/config';
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
  const settings = await getSettings(locale);
  return (
    <main>
      <QuoteListView whatsapp={settings.quotes_whatsapp} />
    </main>
  );
}
