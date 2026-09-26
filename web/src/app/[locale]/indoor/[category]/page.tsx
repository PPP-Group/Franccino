import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import {
  AreaCategoryPage,
  areaCategoryMetadata,
  areaCategoryStaticParams,
  type SearchParams,
} from '@/components/catalog/area-pages';
import type { Locale } from '@/i18n/config';

type Props = { params: Promise<{ locale: string; category: string }>; searchParams: Promise<SearchParams> };

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return areaCategoryStaticParams('indoor', params.locale as Locale);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  return areaCategoryMetadata('indoor', locale as Locale, category);
}

export default async function IndoorCategoryPage({ params, searchParams }: Props) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  return (
    <AreaCategoryPage
      area="indoor"
      locale={locale as Locale}
      slug={category}
      searchParams={await searchParams}
    />
  );
}
