import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Pagination } from '@/components/catalog/Pagination';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { Tile } from '@/components/content/Tile';
import { PageHead } from '@/components/layout/PageHead';
import type { Locale } from '@/i18n/config';
import { getProducts, search } from '@/lib/api/catalog';
import { emptyPage } from '@/lib/api/empty';
import { isValidationError } from '@/lib/api/errors';
import { firstValue, parsePositiveInteger, type RawSearchParams } from '@/lib/api/listing-params';
import type { Paginated, ProductCard, SearchResult } from '@/lib/api/types';
import { buildMetadata } from '@/lib/seo/metadata';

const EMPTY_RESULT: SearchResult = { products: [], designers: [], collections: [] };

/** Peças por página na busca, como no catálogo (3 colunas). */
const PER_PAGE = 24;

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'searchPage' });

  return buildMetadata({ locale: locale as Locale, href: '/search', title: t('title'), noindex: true });
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [t, tSearch, catalog] = await Promise.all([
    getTranslations({ locale, namespace: 'searchPage' }),
    getTranslations({ locale, namespace: 'search' }),
    getTranslations({ locale, namespace: 'catalog' }),
  ]);
  const input = await searchParams;
  const query = (firstValue(input.q) ?? '').trim();
  const page = parsePositiveInteger(firstValue(input.page)) ?? 1;

  // A sugestão do cabeçalho e o `GET /search` trazem só as 12 primeiras peças; a página da busca lista todas, com
  // paginação, pela mesma listagem do catálogo (`GET /products?q=`). Designers e coleções vêm do `/search`, só na
  // primeira página (revisão geral de 14/11/2026: "mesa" mostrava 12 de 92 peças).
  let results: SearchResult | null = null;
  let products: Paginated<ProductCard> = emptyPage<ProductCard>();
  if (query.length >= 2) {
    try {
      [results, products] = await Promise.all([
        page === 1 ? search(locale, query) : Promise.resolve(EMPTY_RESULT),
        getProducts(locale, { q: query, page, per_page: PER_PAGE }),
      ]);
    } catch (error) {
      if (!isValidationError(error)) {
        throw error;
      }
      results = EMPTY_RESULT;
    }
  }
  const productTotal = products.meta.total;
  const total = results ? productTotal + results.designers.length + results.collections.length : 0;
  const pageHref = (next: number) => ({
    pathname: '/search' as const,
    query: next > 1 ? { q: query, page: String(next) } : { q: query },
  });

  return (
    <main className="wrap page-end">
      <PageHead title={t('title')} />
      <form className="search-form" role="search">
        <div className="field">
          {/* O título da página já diz "Busca": o rótulo fica só para o leitor de tela. */}
          <label className="visually-hidden" htmlFor="search-q">
            {tSearch('label')}
          </label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder={tSearch('placeholder')}
          />
        </div>
        <button className="btn" type="submit">
          {tSearch('submit')}
        </button>
      </form>
      {results ? (
        <>
          <p className="meta" role="status">
            {tSearch('resultsFor', { query })}
          </p>
          {total === 0 ? (
            <EmptyNotice text={tSearch('noResults')} />
          ) : (
            <>
              {productTotal > 0 ? (
                <section className="result-group" aria-labelledby="results-products" data-page-anchor>
                  <div className="result-group__head">
                    <h2 id="results-products" className="section-title">
                      {t('products')}
                    </h2>
                    <p className="meta num">{catalog('count', { count: productTotal })}</p>
                  </div>
                  <ProductGrid products={products.data} />
                  <Pagination meta={products.meta} hrefFor={pageHref} label={t('pagination')} />
                </section>
              ) : null}
              {results.designers.length > 0 ? (
                <section className="result-group" aria-labelledby="results-designers">
                  <h2 id="results-designers" className="section-title">
                    {t('designers')}
                  </h2>
                  <div className="tiles tiles--four">
                    {results.designers.map((designer) => (
                      <Tile
                        key={designer.id}
                        portrait
                        headingLevel="h3"
                        href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}
                        title={designer.name}
                        image={designer.portrait}
                        text={designer.short_bio}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
              {results.collections.length > 0 ? (
                <section className="result-group" aria-labelledby="results-collections">
                  <h2 id="results-collections" className="section-title">
                    {t('collections')}
                  </h2>
                  <div className="tiles">
                    {results.collections.map((collection) => (
                      <Tile
                        key={collection.id}
                        headingLevel="h3"
                        href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}
                        title={collection.name}
                        image={collection.cover}
                        text={collection.summary}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </>
      ) : null}
    </main>
  );
}
