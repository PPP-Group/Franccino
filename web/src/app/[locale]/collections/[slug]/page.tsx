import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { RichText } from '@/components/content/RichText';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getCollection, getCollections } from '@/lib/api/content';
import { buildMetadata, type Href } from '@/lib/seo/metadata';

type CollectionPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const collections = await getCollections(params.locale as Locale);
  return collections.map((collection) => ({ slug: collection.slug }));
}

function alternateHrefs(slugs: Record<Locale, string | null>): Partial<Record<Locale, Href | null>> {
  const alternates: Partial<Record<Locale, Href | null>> = {};
  for (const locale of locales) {
    const slug = slugs[locale];
    alternates[locale] = slug ? { pathname: '/collections/[slug]', params: { slug } } : null;
  }
  return alternates;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.collectionDetail' });
  const collection = await getCollection(locale as Locale, slug);

  if (!collection) {
    return buildMetadata({
      locale: locale as Locale,
      href: { pathname: '/collections/[slug]', params: { slug } },
      title: t('title'),
    });
  }

  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/collections/[slug]', params: { slug } },
    title: collection.seo.title ?? collection.name,
    description: collection.seo.description ?? collection.summary,
    image: collection.seo.image ?? collection.cover,
    alternates: alternateHrefs(collection.slugs),
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('sections');
  const collection = await getCollection(locale as Locale, slug);

  if (!collection) {
    notFound();
  }

  return (
    <main id="main-content">
      <h1>{collection.name}</h1>
      {collection.description && <RichText html={collection.description} />}

      {collection.gallery.length > 0 && (
        <section>
          <h2>{t('gallery')}</h2>
          <ul>
            {collection.gallery.map((image) => (
              <li key={image.id}>
                <ApiImage image={image} sizes="(min-width: 768px) 50vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {collection.designers.length > 0 && (
        <section>
          <h2>{t('designers')}</h2>
          <ul>
            {collection.designers.map((designer) => (
              <li key={designer.id}>
                <Link href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}>
                  {designer.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {collection.products.length > 0 && (
        <section>
          <h2>{t('products')}</h2>
          <ProductGrid products={collection.products} />
        </section>
      )}
    </main>
  );
}
