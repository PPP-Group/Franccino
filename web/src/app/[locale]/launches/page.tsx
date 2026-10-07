import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { SearchParams } from '@/components/catalog/area-pages';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { TechTable } from '@/components/catalog/TechTable';
import { ViewToggle } from '@/components/catalog/ViewToggle';
import { FileDownloads } from '@/components/downloads/FileDownloads';
import { PageBanner } from '@/components/layout/PageBanner';
import { MediaLinks } from '@/components/media/MediaLinks';
import type { Locale } from '@/i18n/config';
import { getProductDetails } from '@/lib/api/catalog';
import { getLaunch, getLaunches, getPage } from '@/lib/api/content';
import type { LaunchDetail, ProductCard } from '@/lib/api/types';
import { toTechnicalRow } from '@/lib/catalog/technical';
import { parseCatalogView } from '@/lib/catalog/view';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'catalog.launches' }),
    getPage(locale as Locale, 'launches'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/launches' },
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro ?? t('intro'),
    image: page?.seo.image ?? page?.cover,
  });
}

/** Peças de todos os lançamentos numa lista só, sem repetir a peça que está em mais de um. */
function launchProducts(launches: LaunchDetail[]): ProductCard[] {
  const seen = new Set<number>();
  return launches
    .flatMap((launch) => launch.products)
    .filter((product) => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
}

/**
 * Lançamentos (ajustes do cliente, 06/10/2026): banner com foto no topo e todas as peças lançadas juntas,
 * sem dividir por lançamento ou ano. A foto do banner é a capa da página "Lançamentos" no painel; sem
 * ela, vale a capa ou a primeira foto da galeria de um lançamento.
 */
export default async function LaunchesPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const view = parseCatalogView((await searchParams).view);
  const [t, catalog, page, cards] = await Promise.all([
    getTranslations({ locale, namespace: 'catalog.launches' }),
    getTranslations({ locale, namespace: 'catalog' }),
    getPage(locale, 'launches'),
    getLaunches(locale),
  ]);
  const launches = (await Promise.all(cards.map((card) => getLaunch(locale, card.slug)))).filter(
    (launch): launch is LaunchDetail => launch !== null,
  );
  const products = launchProducts(launches);
  const banner =
    page?.cover ??
    launches.find((launch) => launch.cover)?.cover ??
    launches.flatMap((launch) => launch.gallery)[0] ??
    null;
  const rows =
    view === 'table'
      ? (
          await getProductDetails(
            locale,
            products.map((product) => product.slug),
          )
        ).map(toTechnicalRow)
      : [];

  return (
    <main>
      <PageBanner image={banner} title={page?.title ?? t('title')} lead={page?.intro ?? t('intro')} />
      <div className="wrap catalog">
        {products.length > 0 ? (
          <>
            <div className="toolbar">
              <p className="meta num">{catalog('count', { count: products.length })}</p>
              <ViewToggle
                view={view}
                hrefFor={(next) => ({
                  pathname: '/launches',
                  query: next === 'table' ? { view: 'table' } : {},
                })}
              />
            </div>
            <section className="catalog-results" aria-label={catalog('resultsLabel')}>
              {view === 'table' ? (
                <TechTable rows={rows} />
              ) : (
                <ProductGrid products={products} showNew priorityCount={3} />
              )}
            </section>
          </>
        ) : (
          <div className="empty">
            <p className="lead">{t('empty')}</p>
          </div>
        )}
        <FileDownloads
          files={launches.flatMap((launch) => launch.files)}
          title={t('downloads')}
          headingId="launch-downloads"
          className="media-links--wide block"
        />
        <MediaLinks
          items={launches.flatMap((launch) => launch.media_links)}
          headingId="launch-media"
          className="media-links--wide block"
        />
      </div>
    </main>
  );
}
