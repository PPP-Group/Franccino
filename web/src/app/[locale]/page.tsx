import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getHome } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.home' });

  return buildMetadata({ locale: locale as Locale, href: '/', title: t('title') });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.home');
  const tSections = await getTranslations('sections');
  const home = await getHome(locale as Locale);

  return (
    <main id="main-content">
      <h1>{t('title')}</h1>

      {home.banners.length > 0 && (
        <ul>
          {home.banners.map((banner, index) => (
            <li key={index}>
              <ApiImage image={banner.image} sizes="100vw" priority={index === 0} />
              <p>{banner.title}</p>
              {banner.cta_url && banner.cta_label && <a href={banner.cta_url}>{banner.cta_label}</a>}
            </li>
          ))}
        </ul>
      )}

      {home.current_launch && (
        <p>
          <Link href={{ pathname: '/launches/[slug]', params: { slug: home.current_launch.slug } }}>
            {home.current_launch.title}
          </Link>
        </p>
      )}

      <section>
        <h2>{tSections('products')}</h2>
        <ProductGrid products={home.featured_products} />
      </section>

      {home.featured_collections.length > 0 && (
        <section>
          <h2>{tSections('collections')}</h2>
          <ul>
            {home.featured_collections.map((collection) => (
              <li key={collection.id}>
                <Link href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}>
                  <ApiImage image={collection.cover} sizes="(min-width: 768px) 33vw, 100vw" />
                  <span>{collection.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {home.designers.length > 0 && (
        <section>
          <h2>{tSections('designers')}</h2>
          <ul>
            {home.designers.map((designer) => (
              <li key={designer.id}>
                <Link href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}>
                  <ApiImage image={designer.portrait} sizes="(min-width: 768px) 25vw, 50vw" />
                  <span>{designer.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
