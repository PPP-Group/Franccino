import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getCollections } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type CollectionsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: CollectionsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.collections' });

  return buildMetadata({ locale: locale as Locale, href: '/collections', title: t('title') });
}

export default async function CollectionsPage({ params }: CollectionsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.collections');
  const tCatalog = await getTranslations('catalog');
  const collections = await getCollections(locale as Locale);

  return (
    <main id="main-content">
      <h1>{t('title')}</h1>
      {collections.length === 0 ? (
        <p>{tCatalog('empty')}</p>
      ) : (
        <ul>
          {collections.map((collection) => (
            <li key={collection.id}>
              <Link href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}>
                <ApiImage image={collection.cover} sizes="(min-width: 768px) 33vw, 100vw" />
                <span>{collection.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
