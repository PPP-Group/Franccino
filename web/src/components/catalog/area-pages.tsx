import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { getPathname } from '@/i18n/navigation';
import { getArea, getCategories, getCategory } from '@/lib/api/catalog';
import { parseListingParams } from '@/lib/api/listing-params';
import type { AreaRef } from '@/lib/api/types';
import { areaListingHref } from '@/lib/catalog/area-href';
import { parseCatalogView } from '@/lib/catalog/view';
import { alternateHrefs, buildMetadata } from '@/lib/seo/metadata';
import { CatalogListing } from './CatalogListing';

type AreaKey = AreaRef['key'];
export type SearchParams = Record<string, string | string[] | undefined>;

function areaHref(area: AreaKey) {
  return area === 'outdoor' ? ({ pathname: '/outdoor' } as const) : ({ pathname: '/indoor' } as const);
}

function categoryHref(area: AreaKey, category: string) {
  return area === 'outdoor'
    ? ({ pathname: '/outdoor/[category]', params: { category } } as const)
    : ({ pathname: '/indoor/[category]', params: { category } } as const);
}

export async function areaMetadata(area: AreaKey, locale: Locale): Promise<Metadata> {
  const [detail, t] = await Promise.all([
    getArea(locale, area),
    getTranslations({ locale, namespace: 'pages' }),
  ]);
  const href = areaHref(area);
  return buildMetadata({
    locale,
    href,
    title: detail?.seo.title ?? detail?.brand_name ?? t(`${area}.title`),
    description: detail?.seo.description ?? null,
    image: detail?.seo.image ?? detail?.cover ?? null,
  });
}

export async function AreaPage({
  area,
  locale,
  searchParams,
}: {
  area: AreaKey;
  locale: Locale;
  searchParams: SearchParams;
}) {
  const detail = await getArea(locale, area);
  if (!detail) {
    notFound();
  }
  const common = await getTranslations({ locale, namespace: 'common' });
  const params = parseListingParams(searchParams);
  const view = parseCatalogView(searchParams.view);
  return (
    <CatalogListing
      locale={locale}
      title={detail.brand_name}
      intro={detail.description ? <p className="lead">{detail.description}</p> : null}
      crumbs={[{ label: common('home'), href: '/' }, { label: detail.brand_name }]}
      apiParams={{ area }}
      params={params}
      view={view}
      hrefFor={areaListingHref(area, params, view)}
      formAction={getPathname({ href: areaHref(area), locale })}
      facetsParams={{ area, category: params.category }}
    />
  );
}

export async function areaCategoryMetadata(area: AreaKey, locale: Locale, slug: string): Promise<Metadata> {
  const category = await getCategory(locale, slug);
  if (!category) {
    return {};
  }
  return buildMetadata({
    locale,
    href: categoryHref(area, slug),
    title: category.seo.title ?? category.name,
    description: category.seo.description,
    image: category.seo.image ?? category.cover,
    alternates: alternateHrefs(category.slugs, (categorySlug) => categoryHref(area, categorySlug)),
  });
}

export async function AreaCategoryPage(props: {
  area: AreaKey;
  locale: Locale;
  slug: string;
  searchParams: SearchParams;
}) {
  const { area, locale, slug, searchParams } = props;
  const [detail, category] = await Promise.all([getArea(locale, area), getCategory(locale, slug)]);
  if (!detail || !category) {
    notFound();
  }
  const common = await getTranslations({ locale, namespace: 'common' });
  const params = { ...parseListingParams(searchParams), category: slug };
  const view = parseCatalogView(searchParams.view);
  return (
    <CatalogListing
      locale={locale}
      title={category.name}
      intro={category.description ? <p className="lead">{category.description}</p> : null}
      crumbs={[
        { label: common('home'), href: '/' },
        { label: detail.brand_name, href: areaHref(area) },
        { label: category.name },
      ]}
      apiParams={{ area }}
      params={params}
      view={view}
      hrefFor={areaListingHref(area, params, view)}
      formAction={getPathname({ href: categoryHref(area, slug), locale })}
      categoryInPath
      facetsParams={{ area, category: slug }}
    />
  );
}

export async function areaCategoryStaticParams(
  area: AreaKey,
  locale: Locale,
): Promise<{ category: string }[]> {
  const categories = await getCategories(locale, { area });
  return categories.map((category) => ({ category: category.slug }));
}
