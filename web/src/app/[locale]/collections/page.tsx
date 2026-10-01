import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { Tile } from '@/components/content/Tile';
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
    <main className="wrap">
      <PageHead
        title={t('title')}
        meta={<p className="meta num">{t('count', { count: collections.length })}</p>}
      />
      {collections.length === 0 ? (
        <EmptyNotice text={common('nothingYet')} />
      ) : (
        <div className="tiles">
          {collections.map((collection, index) => (
            <Tile
              key={collection.id}
              href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}
              title={collection.name}
              image={collection.cover}
              meta={[
                ...(collection.year ? [String(collection.year)] : []),
                t('pieces', { count: collection.product_count }),
              ]}
              text={collection.summary}
              priority={index < 3}
            />
          ))}
        </div>
      )}
    </main>
  );
}
