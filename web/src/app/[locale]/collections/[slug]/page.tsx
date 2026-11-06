import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CardRail } from '@/components/content/CardRail';
import { DesignerPortraits } from '@/components/content/DesignerPortraits';
import { EditorialGallery } from '@/components/content/EditorialGallery';
import { neighbours } from '@/components/content/layout';
import { RichText } from '@/components/content/RichText';
import { PageCoverArt } from '@/components/layout/PageBanner';
import { morphName } from '@/lib/ui/morph';
import { PageHead } from '@/components/layout/PageHead';
import { FeatureCarousel } from '@/components/products/FeatureCarousel';
import { RecentlyViewed } from '@/components/recent/RecentlyViewed';
import type { Locale } from '@/i18n/config';
import { getCollection, getCollections, getDesigners } from '@/lib/api/content';
import { alternateHrefs, buildMetadata } from '@/lib/seo/metadata';
import { fitsFeatureCarousel } from '@/lib/ui/feature-carousel';

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Quantas coleções a faixa "Outras coleções" mostra (as seguintes a esta na ordem do painel). */
const OTHER_COLLECTIONS = 8;

const collectionHref = (slug: string) => ({ pathname: '/collections/[slug]', params: { slug } }) as const;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const collections = await getCollections(params.locale as Locale);
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = await getCollection(locale as Locale, slug);
  if (!collection) {
    return {};
  }
  return buildMetadata({
    locale: locale as Locale,
    href: collectionHref(slug),
    title: collection.seo.title ?? collection.name,
    description: collection.seo.description ?? collection.summary,
    image: collection.seo.image ?? collection.cover,
    alternates: alternateHrefs(collection.slugs, collectionHref),
  });
}

/**
 * Página da coleção (rodada 3): capa parada no topo, título e texto à esquerda e os designers à direita com retrato
 * (as duas colunas começam na altura do título), galeria
 * editorial, as peças e, para continuar, "Outras coleções" numa faixa areia e "Peças que você viu".
 */
export default async function CollectionPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const collection = await getCollection(locale, slug);
  if (!collection) {
    notFound();
  }
  const [t, collections, designers] = await Promise.all([
    getTranslations({ locale, namespace: 'collections' }),
    getCollections(locale),
    collection.designers.length > 0 ? getDesigners(locale) : Promise.resolve([]),
  ]);
  const others = neighbours(collections, (item) => item.id === collection.id, OTHER_COLLECTIONS);
  return (
    <main className="page-end">
      {collection.cover ? (
        <PageCoverArt image={collection.cover} morph={morphName('collection', collection.slug)} />
      ) : null}
      <div className="wrap">
        {/* Título, frase e texto numa coluna; os designers à direita, alinhados pelo alto ao título (06/11/2026). */}
        <PageHead
          title={collection.name}
          lead={collection.summary}
          trail={[{ label: t('title'), href: '/collections' }]}
          aside={
            collection.designers.length > 0 ? (
              <DesignerPortraits
                title={t('designers')}
                designers={collection.designers}
                portraits={designers}
              />
            ) : null
          }
        >
          {collection.description ? (
            <RichText html={collection.description} className="prose collection-intro__text" />
          ) : null}
        </PageHead>
        <EditorialGallery images={collection.gallery} label={t('gallery')} />
        {collection.products.length > 0 ? (
          <section aria-labelledby="collection-pieces" className="page-section">
            <h2 id="collection-pieces" className="section-title">
              {t('piecesTitle')}
            </h2>
            {fitsFeatureCarousel(collection.products.length) ? (
              <FeatureCarousel label={t('piecesTitle')} products={collection.products} />
            ) : (
              <ProductGrid products={collection.products} />
            )}
          </section>
        ) : null}
      </div>
      {others.length > 0 ? (
        <section className="band band--sand" aria-labelledby="other-collections">
          <div className="wrap" data-reveal>
            <h2 id="other-collections" className="section-title">
              {t('othersTitle')}
            </h2>
            <CardRail
              label={t('othersTitle')}
              items={others.map((item) => ({
                id: item.id,
                href: collectionHref(item.slug),
                title: item.name,
                image: item.cover,
              }))}
            />
          </div>
        </section>
      ) : null}
      <RecentlyViewed excludeIds={collection.products.map((product) => product.id)} />
    </main>
  );
}
