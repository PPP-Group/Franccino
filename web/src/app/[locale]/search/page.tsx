import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { search } from '@/lib/api/catalog';
import { buildMetadata } from '@/lib/seo/metadata';

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.search' });

  return buildMetadata({ locale: locale as Locale, href: '/search', title: t('title'), noindex: true });
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.search');
  const tSearch = await getTranslations('search');
  const tSections = await getTranslations('sections');
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = query.length >= 2 ? await search(locale as Locale, query) : null;

  return (
    <main id="main-content">
      <h1>{t('title')}</h1>

      <form>
        <label htmlFor="search-q">{tSearch('label')}</label>
        <input
          id="search-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder={tSearch('placeholder')}
        />
        <button type="submit">{tSearch('submit')}</button>
      </form>

      {results && (
        <>
          <p>{tSearch('resultsFor', { query })}</p>

          {results.products.length === 0 &&
          results.designers.length === 0 &&
          results.collections.length === 0 ? (
            <p>{tSearch('noResults')}</p>
          ) : (
            <>
              {results.products.length > 0 && (
                <section>
                  <h2>{tSections('products')}</h2>
                  <ul>
                    {results.products.map((product) => (
                      <li key={product.id}>
                        <Link href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}>
                          <ApiImage image={product.cover} sizes="(min-width: 768px) 25vw, 50vw" />
                          <span>{product.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {results.designers.length > 0 && (
                <section>
                  <h2>{tSections('designers')}</h2>
                  <ul>
                    {results.designers.map((designer) => (
                      <li key={designer.id}>
                        <Link href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}>
                          {designer.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {results.collections.length > 0 && (
                <section>
                  <h2>{tSections('collections')}</h2>
                  <ul>
                    {results.collections.map((collection) => (
                      <li key={collection.id}>
                        <Link href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}>
                          {collection.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
