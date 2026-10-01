import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { RichText } from '@/components/content/RichText';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getCollection, getCollections } from '@/lib/api/content';
import { alternateHrefs, buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string; slug: string }> };

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

export default async function CollectionPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const collection = await getCollection(locale, slug);
  if (!collection) {
    notFound();
  }
  const t = await getTranslations({ locale, namespace: 'collections' });
  return (
    <main className="wrap">
      <PageHead
        title={collection.name}
        lead={collection.summary}
        trail={[{ label: t('title'), href: '/collections' }]}
        meta={
          <ul className="meta meta-inline num">
            {collection.year ? <li>{collection.year}</li> : null}
            <li>{t('pieces', { count: collection.product_count })}</li>
          </ul>
        }
      />
      <div className="detail-hero">
        <div className="detail-hero__media">
          {collection.cover ? (
            <ApiImage image={collection.cover} sizes="(max-width: 56.25rem) 100vw, 58vw" priority />
          ) : null}
        </div>
        <div className="detail-hero__copy">
          {collection.description ? <RichText html={collection.description} className="prose" /> : null}
          {collection.designers.length > 0 ? (
            <dl className="facts">
              <div>
                <dt>{t('designers')}</dt>
                <dd>
                  <ul className="meta-inline">
                    {collection.designers.map((designer) => (
                      <li key={designer.id}>
                        <Link href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}>
                          {designer.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>
      {collection.gallery.length > 0 ? (
        <ul className="gallery-strip" aria-label={t('gallery')}>
          {collection.gallery.map((picture) => (
            <li key={picture.id}>
              <ApiImage image={picture} sizes="(max-width: 35rem) 100vw, 33vw" />
            </li>
          ))}
        </ul>
      ) : null}
      {collection.products.length > 0 ? (
        <section aria-labelledby="collection-pieces" className="section--tight">
          <h2 id="collection-pieces" className="section-title">
            {t('piecesTitle')}
          </h2>
          <ProductGrid products={collection.products} />
        </section>
      ) : null}
    </main>
  );
}
