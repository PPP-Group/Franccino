import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CollectionTile } from '@/components/content/CollectionTile';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { PageHead } from '@/components/layout/PageHead';
import type { Locale } from '@/i18n/config';
import { getCollections } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'collections' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/collections' },
    title: t('title'),
    description: t('description'),
  });
}

export default async function CollectionsPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, collections] = await Promise.all([
    getTranslations({ locale, namespace: 'collections' }),
    getTranslations({ locale, namespace: 'common' }),
    getCollections(locale),
  ]);
  return (
    <main>
      <div className="wrap">
        <PageHead title={t('title')} centered />
      </div>
      {collections.length === 0 ? (
        <div className="wrap">
          <EmptyNotice text={common('nothingYet')} />
        </div>
      ) : (
        <div className="collection-grid">
          {collections.map((collection, index) => (
            <CollectionTile key={collection.id} collection={collection} priority={index < 2} />
          ))}
        </div>
      )}
    </main>
  );
}
