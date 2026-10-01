import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHead } from '@/components/layout/PageHead';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getAreas, getCategories } from '@/lib/api/catalog';
import { getCollections, getDesigners, getLaunches } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';
import { SITE_MAP_PAGES } from '@/lib/seo/site-map';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'siteMap' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/site-map' },
    title: t('title'),
    description: t('description'),
  });
}

/** Página "Mapa do site" (Anexo I): todas as páginas fixas e o conteúdo publicado, com links. */
export default async function SiteMapPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, nav, footer, areas, indoor, outdoor, collections, designers, launches] = await Promise.all([
    getTranslations({ locale, namespace: 'siteMap' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'footer' }),
    getAreas(locale),
    getCategories(locale, { area: 'indoor' }),
    getCategories(locale, { area: 'outdoor' }),
    getCollections(locale),
    getDesigners(locale),
    getLaunches(locale),
  ]);
  const labelFor = (page: (typeof SITE_MAP_PAGES)[number]) =>
    page.namespace === 'nav' ? nav(page.key) : page.namespace === 'footer' ? footer(page.key) : t(page.key);
  const categoriesByArea = [
    {
      area: areas.find((area) => area.key === 'indoor'),
      categories: indoor,
      pathname: '/indoor/[category]' as const,
    },
    {
      area: areas.find((area) => area.key === 'outdoor'),
      categories: outdoor,
      pathname: '/outdoor/[category]' as const,
    },
  ];

  return (
    <main className="wrap">
      <PageHead title={t('title')} lead={t('description')} />
      <div className="site-map">
        <section aria-labelledby="site-map-pages">
          <h2 id="site-map-pages" className="section-title">
            {t('pages')}
          </h2>
          <ul>
            {SITE_MAP_PAGES.map((page) => (
              <li key={page.key}>
                <Link href={page.href}>{labelFor(page)}</Link>
              </li>
            ))}
          </ul>
        </section>
        {categoriesByArea.map(({ area, categories, pathname }) =>
          area && categories.length > 0 ? (
            <section key={area.key} aria-labelledby={`site-map-${area.key}`}>
              <h2 id={`site-map-${area.key}`} className="section-title">
                {area.brand_name}
              </h2>
              <ul>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link href={{ pathname, params: { category: category.slug } }}>{category.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null,
        )}
        {collections.length > 0 ? (
          <section aria-labelledby="site-map-collections">
            <h2 id="site-map-collections" className="section-title">
              {nav('collections')}
            </h2>
            <ul>
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Link href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}>
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {launches.length > 0 ? (
          <section aria-labelledby="site-map-launches">
            <h2 id="site-map-launches" className="section-title">
              {nav('launches')}
            </h2>
            <ul>
              {launches.map((launch) => (
                <li key={launch.id}>
                  <Link href={{ pathname: '/launches/[slug]', params: { slug: launch.slug } }}>
                    {launch.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {designers.length > 0 ? (
          <section aria-labelledby="site-map-designers">
            <h2 id="site-map-designers" className="section-title">
              {nav('designers')}
            </h2>
            <ul>
              {designers.map((designer) => (
                <li key={designer.id}>
                  <Link href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}>
                    {designer.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}
