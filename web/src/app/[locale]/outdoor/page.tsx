import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AreaListing } from '@/components/catalog/AreaListing';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import type { Locale } from '@/i18n/config';
import { getArea, getProducts } from '@/lib/api/catalog';
import type { RawSearchParams } from '@/lib/api/listing-params';
import { parseListingParams } from '@/lib/api/listing-params';
import { buildMetadata } from '@/lib/seo/metadata';

type OutdoorPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: OutdoorPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.outdoor' });
  const area = await getArea(locale as Locale, 'outdoor');

  return buildMetadata({
    locale: locale as Locale,
    href: '/outdoor',
    title: area?.seo.title ?? area?.name ?? t('title'),
    description: area?.seo.description,
    image: area?.seo.image ?? area?.cover,
  });
}

export default async function OutdoorPage({ params, searchParams }: OutdoorPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.outdoor');
  const area = await getArea(locale as Locale, 'outdoor');
  if (!area) {
    notFound();
  }

  const listingParams = parseListingParams(await searchParams);
  const products = await getProducts(locale as Locale, { area: 'outdoor', ...listingParams });

  return (
    <main id="main-content">
      <h1>{area.name || t('title')}</h1>
      <AreaListing area={area} categories={area.categories} />
      <ProductGrid products={products.data} />
    </main>
  );
}
