import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AreaPage, areaMetadata, type SearchParams } from '@/components/catalog/area-pages';
import type { Locale } from '@/i18n/config';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return areaMetadata('outdoor', locale as Locale);
}

export default async function OutdoorPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AreaPage area="outdoor" locale={locale as Locale} searchParams={await searchParams} />;
}
