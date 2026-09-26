import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import type { Locale } from '@/i18n/config';
import { getProducts } from '@/lib/api/catalog';
import type { RawSearchParams } from '@/lib/api/listing-params';
import { parseListingParams } from '@/lib/api/listing-params';
import { buildMetadata } from '@/lib/seo/metadata';

type ProductsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.products' });

  return buildMetadata({ locale: locale as Locale, href: '/products', title: t('title') });
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.products');
  const listingParams = parseListingParams(await searchParams);
  const products = await getProducts(locale as Locale, listingParams);

  return (
    <main id="main-content">
      <h1>{t('title')}</h1>
      <ProductGrid products={products.data} />
    </main>
  );
}
