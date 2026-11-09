import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { PageBanner } from '@/components/layout/PageBanner';
import { RecentlyViewed } from '@/components/recent/RecentlyViewed';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import type { Locale } from '@/i18n/config';
import { Link, type AppHref } from '@/i18n/navigation';
import {
  getProductDetails,
  getProductFacets,
  getProducts,
  type ProductFacetsParams,
  type ProductListParams,
} from '@/lib/api/catalog';
import { emptyPage } from '@/lib/api/empty';
import { isValidationError } from '@/lib/api/errors';
import type { Facets, Image, Paginated, ProductCard } from '@/lib/api/types';
import { toTechnicalRow } from '@/lib/catalog/technical';
import { isWideArt } from '@/lib/images/cover';
import { listingQuery, toFilterOption, type CatalogView, type ListingPatch } from '@/lib/catalog/view';
import { CatalogToolbar } from './CatalogToolbar';
import { Pagination } from './Pagination';
import { ProductGrid } from './ProductGrid';
import { TechTable } from './TechTable';

export type CatalogListingProps = {
  locale: Locale;
  title: string;
  intro: ReactNode;
  crumbs: BreadcrumbItem[];
  /** Filtros fixos da rota (ex.: `{ area: 'indoor' }`). */
  apiParams: ProductListParams;
  /** Filtros vindos da URL. */
  params: ProductListParams;
  view: CatalogView;
  hrefFor: (patch: ListingPatch) => AppHref;
  formAction: string;
  /** A categoria já está no caminho (páginas de categoria): não repetir na query do form. */
  categoryInPath?: boolean;
  facetsParams: ProductFacetsParams;
  /**
   * Foto no topo, com o título sobre ela (Casa e Giardini): a foto do bloco da home que abriu a página cresce até ela
   * (ideia 10, `morph`). Arte larga ou sem foto: o cabeçalho de texto de sempre.
   */
  banner?: { image: Image | null; morph: string };
};

const PER_PAGE = 24;

const EMPTY_FACETS: Facets = { categories: [], designers: [], collections: [], lines: [], finish_groups: [] };

export async function CatalogListing(props: CatalogListingProps) {
  const { locale, params, view, hrefFor } = props;
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: 'catalog' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const query: ProductListParams = { ...props.apiParams, ...params, per_page: PER_PAGE };
  if (!query.designer) {
    delete query.designer;
  }

  // Preserva o comportamento de listagem do P3: um 422 (filtro inválido) vira
  // resultado vazio em vez de derrubar a página (ver `downloads`/`search`).
  let page: Paginated<ProductCard>;
  let facets: Facets;
  try {
    [page, facets] = await Promise.all([
      getProducts(locale, query),
      getProductFacets(locale, props.facetsParams),
    ]);
  } catch (error) {
    if (!isValidationError(error)) {
      throw error;
    }
    page = emptyPage<ProductCard>();
    facets = EMPTY_FACETS;
  }

  const rows =
    view === 'table'
      ? (
          await getProductDetails(
            locale,
            page.data.map((product) => product.slug),
          )
        ).map(toTechnicalRow)
      : [];

  const hiddenQuery = listingQuery(props.categoryInPath ? { ...params, category: undefined } : params, view, {
    designer: undefined,
  });

  const banner = props.banner?.image && !isWideArt(props.banner.image) ? props.banner : null;

  return (
    <main>
      {banner?.image ? <PageBanner image={banner.image} title={props.title} morph={banner.morph} /> : null}
      <div className="wrap catalog" data-page-anchor="">
        <Breadcrumbs label={common('breadcrumb')} items={props.crumbs} />
        {banner ? (
          props.intro ? (
            <div className="catalog-head">
              <div className="catalog-head__copy">{props.intro}</div>
            </div>
          ) : null
        ) : (
          <div className="catalog-head">
            <div className="catalog-head__copy">
              <h1>{props.title}</h1>
              {props.intro}
            </div>
          </div>
        )}
        <CatalogToolbar
          count={t('count', { count: page.meta.total })}
          view={view}
          hrefFor={hrefFor}
          designerOptions={facets.designers.map(toFilterOption)}
          activeDesigner={params.designer}
          formAction={props.formAction}
          hiddenQuery={hiddenQuery}
          pager={
            <Pagination
              meta={page.meta}
              hrefFor={(next) => hrefFor({ page: next })}
              label={t('pagination.label')}
              position="top"
            />
          }
        />
        {/* A chave remonta a lista a cada página: as peças novas entram com a revelação, não de uma vez. */}
        <section key={page.meta.current_page} className="catalog-results" aria-label={t('resultsLabel')}>
          {page.data.length === 0 ? (
            <div className="empty">
              <h2>{t('emptyState.title')}</h2>
              <p className="lead">{t('emptyState.body')}</p>
              <Link
                className="btn btn--ghost"
                href={hrefFor({ category: undefined, designer: undefined, q: undefined })}
              >
                {t('emptyState.clear')}
              </Link>
            </div>
          ) : view === 'table' ? (
            <TechTable rows={rows} />
          ) : (
            <ProductGrid products={page.data} showNew priorityCount={3} />
          )}
        </section>
        <Pagination
          meta={page.meta}
          hrefFor={(next) => hrefFor({ page: next })}
          label={t('pagination.label')}
        />
      </div>
      {/* Continuidade: o fim da lista leva às peças que a pessoa já abriu (sem repetir as desta página). */}
      <RecentlyViewed excludeIds={page.data.map((product) => product.id)} />
    </main>
  );
}
