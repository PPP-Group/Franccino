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

type IndoorPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: IndoorPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.indoor' });
  const area = await getArea(locale as Locale, 'indoor');

  return buildMetadata({
    locale: locale as Locale,
    href: '/indoor',
    title: area?.seo.title ?? area?.name ?? t('title'),
    description: area?.seo.description,
    image: area?.seo.image ?? area?.cover,
  });
}

export default async function IndoorPage({ params, searchParams }: IndoorPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.indoor');
  const area = await getArea(locale as Locale, 'indoor');
  if (!area) {
    notFound();
  }

  const listingParams = parseListingParams(await searchParams);
  const products = await getProducts(locale as Locale, { area: 'indoor', ...listingParams });

  return (
    <main id="main-content">
      <h1>{area.name || t('title')}</h1>
      <AreaListing area={area} categories={area.categories} />
      <ProductGrid
        products={products.data}
        pagination={{ meta: products.meta, href: '/indoor', params: listingParams }}
      />
    </main>
  );
}
