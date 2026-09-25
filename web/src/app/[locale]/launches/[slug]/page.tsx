import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { RichText } from '@/components/content/RichText';
import { ApiImage } from '@/components/media/ApiImage';
import type { Locale } from '@/i18n/config';
import { getLaunch, getLaunches } from '@/lib/api/content';
import { alternateHrefs, buildMetadata } from '@/lib/seo/metadata';

type LaunchPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const launches = await getLaunches(params.locale as Locale);
  return launches.map((launch) => ({ slug: launch.slug }));
}

export async function generateMetadata({ params }: LaunchPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.launchDetail' });
  const launch = await getLaunch(locale as Locale, slug);

  if (!launch) {
    return buildMetadata({
      locale: locale as Locale,
      href: { pathname: '/launches/[slug]', params: { slug } },
      title: t('title'),
    });
  }

  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/launches/[slug]', params: { slug } },
    title: launch.seo.title ?? launch.title,
    description: launch.seo.description ?? launch.summary,
    image: launch.seo.image ?? launch.cover,
    alternates: alternateHrefs(launch.slugs, (slug) => ({ pathname: '/launches/[slug]', params: { slug } })),
  });
}

export default async function LaunchPage({ params }: LaunchPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('sections');
  const launch = await getLaunch(locale as Locale, slug);

  if (!launch) {
    notFound();
  }

  return (
    <main id="main-content">
      <h1>{launch.title}</h1>
      {launch.description && <RichText html={launch.description} />}

      {launch.gallery.length > 0 && (
        <section>
          <h2>{t('gallery')}</h2>
          <ul>
            {launch.gallery.map((image) => (
              <li key={image.id}>
                <ApiImage image={image} sizes="(min-width: 768px) 50vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {launch.products.length > 0 && (
        <section>
          <h2>{t('products')}</h2>
          <ProductGrid products={launch.products} />
        </section>
      )}
    </main>
  );
}
