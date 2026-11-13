import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { PageBanner } from '@/components/layout/PageBanner';
import { RecentlyViewed } from '@/components/recent/RecentlyViewed';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import type { Locale } from '@/i18n/config';
import { Link, type AppHref } from '@/i18n/navigation';
import {
  getArea,
  getCategories,
  getProductDetails,
  getProductFacets,
  getProducts,
  type ProductFacetsParams,
  type ProductListParams,
} from '@/lib/api/catalog';
import { getCollections, getDesigners, getImagePointsFor } from '@/lib/api/content';
import { emptyPage } from '@/lib/api/empty';
import { isValidationError } from '@/lib/api/errors';
import type { Facets, Image, Paginated, ProductCard } from '@/lib/api/types';
import { toTechnicalRow } from '@/lib/catalog/technical';
import { buildFacetMatrix } from '@/lib/catalog/facets';
import { isWideArt } from '@/lib/images/cover';
import { listingQuery, toFilterOption, type CatalogView, type ListingPatch } from '@/lib/catalog/view';
import { CatalogToolbar, type ToolbarFilter } from './CatalogToolbar';
import { LoadMore } from './LoadMore';
import { Pagination } from './Pagination';
import { ProductGrid } from './ProductGrid';
import { TechTable } from './TechTable';
import { ByView, CatalogViewProvider } from './ViewToggle';

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
  const area = props.apiParams.area;
  const [t, common, designerCards, categoryCards, collectionCards] = await Promise.all([
    getTranslations({ locale, namespace: 'catalog' }),
    getTranslations({ locale, namespace: 'common' }),
    // Fotos para as listas dos filtros (os filtros só trazem nome e contagem): retrato do designer, capa da
    // categoria e da coleção (retorno de 12/11/2026: os outros filtros no mesmo desenho do de designer).
    getDesigners(locale).catch(() => []),
    // Na área, as categorias dela (com a contagem e uma foto de cada); no catálogo todo, as de todas as áreas.
    props.categoryInPath
      ? Promise.resolve([])
      : area
        ? getArea(locale, area)
            .then((detail) => detail?.categories ?? [])
            .catch(() => [])
        : getCategories(locale).catch(() => []),
    getCollections(locale).catch(() => []),
  ]);
  const portraits = new Map(designerCards.map((designer) => [designer.slug, designer.portrait]));
  const collectionCovers = new Map(collectionCards.map((collection) => [collection.slug, collection.cover]));

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

  // As duas vistas vêm prontas: a troca Grade/Tabela técnica é no navegador (`ViewToggle`).
  const rows = (
    await getProductDetails(
      locale,
      page.data.map((product) => product.slug),
    )
  ).map(toTechnicalRow);

  const hiddenQuery = listingQuery(props.categoryInPath ? { ...params, category: undefined } : params, view, {
    designer: undefined,
    room: undefined,
    collection: undefined,
    ...(props.categoryInPath ? {} : { category: undefined }),
  });
  // Ambientes (item 8): o nome vem das mensagens; uma chave sem tradução não aparece.
  const roomOptions = (facets.rooms ?? [])
    .filter((option) => t.has(`rooms.${option.key}`))
    .map((option) => ({ value: option.key, label: t(`rooms.${option.key}`), count: option.count }));
  // Categorias da área (todas, mesmo com uma escolhida), em ordem alfabética, com a capa de cada uma.
  const categoryOptions = categoryCards
    .filter((category) => category.product_count > 0)
    .map((category) => ({
      value: category.slug,
      label: category.name,
      count: category.product_count,
      image: category.cover,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
  const filters: ToolbarFilter[] = [
    {
      name: 'category',
      label: t('filters.category'),
      allLabel: t('filters.allCategories'),
      options: categoryOptions,
      active: params.category,
    },
    {
      name: 'room',
      label: t('filters.room'),
      allLabel: t('filters.allRooms'),
      options: roomOptions,
      active: params.room,
    },
    {
      name: 'collection',
      label: t('filters.collection'),
      allLabel: t('filters.allCollections'),
      options: facets.collections.map((option) => {
        const filter = toFilterOption(option);
        return { ...filter, image: collectionCovers.get(filter.value) ?? null };
      }),
      active: params.collection,
    },
    {
      name: 'designer',
      label: t('filters.designer'),
      allLabel: t('filters.allDesigners'),
      options: facets.designers.map((option) => {
        const filter = toFilterOption(option);
        return { ...filter, image: portraits.get(filter.value) ?? null };
      }),
      active: params.designer,
      imageTone: 'mono' as const,
    },
  ];

  // As chaves de cada peça por filtro: a contagem de cada opção cruza os outros filtros, ao vivo (retorno de 13/11/2026).
  const matrix = facets.products
    ? buildFacetMatrix(
        facets.products,
        filters.map((filter) => filter.name),
      )
    : null;

  const banner = props.banner?.image && !isWideArt(props.banner.image) ? props.banner : null;
  // Pontos clicáveis sobre a foto do topo (retorno de 13/11/2026).
  const bannerPoints = banner?.image
    ? (await getImagePointsFor(locale, [banner.image]))[banner.image.id]
    : null;

  return (
    <main>
      {/* A chave segue a vista do endereço: a navegação de volta (ou um link com outra vista) recomeça dela. */}
      <CatalogViewProvider key={view} initial={view}>
        {banner?.image ? (
          <PageBanner image={banner.image} title={props.title} morph={banner.morph} points={bannerPoints} />
        ) : null}
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
            filters={filters}
            matrix={matrix}
            formAction={props.formAction}
            hiddenQuery={hiddenQuery}
            pager={
              // Na grade, o "Ver mais" embaixo substitui a paginação (revisão da Franccino, item 11); a tabela técnica
              // continua com as páginas.
              <ByView
                grid={null}
                table={
                  <Pagination
                    meta={page.meta}
                    hrefFor={(next) => hrefFor({ page: next, view: 'table' })}
                    label={t('pagination.label')}
                    position="top"
                  />
                }
              />
            }
          />
          {/* A chave remonta a lista a cada página e a cada filtro: as peças novas entram com a revelação. */}
          <section
            key={`${JSON.stringify(params)}-${page.meta.current_page}`}
            className="catalog-results"
            aria-label={t('resultsLabel')}
          >
            {page.data.length === 0 ? (
              <div className="empty">
                <h2>{t('emptyState.title')}</h2>
                <p className="lead">{t('emptyState.body')}</p>
                <Link
                  className="btn btn--ghost"
                  href={hrefFor({
                    category: undefined,
                    designer: undefined,
                    room: undefined,
                    collection: undefined,
                    q: undefined,
                  })}
                >
                  {t('emptyState.clear')}
                </Link>
              </div>
            ) : (
              <ByView
                grid={<ProductGrid products={page.data} showNew priorityCount={3} />}
                table={<TechTable rows={rows} />}
              />
            )}
          </section>
          {page.data.length > 0 ? (
            <ByView
              table={
                <Pagination
                  meta={page.meta}
                  hrefFor={(next) => hrefFor({ page: next, view: 'table' })}
                  label={t('pagination.label')}
                />
              }
              grid={
                <LoadMore
                  key={`more-${JSON.stringify(params)}-${page.meta.current_page}`}
                  query={{ ...props.apiParams, ...params, page: undefined, per_page: undefined }}
                  page={page.meta.current_page}
                  lastPage={page.meta.last_page}
                  total={page.meta.total}
                  shown={page.data.length}
                  perPage={page.meta.per_page}
                  pageHrefs={Object.fromEntries(
                    Array.from({ length: Math.min(page.meta.last_page, 60) }, (_, index) => [
                      index + 1,
                      hrefFor({ page: index + 1, view: 'grid' }),
                    ]),
                  )}
                />
              }
            />
          ) : null}
        </div>
      </CatalogViewProvider>
      {/* Continuidade: o fim da lista leva às peças que a pessoa já abriu (sem repetir as desta página). */}
      <RecentlyViewed excludeIds={page.data.map((product) => product.id)} />
    </main>
  );
}
