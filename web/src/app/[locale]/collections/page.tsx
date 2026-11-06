import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CollectionTile, TILE_RATIO, TILE_SLOTS } from '@/components/content/CollectionTile';
import { CoverTile } from '@/components/content/CoverTile';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { missingCells } from '@/components/content/layout';
import { PageHead } from '@/components/layout/PageHead';
import type { Locale } from '@/i18n/config';
import { getCollections, getLaunches } from '@/lib/api/content';
import { fixedBoxCoverSizes } from '@/lib/images/cover-sizes';
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
  const [t, common, collections, launches] = await Promise.all([
    getTranslations({ locale, namespace: 'collections' }),
    getTranslations({ locale, namespace: 'common' }),
    getCollections(locale),
    getLaunches(locale),
  ]);
  // Grade sempre completa (rodada 3): com um número ímpar de coleções, a última célula da grade de 2 colunas recebe
  // o lançamento mais recente com capa ou, sem ele, a chamada para todas as peças. No celular (1 coluna) também cabe.
  const launch = launches.find((item) => item.cover !== null) ?? null;
  const fill = missingCells(collections.length, 2) > 0;
  return (
    <main className="page-end">
      <div className="wrap">
        <PageHead title={t('title')} centered />
      </div>
      {collections.length === 0 ? (
        <div className="wrap">
          <EmptyNotice text={common('nothingYet')} />
        </div>
      ) : (
        <div className="collection-grid" data-reveal="stagger">
          {collections.map((collection, index) => (
            <CollectionTile key={collection.id} collection={collection} priority={index < 2} />
          ))}
          {fill && launch ? (
            <CoverTile
              href={{ pathname: '/launches/[slug]', params: { slug: launch.slug } }}
              title={launch.title}
              cta={t('fillLaunch')}
              image={launch.cover}
              sizes={fixedBoxCoverSizes(launch.cover, TILE_RATIO, TILE_SLOTS)}
              labelled
            />
          ) : null}
          {fill && !launch ? (
            <CoverTile
              href="/products"
              title={t('fillAllTitle')}
              cta={t('fillAllCta')}
              image={null}
              sizes="50vw"
              labelled
            />
          ) : null}
        </div>
      )}
    </main>
  );
}
