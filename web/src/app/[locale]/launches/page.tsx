import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LaunchTile } from '@/components/catalog/LaunchTile';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import type { Locale } from '@/i18n/config';
import { getLaunches } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'catalog.launches' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/launches' },
    title: t('title'),
    description: t('intro'),
  });
}

export default async function LaunchesPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, launches] = await Promise.all([
    getTranslations({ locale, namespace: 'catalog.launches' }),
    getTranslations({ locale, namespace: 'common' }),
    getLaunches(locale),
  ]);
  return (
    <main className="wrap catalog">
      <Breadcrumbs
        label={common('breadcrumb')}
        items={[{ label: common('home'), href: '/' }, { label: t('title') }]}
      />
      <div className="catalog-head">
        <div className="catalog-head__copy">
          <h1>{t('title')}</h1>
          <p className="lead">{t('intro')}</p>
        </div>
      </div>
      {launches.length > 0 ? (
        <div className="grid-plates catalog-results">
          {launches.map((launch) => (
            <LaunchTile key={launch.id} launch={launch} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p className="lead">{t('empty')}</p>
        </div>
      )}
    </main>
  );
}
