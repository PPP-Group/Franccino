import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CatalogListing } from '@/components/catalog/CatalogListing';
import type { SearchParams } from '@/components/catalog/area-pages';
import type { Locale } from '@/i18n/config';
import { getPathname } from '@/i18n/navigation';
import { parseListingParams } from '@/lib/api/listing-params';
import { productsListingHref } from '@/lib/catalog/area-href';
import { parseCatalogView } from '@/lib/catalog/view';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const view = parseCatalogView((await searchParams).view);
  const t = await getTranslations({ locale, namespace: 'catalog' });
  const key = view === 'table' ? 'technical' : 'products';
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/products' },
    title: t(`${key}.title`),
    description: t(`${key}.intro`),
  });
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const search = await searchParams;
  const listing = parseListingParams(search);
  const view = parseCatalogView(search.view);
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: 'catalog' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
  const key = view === 'table' ? 'technical' : 'products';
  return (
    <CatalogListing
      locale={locale}
      title={t(`${key}.title`)}
      intro={<p className="lead">{t(`${key}.intro`)}</p>}
      crumbs={[{ label: common('home'), href: '/' }, { label: t(`${key}.title`) }]}
      apiParams={{}}
      params={listing}
      view={view}
      hrefFor={productsListingHref(listing, view)}
      formAction={getPathname({ href: '/products', locale })}
      facetsParams={{ q: listing.q }}
    />
  );
}
