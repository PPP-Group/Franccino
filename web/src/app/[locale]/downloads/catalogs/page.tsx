import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import { DownloadButton } from '@/components/products/DownloadButton';
import type { Locale } from '@/i18n/config';
import { getCatalogDownloads } from '@/lib/api/catalog';
import { getPage } from '@/lib/api/content';
import { formatFileSize } from '@/lib/format/file-size';
import { buildMetadata } from '@/lib/seo/metadata';

type CatalogsPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: CatalogsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'downloads' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/downloads/catalogs' },
    title: t('catalogs.title'),
    description: t('catalogs.lead'),
  });
}

/**
 * Catálogos para baixar (reunião de 18/11/2026, como a donaflormobilia.com): um card por catálogo, com a capa do dono
 * (peça, lançamento ou designer), o nome, o formato e o tamanho. Baixar pede o cadastro, como os outros arquivos.
 * Os catálogos entram no painel como arquivo do tipo "Catálogo" numa peça, num designer ou num lançamento.
 */
export default async function CatalogsPage({ params }: CatalogsPageProps) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, page, catalogs] = await Promise.all([
    getTranslations({ locale, namespace: 'downloads' }),
    getPage(locale, 'downloads'),
    getCatalogDownloads(locale),
  ]);
  return (
    <main className="wrap">
      <PageHead
        title={t('catalogs.title')}
        lead={t('catalogs.lead')}
        trail={[{ label: page?.title ?? t('title'), href: '/downloads' }]}
      />
      {catalogs.length === 0 ? (
        <EmptyNotice text={t('catalogs.empty')} />
      ) : (
        <ul className="catalog-files" data-reveal="stagger">
          {catalogs.map(({ file, owner, cover }) => (
            <li key={file.id} className="catalog-file">
              <div className="catalog-file__cover">
                {cover ? <ApiImage image={cover} sizes="(max-width: 35rem) 50vw, 240px" /> : null}
              </div>
              <h2 className="catalog-file__title">{file.title}</h2>
              <p className="catalog-file__meta">
                {owner.name}
                {' · '}
                {file.format}
                {file.size ? ` · ${formatFileSize(file.size, locale)}` : null}
              </p>
              <DownloadButton file={file} variant="link" label={t('catalogs.download')} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
