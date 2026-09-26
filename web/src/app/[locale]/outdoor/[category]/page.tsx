import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import type { Locale } from '@/i18n/config';
import { getCategories, getCategory, getProducts } from '@/lib/api/catalog';
import type { RawSearchParams } from '@/lib/api/listing-params';
import { parseListingParams } from '@/lib/api/listing-params';
import { alternateHrefs, buildMetadata } from '@/lib/seo/metadata';

type OutdoorCategoryPageProps = {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const categories = await getCategories(params.locale as Locale, { area: 'outdoor' });
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: OutdoorCategoryPageProps): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.outdoorCategory' });
  const category = await getCategory(locale as Locale, categorySlug);

  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/outdoor/[category]', params: { category: categorySlug } },
    title: category?.seo.title ?? category?.name ?? t('title'),
    description: category?.seo.description,
    image: category?.seo.image ?? category?.cover,
    alternates: category
      ? alternateHrefs(category.slugs, (slug) => ({
          pathname: '/outdoor/[category]',
          params: { category: slug },
        }))
      : undefined,
  });
}

export default async function OutdoorCategoryPage({ params, searchParams }: OutdoorCategoryPageProps) {
  const { locale, category: categorySlug } = await params;
  setRequestLocale(locale);

  const category = await getCategory(locale as Locale, categorySlug);
  if (!category) {
    notFound();
  }

  const listingParams = parseListingParams(await searchParams);
  const products = await getProducts(locale as Locale, {
    area: 'outdoor',
    ...listingParams,
    category: categorySlug,
  });

  return (
    <main id="main-content">
      <h1>{category.name}</h1>
      <ProductGrid products={products.data} />
    </main>
  );
}
