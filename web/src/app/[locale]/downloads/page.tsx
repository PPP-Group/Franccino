import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { Pagination } from '@/components/catalog/Pagination';
import { DownloadsTable } from '@/components/downloads/DownloadsTable';
import { PageHead } from '@/components/layout/PageHead';
import { Select } from '@/components/ui/Select';
import type { Locale } from '@/i18n/config';
import type { DownloadFile, Paginated, ProductCard } from '@/lib/api/types';
import { getAreas, getDownloads } from '@/lib/api/catalog';
import { getPage } from '@/lib/api/content';
import { isValidationError } from '@/lib/api/errors';
import { firstValue, parsePositiveInteger, type RawSearchParams } from '@/lib/api/listing-params';
import { buildMetadata } from '@/lib/seo/metadata';

type DownloadCard = ProductCard & { files: DownloadFile[] };

const EMPTY_DOWNLOADS: Paginated<DownloadCard> = {
  data: [],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, last_page: 1, per_page: 24, total: 0 },
};

type DownloadsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: DownloadsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'downloads' }),
    getPage(locale as Locale, 'downloads'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/downloads' },
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro,
  });
}

export default async function DownloadsPage({ params, searchParams }: DownloadsPageProps) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [t, page, areas] = await Promise.all([
    getTranslations({ locale, namespace: 'downloads' }),
    getPage(locale, 'downloads'),
    getAreas(locale),
  ]);
  const rawSearchParams = await searchParams;
  const area = firstValue(rawSearchParams.area);
  const category = firstValue(rawSearchParams.category);
  const q = firstValue(rawSearchParams.q);
  const currentPage = parsePositiveInteger(firstValue(rawSearchParams.page));

  let downloads: Paginated<DownloadCard>;
  try {
    downloads = await getDownloads(locale, { area, category, q, page: currentPage });
  } catch (error) {
    if (!isValidationError(error)) {
      throw error;
    }
    downloads = EMPTY_DOWNLOADS;
  }

  const pageHref = (next: number) =>
    ({
      pathname: '/downloads',
      query: {
        ...(area ? { area } : {}),
        ...(category ? { category } : {}),
        ...(q ? { q } : {}),
        page: String(next),
      },
    }) as const;

  return (
    <main className="wrap catalog" data-page-anchor="">
      <PageHead
        title={page?.title ?? t('title')}
        lead={page?.intro}
        meta={<p className="meta num">{t('count', { count: downloads.meta.total })}</p>}
      />
      <form className="search-form" role="search">
        <div className="field">
          <label id="downloads-area-label" htmlFor="downloads-area">
            {t('filters.area')}
          </label>
          <Select
            id="downloads-area"
            labelId="downloads-area-label"
            name="area"
            defaultValue={area ?? ''}
            options={[
              { value: '', label: t('filters.allAreas') },
              ...areas.map((option) => ({ value: option.key, label: option.brand_name })),
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="downloads-q">{t('filters.search')}</label>
          <input id="downloads-q" name="q" type="search" defaultValue={q} />
        </div>
        {category ? <input type="hidden" name="category" value={category} /> : null}
        <button className="btn" type="submit">
          {t('filters.submit')}
        </button>
      </form>
      {downloads.data.length === 0 ? (
        <EmptyNotice text={t('empty')} />
      ) : (
        <>
          <div className="toolbar">
            <Pagination meta={downloads.meta} label={t('pagination')} hrefFor={pageHref} position="top" />
          </div>
          {/* A chave remonta a tabela a cada página: as linhas novas entram com fade, não de uma vez. */}
          <div key={downloads.meta.current_page} className="catalog-results">
            <DownloadsTable rows={downloads.data} />
          </div>
        </>
      )}
      <Pagination meta={downloads.meta} label={t('pagination')} hrefFor={pageHref} />
    </main>
  );
}
