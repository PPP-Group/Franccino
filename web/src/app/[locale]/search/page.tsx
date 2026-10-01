import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { Tile } from '@/components/content/Tile';
import { PageHead } from '@/components/layout/PageHead';
import type { Locale } from '@/i18n/config';
import { search } from '@/lib/api/catalog';
import { isValidationError } from '@/lib/api/errors';
import { firstValue, type RawSearchParams } from '@/lib/api/listing-params';
import type { SearchResult } from '@/lib/api/types';
import { buildMetadata } from '@/lib/seo/metadata';

const EMPTY_RESULT: SearchResult = { products: [], designers: [], collections: [] };

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

  const [t, tSearch] = await Promise.all([
    getTranslations({ locale, namespace: 'searchPage' }),
    getTranslations({ locale, namespace: 'search' }),
  ]);
  const query = (firstValue((await searchParams).q) ?? '').trim();

  let results: SearchResult | null = null;
  if (query.length >= 2) {
    try {
      results = await search(locale, query);
    } catch (error) {
      if (!isValidationError(error)) {
        throw error;
      }
      results = EMPTY_RESULT;
    }
  }
  const total = results ? results.products.length + results.designers.length + results.collections.length : 0;

  return (
    <main className="wrap">
      <PageHead title={t('title')} />
      <form className="search-form" role="search">
        <div className="field">
          <label htmlFor="search-q">{tSearch('label')}</label>
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
              {results.products.length > 0 ? (
                <section className="result-group" aria-labelledby="results-products">
                  <h2 id="results-products" className="section-title">
                    {t('products')}
                  </h2>
                  <ProductGrid products={results.products} />
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
