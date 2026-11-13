import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PiecesSection } from '@/components/catalog/PiecesSection';
import { CardRail } from '@/components/content/CardRail';
import { DesignerPortraits } from '@/components/content/DesignerPortraits';
import { EditorialGallery } from '@/components/content/EditorialGallery';
import { GalleryDialog } from '@/components/content/GalleryDialog';
import { neighbours } from '@/components/content/layout';
import { RichText } from '@/components/content/RichText';
import { PageCoverArt } from '@/components/layout/PageBanner';
import { ApiImage } from '@/components/media/ApiImage';
import { PageVideo } from '@/components/media/PageVideo';
import { fixedBoxCoverSizes } from '@/lib/images/cover-sizes';
import { morphName } from '@/lib/ui/morph';
import { PageHead } from '@/components/layout/PageHead';
import { RecentlyViewed } from '@/components/recent/RecentlyViewed';
import type { Locale } from '@/i18n/config';
import { getCollection, getCollections, getDesigners } from '@/lib/api/content';
import { alternateHrefs, buildMetadata } from '@/lib/seo/metadata';

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

/** Miniaturas da galeria embaixo do texto da coleção. */
const GALLERY_PREVIEWS = 3;

/**
 * Página da coleção (rodada 3): capa parada no topo, título e texto à esquerda e os designers à direita com retrato
 * (as duas colunas começam na altura do título). Revisão de 13/11/2026: as peças vêm logo depois da introdução; a
 * galeria fica em miniaturas embaixo do texto, com "Ver imagens" abrindo todas; o vídeo vem depois das peças. Para
 * continuar, "Outras coleções" numa faixa areia e "Peças que você viu".
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
          {collection.gallery.length > 0 ? (
            <GalleryDialog
              title={t('gallery')}
              count={collection.gallery.length}
              previews={collection.gallery.slice(0, GALLERY_PREVIEWS).map((image) => (
                <ApiImage
                  key={image.id}
                  image={image}
                  sizes={fixedBoxCoverSizes(image, 1, [{ width: '96px' }])}
                />
              ))}
            >
              <EditorialGallery images={collection.gallery} label={t('gallery')} />
            </GalleryDialog>
          ) : null}
        </PageHead>
        <PiecesSection
          id="collection-pieces"
          title={t('piecesTitle')}
          locale={locale}
          products={collection.products}
        />
        {collection.video ? (
          <PageVideo
            video={collection.video}
            title={t('video', { name: collection.name })}
            id="collection-video"
          />
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
                morph: morphName('collection', item.slug),
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
