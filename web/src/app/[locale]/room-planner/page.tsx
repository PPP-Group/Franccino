import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RoomPlanner } from '@/components/planner/RoomPlanner';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import type { Locale } from '@/i18n/config';
import { loadPlannerProducts } from '@/lib/planner/data';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

const LIBRARY_SIZE = 24;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'planner.meta' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/room-planner' },
    title: t('title'),
    description: t('description'),
  });
}

export default async function RoomPlannerPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, library] = await Promise.all([
    getTranslations({ locale, namespace: 'planner' }),
    getTranslations({ locale, namespace: 'common' }),
    loadPlannerProducts(locale, { sort: 'featured', per_page: LIBRARY_SIZE }),
  ]);
  return (
    <main className="wrap">
      <Breadcrumbs
        label={common('breadcrumb')}
        items={[{ label: common('home'), href: '/' }, { label: t('title') }]}
      />
      <div className="catalog-head catalog-head--tight">
        <div className="catalog-head__copy">
          <h1>{t('title')}</h1>
          <p className="lead">{t('intro')}</p>
        </div>
      </div>
      <RoomPlanner initialLibrary={library} />
    </main>
  );
}
