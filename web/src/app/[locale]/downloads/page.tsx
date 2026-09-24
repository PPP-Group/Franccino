import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApiImage } from '@/components/media/ApiImage';
import { DownloadButton } from '@/components/products/DownloadButton';
import type { Locale } from '@/i18n/config';
import { getDownloads } from '@/lib/api/catalog';
import { buildMetadata } from '@/lib/seo/metadata';

type DownloadsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ area?: string; category?: string; q?: string; page?: string }>;
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
  const { area, category, q, page: pageParam } = await searchParams;
  const page = Number(pageParam);

  const downloads = await getDownloads(locale as Locale, {
    area,
    category,
    q,
    page: Number.isInteger(page) && page > 0 ? page : undefined,
  });

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
                    <DownloadButton fileId={file.id} />
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
