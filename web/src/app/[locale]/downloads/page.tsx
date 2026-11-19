import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHead } from '@/components/layout/PageHead';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { Link, redirect } from '@/i18n/navigation';
import { getPage } from '@/lib/api/content';
import type { RawSearchParams } from '@/lib/api/listing-params';
import { buildMetadata } from '@/lib/seo/metadata';

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

/**
 * Área do Profissional (reunião com a Franccino, 18/11/2026, como a área de downloads da donaflormobilia.com): duas
 * entradas, Blocos 3D (os arquivos de cada peça, com os filtros) e Catálogos. Os links antigos com filtro
 * (`?q=`, `?format=`, da página da peça e de favoritos) vão direto para os blocos, com os mesmos filtros.
 */
export default async function DownloadsPage({ params, searchParams }: DownloadsPageProps) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const query = Object.fromEntries(
    Object.entries(await searchParams).flatMap(([key, value]) => {
      const first = Array.isArray(value) ? value[0] : value;
      return first ? [[key, first]] : [];
    }),
  );
  if (Object.keys(query).length > 0) {
    redirect({ href: { pathname: '/downloads/blocks', query }, locale });
  }
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'downloads' }),
    getPage(locale, 'downloads'),
  ]);
  const entries = [
    { key: 'blocks', href: '/downloads/blocks' as const, title: t('blocks.title'), lead: t('blocks.short') },
    {
      key: 'catalogs',
      href: '/downloads/catalogs' as const,
      title: t('catalogs.title'),
      lead: t('catalogs.short'),
    },
  ];
  return (
    <main className="wrap">
      <PageHead title={page?.title ?? t('title')} lead={page?.intro} />
      <ul className="download-index" data-reveal="stagger">
        {entries.map((entry) => (
          <li key={entry.key}>
            <Link className="download-index__link" href={entry.href}>
              <span className="download-index__copy">
                <span className="download-index__title">{entry.title}</span>
                <span className="download-index__lead">{entry.lead}</span>
              </span>
              <Icon name="arrow" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
