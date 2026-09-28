import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApiImage } from '@/components/media/ApiImage';
import { DownloadButton } from '@/components/products/DownloadButton';
import type { Locale } from '@/i18n/config';
import type { DownloadFile, Paginated, ProductCard } from '@/lib/api/types';
import { getDownloads } from '@/lib/api/catalog';
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
  const t = await getTranslations({ locale, namespace: 'pages.downloads' });

  return buildMetadata({ locale: locale as Locale, href: '/downloads', title: t('title') });
}

export default async function DownloadsPage({ params, searchParams }: DownloadsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.downloads');
  const tCatalog = await getTranslations('catalog');
  const tSearch = await getTranslations('search');
  const rawSearchParams = await searchParams;
  const area = firstValue(rawSearchParams.area);
  const category = firstValue(rawSearchParams.category);
  const q = firstValue(rawSearchParams.q);
  const page = parsePositiveInteger(firstValue(rawSearchParams.page));

  let downloads: Paginated<DownloadCard>;
  try {
    downloads = await getDownloads(locale as Locale, { area, category, q, page });
  } catch (error) {
    if (!isValidationError(error)) {
      throw error;
    }
    downloads = EMPTY_DOWNLOADS;
  }

  return (
    <main id="main-content">
      <h1>{t('title')}</h1>

      <form>
        <label htmlFor="downloads-q">{tSearch('label')}</label>
        <input id="downloads-q" name="q" type="search" defaultValue={q} />
        <button type="submit">{tSearch('submit')}</button>
      </form>

      {downloads.data.length === 0 ? (
        <p>{tCatalog('empty')}</p>
      ) : (
        <ul>
          {downloads.data.map((product) => (
            <li key={product.id}>
              <ApiImage image={product.cover} sizes="(min-width: 768px) 25vw, 50vw" />
              <span>{product.name}</span>
              <ul>
                {product.files.map((file) => (
                  <li key={file.id}>
                    <span>{file.title}</span>
                    <DownloadButton file={file} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
